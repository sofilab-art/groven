import { Router, Request, Response } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/spaces', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT s.*,
        (SELECT COUNT(*) FROM rooms r WHERE r.space_id = s.id) AS room_count,
        (SELECT COUNT(*) FROM cards c JOIN rooms r ON c.room_id = r.id WHERE r.space_id = s.id) AS card_count
      FROM spaces s
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('List spaces error:', err);
    res.status(500).json({ error: 'Failed to list spaces' });
  }
});

router.get('/spaces/:id', async (req: Request, res: Response) => {
  try {
    const space = await pool.query('SELECT * FROM spaces WHERE id = $1', [req.params.id]);
    if (space.rows.length === 0) {
      res.status(404).json({ error: 'Space not found' });
      return;
    }
    const rooms = await pool.query(
      'SELECT * FROM rooms WHERE space_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );
    res.json({ ...space.rows[0], rooms: rooms.rows });
  } catch (err) {
    console.error('Get space error:', err);
    res.status(500).json({ error: 'Failed to get space' });
  }
});

router.post('/spaces', requireAuth, async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      res.status(400).json({ error: 'title is required' });
      return;
    }
    // Generate slug
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    const existing = await pool.query('SELECT id FROM spaces WHERE id = $1', [slug]);
    if (existing.rows.length > 0) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'INSERT INTO spaces (id, title, description) VALUES ($1, $2, $3)',
        [slug, title, description || null]
      );
      const roomResult = await client.query(
        'INSERT INTO rooms (space_id, room_type, title) VALUES ($1, $2, $3) RETURNING id',
        [slug, 'plaza', 'Plaza']
      );
      await client.query('COMMIT');
      res.status(201).json({ id: slug, plaza_room_id: roomResult.rows[0].id });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Create space error:', err);
    res.status(500).json({ error: 'Failed to create space' });
  }
});

export default router;
