import { Router, Request, Response } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/cards/:id/vote', requireAuth, async (req: Request, res: Response) => {
  try {
    const { position, justification } = req.body;
    if (!position || !['support', 'oppose'].includes(position)) {
      res.status(400).json({ error: 'position must be "support" or "oppose"' });
      return;
    }
    if (!justification) {
      res.status(400).json({ error: 'justification is required' });
      return;
    }
    const result = await pool.query(
      `INSERT INTO temperature_votes (card_id, voter_id, position, justification)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (card_id, voter_id)
       DO UPDATE SET position = EXCLUDED.position, justification = EXCLUDED.justification, created_at = NOW()
       RETURNING *`,
      [req.params.id, req.session.userId, position, justification]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
});

router.get('/cards/:id/votes', async (req: Request, res: Response) => {
  try {
    const votes = await pool.query(
      `SELECT tv.*, u.display_name AS voter_name
       FROM temperature_votes tv JOIN users u ON tv.voter_id = u.id
       WHERE tv.card_id = $1
       ORDER BY tv.created_at ASC`,
      [req.params.id]
    );
    const support = votes.rows.filter(v => v.position === 'support').length;
    const oppose = votes.rows.filter(v => v.position === 'oppose').length;
    res.json({ votes: votes.rows, support, oppose });
  } catch (err) {
    console.error('Get votes error:', err);
    res.status(500).json({ error: 'Failed to get votes' });
  }
});

export default router;
