import { Router, Request, Response } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/spaces/:spaceId/rooms', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT r.*,
        (SELECT COUNT(*) FROM cards c WHERE c.room_id = r.id) AS card_count
      FROM rooms r WHERE r.space_id = $1 ORDER BY r.created_at ASC`,
      [req.params.spaceId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List rooms error:', err);
    res.status(500).json({ error: 'Failed to list rooms' });
  }
});

router.post('/spaces/:spaceId/rooms', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    const result = await pool.query(
      'INSERT INTO rooms (space_id, room_type, title, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.spaceId, 'table', title, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create room error:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

export default router;
