import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import pool from '../db';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password, display_name } = req.body;
    if (!username || !password || !display_name) {
      res.status(400).json({ error: 'username, password, and display_name are required' });
      return;
    }
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, username, display_name',
      [username, password_hash, display_name]
    );
    const user = result.rows[0];
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.displayName = user.display_name;
    res.status(201).json(user);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'username and password are required' });
      return;
    }
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.displayName = user.display_name;
    res.json({ id: user.id, username: user.username, display_name: user.display_name });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
      return;
    }
    res.json({ ok: true });
  });
});

router.get('/me', async (req: Request, res: Response) => {
  if (!req.session.userId) {
    res.json({ user: null });
    return;
  }
  try {
    const result = await pool.query(
      'SELECT id, username, display_name FROM users WHERE id = $1',
      [req.session.userId]
    );
    if (result.rows.length === 0) {
      res.json({ user: null });
      return;
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Auth check error:', err);
    res.json({ user: null });
  }
});

export default router;
