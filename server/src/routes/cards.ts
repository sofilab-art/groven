import { Router, Request, Response } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';
import { CARD_TYPES, LINK_RELATIONS } from '../types';
import { classifyCard, generateTitle, generateLineage, reclassify } from '../llm';

const router = Router();

router.get('/rooms/:roomId/cards', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.display_name AS author_name
      FROM cards c
      JOIN users u ON c.author_id = u.id
      WHERE c.room_id = $1
      ORDER BY c.created_at ASC
    `, [req.params.roomId]);
    res.json(result.rows);
  } catch (err) {
    console.error('List cards error:', err);
    res.status(500).json({ error: 'Failed to list cards' });
  }
});

router.get('/rooms/:roomId/graph', async (req: Request, res: Response) => {
  try {
    const cardsResult = await pool.query(`
      SELECT c.*, u.display_name AS author_name,
        COALESCE((SELECT COUNT(*) FILTER (WHERE tv.position = 'support') FROM temperature_votes tv WHERE tv.card_id = c.id), 0) AS vote_support,
        COALESCE((SELECT COUNT(*) FILTER (WHERE tv.position = 'oppose') FROM temperature_votes tv WHERE tv.card_id = c.id), 0) AS vote_oppose
      FROM cards c
      JOIN users u ON c.author_id = u.id
      WHERE c.room_id = $1
      ORDER BY c.created_at ASC
    `, [req.params.roomId]);

    const cardIds = cardsResult.rows.map(c => c.id);
    let linksResult = { rows: [] as any[] };
    if (cardIds.length > 0) {
      linksResult = await pool.query(`
        SELECT l.* FROM links l
        WHERE l.source_card_id = ANY($1) OR l.target_card_id = ANY($1)
      `, [cardIds]);
    }

    // Attach readings to cards
    let readingsResult = { rows: [] as any[] };
    if (cardIds.length > 0) {
      readingsResult = await pool.query(
        'SELECT * FROM readings WHERE card_id = ANY($1) ORDER BY created_at ASC',
        [cardIds]
      );
    }
    const readingsByCard: Record<string, any[]> = {};
    for (const r of readingsResult.rows) {
      if (!readingsByCard[r.card_id]) readingsByCard[r.card_id] = [];
      readingsByCard[r.card_id].push(r);
    }
    const cards = cardsResult.rows.map(c => ({
      ...c,
      vote_support: Number(c.vote_support),
      vote_oppose: Number(c.vote_oppose),
      readings: readingsByCard[c.id] || [],
    }));

    res.json({ cards, links: linksResult.rows });
  } catch (err) {
    console.error('Graph error:', err);
    res.status(500).json({ error: 'Failed to get graph' });
  }
});

router.get('/cards/:id', async (req: Request, res: Response) => {
  try {
    const cardResult = await pool.query(`
      SELECT c.*, u.display_name AS author_name
      FROM cards c JOIN users u ON c.author_id = u.id
      WHERE c.id = $1
    `, [req.params.id]);
    if (cardResult.rows.length === 0) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }
    const card = cardResult.rows[0];
    const [readings, linksOut, linksIn, votes] = await Promise.all([
      pool.query('SELECT r.*, u.display_name AS reader_name FROM readings r LEFT JOIN users u ON r.reader_id = u.id WHERE r.card_id = $1 ORDER BY r.created_at ASC', [card.id]),
      pool.query(`SELECT l.*, c.title AS target_title, c.card_type AS target_type FROM links l JOIN cards c ON l.target_card_id = c.id WHERE l.source_card_id = $1`, [card.id]),
      pool.query(`SELECT l.*, c.title AS source_title, c.card_type AS source_type FROM links l JOIN cards c ON l.source_card_id = c.id WHERE l.target_card_id = $1`, [card.id]),
      pool.query(`SELECT tv.*, u.display_name AS voter_name FROM temperature_votes tv JOIN users u ON tv.voter_id = u.id WHERE tv.card_id = $1 ORDER BY tv.created_at ASC`, [card.id]),
    ]);

    const voteSupport = votes.rows.filter(v => v.position === 'support').length;
    const voteOppose = votes.rows.filter(v => v.position === 'oppose').length;

    // Get room and space info for breadcrumb
    const roomResult = await pool.query(`
      SELECT r.*, s.title AS space_title, s.id AS space_id
      FROM rooms r JOIN spaces s ON r.space_id = s.id
      WHERE r.id = $1
    `, [card.room_id]);

    res.json({
      ...card,
      readings: readings.rows,
      links_out: linksOut.rows,
      links_in: linksIn.rows,
      votes: votes.rows,
      vote_support: voteSupport,
      vote_oppose: voteOppose,
      room: roomResult.rows[0] || null,
    });
  } catch (err) {
    console.error('Get card error:', err);
    res.status(500).json({ error: 'Failed to get card' });
  }
});

router.post('/rooms/:roomId/cards', requireAuth, async (req: Request, res: Response) => {
  try {
    const { body, card_type, is_question, title, lineage_desc, parent_card_id, link_relation, readings: readingsData } = req.body;
    if (!body) {
      res.status(400).json({ error: 'body is required' });
      return;
    }
    const finalType = card_type && CARD_TYPES.includes(card_type) ? card_type : 'claim';

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const cardResult = await client.query(
        `INSERT INTO cards (room_id, author_id, card_type, is_question, title, body, lineage_desc)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [req.params.roomId, req.session.userId, finalType, is_question || false, title || null, body, lineage_desc || null]
      );
      const card = cardResult.rows[0];

      // Create link from new card to parent if specified
      if (parent_card_id && link_relation && LINK_RELATIONS.includes(link_relation)) {
        await client.query(
          'INSERT INTO links (source_card_id, target_card_id, relation_type) VALUES ($1, $2, $3)',
          [card.id, parent_card_id, link_relation]
        );
      }

      // Create readings if provided
      if (readingsData && Array.isArray(readingsData)) {
        for (const reading of readingsData) {
          await client.query(
            `INSERT INTO readings (card_id, reader_type, reader_id, proposed_type, is_question, explanation, rethink_explanation, model_used)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              card.id,
              reading.reader_type,
              reading.reader_type === 'ai' ? null : req.session.userId,
              reading.proposed_type,
              reading.is_question || false,
              reading.explanation || null,
              reading.rethink_explanation || null,
              reading.model_used || null,
            ]
          );
        }
      }

      await client.query('COMMIT');
      res.status(201).json(card);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Create card error:', err);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

router.post('/cards/:id/links', requireAuth, async (req: Request, res: Response) => {
  try {
    const { target_card_id, source_card_id, relation_type } = req.body;
    if (!relation_type || !LINK_RELATIONS.includes(relation_type)) {
      res.status(400).json({ error: 'Valid relation_type is required' });
      return;
    }
    const src = source_card_id || req.params.id;
    const tgt = target_card_id || req.params.id;
    const result = await pool.query(
      'INSERT INTO links (source_card_id, target_card_id, relation_type) VALUES ($1, $2, $3) RETURNING *',
      [src, tgt, relation_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create link error:', err);
    res.status(500).json({ error: 'Failed to create link' });
  }
});

// SSE preview endpoint
router.post('/cards/preview', requireAuth, async (req: Request, res: Response) => {
  const { body, parent_id, parent_card_id: parentCardId } = req.body;
  const parentId = parent_id || parentCardId;
  if (!body) {
    res.status(400).json({ error: 'body is required' });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    let parentBody = '';
    if (parentId) {
      const parentResult = await pool.query('SELECT body FROM cards WHERE id = $1', [parentId]);
      if (parentResult.rows.length === 0) {
        sendEvent('error', { error: 'Parent card not found' });
        res.end();
        return;
      }
      parentBody = parentResult.rows[0].body;
    }

    // Step 1: Classification
    const classification = await classifyCard(parentBody, body);
    if (classification) {
      sendEvent('classification', classification);
    } else {
      sendEvent('classification', { proposed_type: 'claim', proposed_relation: 'builds_on', is_question: false, confidence: 0, explanation: 'Classification unavailable.' });
    }

    // Step 2: Title and lineage in parallel
    const proposedType = classification?.proposed_type || 'claim';
    const isQuestion = classification?.is_question || false;

    const [titleResult, lineageResult] = await Promise.all([
      generateTitle(parentBody || '', body, proposedType, isQuestion),
      parentBody ? generateLineage(parentBody, body, proposedType) : Promise.resolve(''),
    ]);

    sendEvent('title', { title: titleResult });
    sendEvent('lineage', { lineage: lineageResult });
    sendEvent('done', {});
  } catch (err) {
    console.error('Preview error:', err);
    sendEvent('error', { error: 'Preview failed' });
  }
  res.end();
});

// Reclassify endpoint
router.post('/cards/reclassify', requireAuth, async (req: Request, res: Response) => {
  try {
    const { parent_card_id, body, chosen_type, original_type, original_explanation } = req.body;
    if (!body || !chosen_type || !original_type) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    let parentBody = '';
    if (parent_card_id) {
      const parentResult = await pool.query('SELECT body FROM cards WHERE id = $1', [parent_card_id]);
      if (parentResult.rows.length > 0) {
        parentBody = parentResult.rows[0].body;
      }
    }
    const result = await reclassify(parentBody, body, original_type, original_explanation || '', chosen_type);
    if (result) {
      res.json(result);
    } else {
      res.json({ explanation: 'Reclassification unavailable.', is_question: false });
    }
  } catch (err) {
    console.error('Reclassify error:', err);
    res.status(500).json({ error: 'Reclassification failed' });
  }
});

export default router;
