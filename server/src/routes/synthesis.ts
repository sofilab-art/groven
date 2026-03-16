import { Router, Request, Response } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';
import { suggestSynthesisStream, generateProposalSummary } from '../llm';

const router = Router();

router.post('/spaces/:spaceId/suggest-synthesis', requireAuth, async (req: Request, res: Response) => {
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
    // Get all cards and links in this space
    const cardsResult = await pool.query(`
      SELECT c.id, c.card_type, c.title, c.body, u.display_name AS author_name
      FROM cards c
      JOIN users u ON c.author_id = u.id
      JOIN rooms r ON c.room_id = r.id
      WHERE r.space_id = $1
      ORDER BY c.created_at ASC
    `, [req.params.spaceId]);

    if (cardsResult.rows.length < 3) {
      sendEvent('error', { error: 'Need at least 3 cards for synthesis suggestions' });
      res.end();
      return;
    }

    const cardIds = cardsResult.rows.map(c => c.id);
    const linksResult = await pool.query(`
      SELECT * FROM links
      WHERE source_card_id = ANY($1) AND target_card_id = ANY($1)
    `, [cardIds]);

    // Get space title
    const spaceResult = await pool.query('SELECT title FROM spaces WHERE id = $1', [req.params.spaceId]);
    const spaceTitle = spaceResult.rows[0]?.title || 'Untitled';

    const stream = suggestSynthesisStream(spaceTitle, cardsResult.rows, linksResult.rows);

    for await (const event of stream) {
      if (event.type === 'reasoning') {
        sendEvent('reasoning', { text: event.data });
      } else if (event.type === 'done') {
        // Enrich suggestions with proposal summaries and card info
        sendEvent('status', { text: 'Generating proposal summaries...' });
        const enriched = [];
        for (const s of event.data) {
          const proposalSummary = await generateProposalSummary(s.body);
          const parentCard = cardsResult.rows.find(c => c.id === s.parent_id);
          const refCards = (s.referenced_ids || []).map((id: string) => cardsResult.rows.find(c => c.id === id)).filter(Boolean);
          enriched.push({
            ...s,
            proposal_summary: proposalSummary,
            parent_title: parentCard?.title || 'Untitled',
            parent_author: parentCard?.author_name || 'Unknown',
            referenced_cards: refCards.map((c: any) => ({ id: c.id, title: c.title, author_name: c.author_name })),
          });
        }
        sendEvent('suggestions', { suggestions: enriched });
      } else if (event.type === 'error') {
        sendEvent('error', { error: event.data });
      }
    }
  } catch (err) {
    console.error('Synthesis error:', err);
    sendEvent('error', { error: 'Synthesis suggestion failed' });
  }
  res.end();
});

export default router;
