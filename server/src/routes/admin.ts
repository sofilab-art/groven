import { Router, Request, Response } from 'express';
import { seedData } from '../seed';

const router = Router();

router.get('/seed', async (_req: Request, res: Response) => {
  try {
    await seedData();
    res.json({ message: 'Seed data loaded successfully' });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: 'Failed to seed data' });
  }
});

export default router;
