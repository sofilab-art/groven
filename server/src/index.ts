import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import dotenv from 'dotenv';
import pool from './db';
import authRoutes from './routes/auth';
import spaceRoutes from './routes/spaces';
import roomRoutes from './routes/rooms';
import cardRoutes from './routes/cards';
import voteRoutes from './routes/votes';
import synthesisRoutes from './routes/synthesis';
import adminRoutes from './routes/admin';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3000;

const PgSession = connectPgSimple(session);

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use(session({
  store: new PgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: false,
  },
}));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api', spaceRoutes);
app.use('/api', roomRoutes);
app.use('/api', cardRoutes);
app.use('/api', voteRoutes);
app.use('/api', synthesisRoutes);
app.use('/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Groven server running on port ${PORT}`);
});
