import pool from './db';

const statements = [
  // Enum types
  `DO $$ BEGIN CREATE TYPE room_type AS ENUM ('plaza', 'table'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE room_status AS ENUM ('open', 'archived'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE card_type AS ENUM ('question','claim','experience','evidence','proposal','amendment','summary','request','offer'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE link_relation AS ENUM ('builds_on','questions','contradicts','reframes','supports','evidences','amends','answers','spins_off','implements'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE reader_type AS ENUM ('author', 'ai', 'steward'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,
  `DO $$ BEGIN CREATE TYPE vote_position AS ENUM ('support', 'oppose'); EXCEPTION WHEN duplicate_object THEN null; END $$;`,

  // Tables
  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS spaces (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    ai_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id VARCHAR(255) NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
    room_type room_type NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status room_status DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    card_type card_type NOT NULL,
    is_question BOOLEAN DEFAULT FALSE,
    title VARCHAR(500),
    body TEXT NOT NULL,
    lineage_desc TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    target_card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    relation_type link_relation NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    reader_type reader_type NOT NULL,
    reader_id UUID REFERENCES users(id),
    proposed_type card_type NOT NULL,
    is_question BOOLEAN DEFAULT FALSE,
    explanation TEXT,
    rethink_explanation TEXT,
    model_used VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );`,

  `CREATE TABLE IF NOT EXISTS temperature_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES users(id),
    position vote_position NOT NULL,
    justification TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(card_id, voter_id)
  );`,

  // Indexes
  `CREATE INDEX IF NOT EXISTS idx_rooms_space_id ON rooms(space_id);`,
  `CREATE INDEX IF NOT EXISTS idx_cards_room_id ON cards(room_id);`,
  `CREATE INDEX IF NOT EXISTS idx_cards_author_id ON cards(author_id);`,
  `CREATE INDEX IF NOT EXISTS idx_links_source ON links(source_card_id);`,
  `CREATE INDEX IF NOT EXISTS idx_links_target ON links(target_card_id);`,
  `CREATE INDEX IF NOT EXISTS idx_readings_card_id ON readings(card_id);`,
  `CREATE INDEX IF NOT EXISTS idx_votes_card_id ON temperature_votes(card_id);`,
];

async function migrate() {
  console.log('Running migrations...');
  for (const sql of statements) {
    await pool.query(sql);
  }
  console.log('Migration complete.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
