import pool from './db';
import bcrypt from 'bcrypt';

export async function seedData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data in reverse dependency order
    await client.query('DELETE FROM temperature_votes');
    await client.query('DELETE FROM readings');
    await client.query('DELETE FROM links');
    await client.query('DELETE FROM cards');
    await client.query('DELETE FROM rooms');
    await client.query('DELETE FROM spaces');
    await client.query('DELETE FROM users');

    // Create users
    const hash = await bcrypt.hash('password', 10);
    const users = [
      { username: 'elena', display_name: 'Elena Voss', password_hash: hash },
      { username: 'marcus', display_name: 'Marcus Chen', password_hash: hash },
      { username: 'sofia', display_name: 'Sofia Ramirez', password_hash: hash },
      { username: 'david', display_name: 'David Okafor', password_hash: hash },
      { username: 'anna', display_name: 'Anna Lindqvist', password_hash: hash },
    ];

    const userIds: Record<string, string> = {};
    for (const u of users) {
      const result = await client.query(
        'INSERT INTO users (username, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id',
        [u.username, u.password_hash, u.display_name]
      );
      userIds[u.username] = result.rows[0].id;
    }

    // === SPACE 1: Royalty Distribution ===
    await client.query(
      "INSERT INTO spaces (id, title, description) VALUES ($1, $2, $3)",
      ['royalty-distribution', 'Royalty Distribution in the Age of AI', 'How should royalties be distributed when AI is involved in music creation? Exploring fair compensation models for human creators in an AI-augmented landscape.']
    );

    const room1Plaza = await client.query(
      "INSERT INTO rooms (space_id, room_type, title, description) VALUES ($1, 'plaza', $2, $3) RETURNING id",
      ['royalty-distribution', 'Plaza', 'Open discussion about royalty distribution']
    );
    const room1Table = await client.query(
      "INSERT INTO rooms (space_id, room_type, title, description) VALUES ($1, 'table', $2, $3) RETURNING id",
      ['royalty-distribution', 'Revenue Sharing Models', 'Focused discussion on specific revenue sharing approaches']
    );

    const r1pId = room1Plaza.rows[0].id;
    const r1tId = room1Table.rows[0].id;

    // Cards for Space 1 Plaza
    const c1 = await insertCard(client, r1pId, userIds.elena, 'question', true,
      'Who deserves royalties when AI generates music?',
      'If an AI model trained on thousands of artists\' work generates a new track, who should receive royalties? The original training data artists? The person who prompted the AI? The developers of the model? This is the fundamental question we need to address.',
      null);

    const c2 = await insertCard(client, r1pId, userIds.marcus, 'claim', false,
      'Training data artists must be compensated',
      'Artists whose work was used to train AI models have a moral and legal right to compensation. Without their creative output, the AI would produce nothing. We need a system that traces and rewards the original human creativity.',
      null);

    const c3 = await insertCard(client, r1pId, userIds.sofia, 'experience', false,
      'My music was used without consent',
      'I discovered that three of my albums were included in a major AI training dataset. No one asked permission. No compensation was offered. This isn\'t just about money — it\'s about respect for creative labor and the right to control how your work is used.',
      null);

    const c4 = await insertCard(client, r1pId, userIds.david, 'evidence', false,
      'EU AI Act requires training data transparency',
      'The EU AI Act (2024) mandates that AI providers disclose training data sources. Article 53 specifically requires "sufficiently detailed summary of the content used for training." This creates a legal foundation for tracking and compensating artists.',
      null);

    const c5 = await insertCard(client, r1pId, userIds.anna, 'claim', true,
      'Can existing collecting societies handle AI royalties?',
      'Traditional collecting societies like GEMA, SACEM, and PRS already have infrastructure for tracking and distributing royalties. Could they be extended to handle AI-generated music, or do we need entirely new institutions?',
      null);

    // Links for Space 1 Plaza
    await insertLink(client, c2, c1, 'answers');
    await insertLink(client, c3, c2, 'supports');
    await insertLink(client, c4, c2, 'evidences');
    await insertLink(client, c5, c1, 'builds_on');

    // Readings
    await insertReadings(client, c1, userIds.elena, 'question', true, 'question', true, 'Core question about AI royalty distribution');
    await insertReadings(client, c2, userIds.marcus, 'claim', false, 'claim', false, 'Strong normative claim about artist compensation rights');
    await insertReadings(client, c3, userIds.sofia, 'experience', false, 'experience', false, 'First-person account of unconsented AI training data use');
    await insertReadings(client, c4, userIds.david, 'evidence', false, 'evidence', false, 'Legal evidence from EU AI Act provisions');
    await insertReadings(client, c5, userIds.anna, 'claim', true, 'question', true, 'Question about institutional capacity for AI royalties');

    // Cards for Space 1 Table
    const c6 = await insertCard(client, r1tId, userIds.elena, 'proposal', false,
      'Tiered royalty model based on AI contribution level',
      'I propose a three-tier model: (1) Fully human-created: 100% to creator. (2) AI-assisted: 70% to human creator, 20% to training data pool, 10% to platform. (3) AI-generated with human curation: 40% to curator, 50% to training data pool, 10% to platform. The training data pool is distributed proportionally based on similarity analysis.',
      'This proposal builds on Elena\'s opening question and Marcus\'s argument for training data compensation.');

    const c7 = await insertCard(client, r1tId, userIds.marcus, 'amendment', false,
      'Add minimum payment threshold for training data artists',
      'The tiered model should include a minimum payment threshold. Any artist whose work contributed to training should receive at least €0.001 per generated track, regardless of similarity score. This prevents the "long tail" problem where thousands of artists each receive fractions of a cent.',
      null);

    const c8 = await insertCard(client, r1tId, userIds.david, 'claim', false,
      'Similarity analysis is technically unreliable',
      'Current audio similarity algorithms cannot reliably determine which training data influenced a specific AI output. Building a royalty system on similarity scores creates a false sense of precision. We need a simpler, more robust allocation method.',
      null);

    await insertLink(client, c6, c1, 'answers');
    await insertLink(client, c7, c6, 'amends');
    await insertLink(client, c8, c6, 'contradicts');

    await insertReadings(client, c6, userIds.elena, 'proposal', false, 'proposal', false, 'Concrete three-tier royalty distribution proposal');
    await insertReadings(client, c7, userIds.marcus, 'amendment', false, 'amendment', false, 'Amendment adding minimum payment floor');
    await insertReadings(client, c8, userIds.david, 'claim', false, 'claim', false, 'Technical challenge to similarity-based allocation');

    // Votes on the proposal
    await insertVote(client, c6, userIds.marcus, 'support', 'Clear framework that acknowledges all stakeholders');
    await insertVote(client, c6, userIds.sofia, 'support', 'Finally a concrete proposal. The tiers make sense.');
    await insertVote(client, c6, userIds.david, 'oppose', 'Relies on similarity analysis which is technically unreliable');

    // === SPACE 2: Creative Attribution ===
    await client.query(
      "INSERT INTO spaces (id, title, description) VALUES ($1, $2, $3)",
      ['creative-attribution', 'Creative Attribution Standards', 'Developing clear standards for attributing creative contributions in collaborative and AI-augmented works.']
    );

    const room2Plaza = await client.query(
      "INSERT INTO rooms (space_id, room_type, title, description) VALUES ($1, 'plaza', $2, $3) RETURNING id",
      ['creative-attribution', 'Plaza', 'Open discussion about attribution standards']
    );
    const r2pId = room2Plaza.rows[0].id;

    const c9 = await insertCard(client, r2pId, userIds.marcus, 'question', true,
      'What does "authorship" mean when AI collaborates?',
      'Traditional copyright assumes a human author. When AI is deeply involved in the creative process — not just as a tool but as a generative partner — how do we define authorship? Is the prompter an author? Is the model developer?',
      null);

    const c10 = await insertCard(client, r2pId, userIds.elena, 'claim', false,
      'Authorship requires intentional creative choices',
      'Authorship should be defined by intentional creative decision-making, not by who pressed the button. A photographer is an author because they choose composition, timing, and subject — even though the camera does the capture. Similarly, meaningful creative direction of AI should constitute authorship.',
      null);

    const c11 = await insertCard(client, r2pId, userIds.anna, 'experience', false,
      'Collaborating with AI changed my creative process',
      'When I started using AI tools in my composition workflow, I noticed my role shifted from "creator" to "curator and editor." I generate dozens of variations and select, combine, and refine. It feels creative, but it\'s a fundamentally different kind of creativity than writing from scratch.',
      null);

    const c12 = await insertCard(client, r2pId, userIds.sofia, 'evidence', false,
      'US Copyright Office: AI-generated works need human authorship',
      'The US Copyright Office has ruled that works generated by AI without significant human creative input cannot be copyrighted. However, works where AI is used as a tool with substantial human creative direction can qualify. This creates a spectrum, not a binary.',
      null);

    const c13 = await insertCard(client, r2pId, userIds.david, 'claim', false,
      'We need a new category beyond "author"',
      'Instead of stretching the concept of "authorship" to fit AI collaboration, we should create new categories: "director" (human who guides AI), "contributor" (training data artists), "developer" (model creators). Each with different rights and obligations.',
      null);

    await insertLink(client, c10, c9, 'answers');
    await insertLink(client, c11, c10, 'supports');
    await insertLink(client, c12, c10, 'evidences');
    await insertLink(client, c13, c10, 'reframes');
    await insertLink(client, c13, c9, 'answers');

    await insertReadings(client, c9, userIds.marcus, 'question', true, 'question', true, 'Foundational question about AI-era authorship');
    await insertReadings(client, c10, userIds.elena, 'claim', false, 'claim', false, 'Defines authorship through intentional creative choice');
    await insertReadings(client, c11, userIds.anna, 'experience', false, 'experience', false, 'Personal reflection on AI-altered creative practice');
    await insertReadings(client, c12, userIds.sofia, 'evidence', false, 'evidence', false, 'Legal precedent from US Copyright Office');
    await insertReadings(client, c13, userIds.david, 'claim', false, 'proposal', false, 'Reframes authorship debate with new category system');

    // === SPACE 3: Licensing Infrastructure ===
    await client.query(
      "INSERT INTO spaces (id, title, description) VALUES ($1, $2, $3)",
      ['licensing-infrastructure', 'Open Licensing Infrastructure', 'Designing open, interoperable licensing infrastructure for music in the AI era — beyond proprietary platforms and walled gardens.']
    );

    const room3Plaza = await client.query(
      "INSERT INTO rooms (space_id, room_type, title, description) VALUES ($1, 'plaza', $2, $3) RETURNING id",
      ['licensing-infrastructure', 'Plaza', 'Open discussion about licensing infrastructure']
    );
    const room3Table = await client.query(
      "INSERT INTO rooms (space_id, room_type, title, description) VALUES ($1, 'table', $2, $3) RETURNING id",
      ['licensing-infrastructure', 'Protocol Design', 'Technical discussion on protocol architecture']
    );
    const r3pId = room3Plaza.rows[0].id;
    const r3tId = room3Table.rows[0].id;

    const c14 = await insertCard(client, r3pId, userIds.sofia, 'question', true,
      'Should licensing be opt-in or opt-out for AI training?',
      'The current landscape has two extremes: some platforms scrape everything by default (opt-out), while others require explicit permission for each use (opt-in). Is there a middle ground that respects creators while enabling innovation?',
      null);

    const c15 = await insertCard(client, r3pId, userIds.david, 'claim', false,
      'Opt-in is the only ethical default',
      'Any system that uses creative works without explicit consent is fundamentally unethical, regardless of how convenient opt-out might be for technology companies. The default should always protect the creator, not the platform.',
      null);

    const c16 = await insertCard(client, r3pId, userIds.elena, 'claim', false,
      'Strict opt-in will entrench large players',
      'If we require opt-in for all AI training, only large companies with existing licensing relationships will be able to build AI models. Independent researchers and small companies will be locked out. We need a system that is both ethical and accessible.',
      null);

    const c17 = await insertCard(client, r3pId, userIds.anna, 'summary', false,
      'The opt-in/opt-out debate has three positions',
      'Three main positions have emerged: (1) Strict opt-in: all use requires explicit permission. (2) Opt-out with compensation: default inclusion with easy removal and automatic compensation. (3) Tiered: different rules for commercial vs research use. The key tension is between creator control and innovation access.',
      null);

    await insertLink(client, c15, c14, 'answers');
    await insertLink(client, c16, c15, 'contradicts');
    await insertLink(client, c17, c14, 'builds_on');
    await insertLink(client, c17, c15, 'builds_on');
    await insertLink(client, c17, c16, 'builds_on');

    await insertReadings(client, c14, userIds.sofia, 'question', true, 'question', true, 'Central question about licensing defaults');
    await insertReadings(client, c15, userIds.david, 'claim', false, 'claim', false, 'Strong ethical argument for opt-in default');
    await insertReadings(client, c16, userIds.elena, 'claim', false, 'claim', false, 'Pragmatic counterargument about market effects');
    await insertReadings(client, c17, userIds.anna, 'summary', false, 'summary', false, 'Synthesis of three positions in opt-in/opt-out debate');

    // Table cards for Space 3
    const c18 = await insertCard(client, r3tId, userIds.david, 'proposal', false,
      'Decentralized licensing registry on open standards',
      'I propose building the licensing infrastructure on open standards (W3C Verifiable Credentials, DID identifiers) rather than a centralized database. Each creator publishes their licensing terms as a machine-readable document. AI companies query the registry before training. This is interoperable, censorship-resistant, and doesn\'t require trusting a single operator.',
      'Responds to the opt-in/opt-out debate by proposing infrastructure that makes opt-in frictionless.');

    const c19 = await insertCard(client, r3tId, userIds.marcus, 'request', false,
      'Need technical feasibility assessment',
      'Before we commit to a decentralized approach, we need someone with distributed systems expertise to assess whether this can actually work at scale. How many queries per second would AI training require? What are the latency implications? Can we handle millions of licensing documents?',
      null);

    await insertLink(client, c18, c14, 'answers');
    await insertLink(client, c19, c18, 'questions');

    await insertReadings(client, c18, userIds.david, 'proposal', false, 'proposal', false, 'Technical proposal for decentralized licensing');
    await insertReadings(client, c19, userIds.marcus, 'request', false, 'request', false, 'Request for technical feasibility review');

    await insertVote(client, c18, userIds.elena, 'support', 'Open standards are the right foundation');
    await insertVote(client, c18, userIds.anna, 'support', 'Decentralization avoids single points of failure');
    await insertVote(client, c18, userIds.sofia, 'support', 'This respects creator autonomy');

    // === SPACE 4: Lachenmann Programming ===
    await client.query(
      "INSERT INTO spaces (id, title, description) VALUES ($1, $2, $3)",
      ['lachenmann-season', 'Programming Lachenmann for Ensemble Season', 'Curating a Helmut Lachenmann focus for an ensemble\'s upcoming season. Which works, what context, how to make musique concr\u00e8te instrumentale accessible to new audiences?']
    );

    const room4Plaza = await client.query(
      "INSERT INTO rooms (space_id, room_type, title, description) VALUES ($1, 'plaza', $2, $3) RETURNING id",
      ['lachenmann-season', 'Plaza', 'Open discussion about the Lachenmann season']
    );
    const r4pId = room4Plaza.rows[0].id;

    const c20 = await insertCard(client, r4pId, userIds.anna, 'question', true,
      'Which Lachenmann works best introduce his sound world?',
      'We have three concert slots for the Lachenmann focus. Which pieces would create the best arc for audiences unfamiliar with musique concr\u00e8te instrumentale? Should we start gentle or dive into the deep end?',
      null);

    const c21 = await insertCard(client, r4pId, userIds.elena, 'claim', false,
      'Start with Gran Torso for immediate impact',
      'Gran Torso (1971/88) for string quartet is the ideal opening. It\'s radical enough to reset expectations but short enough (15 min) not to overwhelm. The purely noise-based string writing is Lachenmann\'s signature distilled. Pair it with a pre-concert talk.',
      null);

    const c22 = await insertCard(client, r4pId, userIds.marcus, 'claim', false,
      'Air is more accessible as an entry point',
      'Air (1968/69) for large orchestra with percussion has more timbral variety and dynamic range than Gran Torso. The orchestral forces give audiences familiar reference points even as Lachenmann subverts them. It\'s challenging but not alienating.',
      null);

    const c23 = await insertCard(client, r4pId, userIds.sofia, 'offer', false,
      'I can prepare programme notes with listening guides',
      'I\'ve written programme notes for new music festivals before. I can prepare accessible listening guides that help audiences engage with Lachenmann\'s sound world without over-intellectualizing it. Focus on what to listen *for* rather than what it *means*.',
      null);

    const c24 = await insertCard(client, r4pId, userIds.david, 'experience', false,
      'Audience reactions at our last contemporary programme',
      'Last season\'s Xenakis programme taught us something: audiences responded best when we paired unfamiliar works with brief, informal spoken introductions by the performers themselves. The personal connection mattered more than musicological context.',
      null);

    await insertLink(client, c21, c20, 'answers');
    await insertLink(client, c22, c20, 'answers');
    await insertLink(client, c22, c21, 'contradicts');
    await insertLink(client, c23, c20, 'builds_on');
    await insertLink(client, c24, c21, 'supports');
    await insertLink(client, c24, c22, 'supports');

    await insertReadings(client, c20, userIds.anna, 'question', true, 'question', true, 'Programming question about Lachenmann work selection');
    await insertReadings(client, c21, userIds.elena, 'claim', false, 'proposal', false, 'Advocates Gran Torso as opening piece');
    await insertReadings(client, c22, userIds.marcus, 'claim', false, 'claim', false, 'Counter-proposal: Air as more accessible entry');
    await insertReadings(client, c23, userIds.sofia, 'offer', false, 'offer', false, 'Offers to write accessible listening guides');
    await insertReadings(client, c24, userIds.david, 'experience', false, 'experience', false, 'Practical experience with audience engagement');

    await client.query('COMMIT');
    console.log('Seed data loaded successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function insertCard(
  client: any, roomId: string, authorId: string,
  cardType: string, isQuestion: boolean,
  title: string, body: string, lineageDesc: string | null
): Promise<string> {
  const result = await client.query(
    `INSERT INTO cards (room_id, author_id, card_type, is_question, title, body, lineage_desc)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [roomId, authorId, cardType, isQuestion, title, body, lineageDesc]
  );
  return result.rows[0].id;
}

async function insertLink(
  client: any, sourceId: string, targetId: string, relation: string
): Promise<void> {
  await client.query(
    'INSERT INTO links (source_card_id, target_card_id, relation_type) VALUES ($1, $2, $3)',
    [sourceId, targetId, relation]
  );
}

async function insertReadings(
  client: any, cardId: string, authorId: string,
  authorType: string, authorIsQuestion: boolean,
  aiType: string, aiIsQuestion: boolean,
  aiExplanation: string
): Promise<void> {
  // Author reading
  await client.query(
    `INSERT INTO readings (card_id, reader_type, reader_id, proposed_type, is_question, explanation)
     VALUES ($1, 'author', $2, $3, $4, 'Author''s own classification')`,
    [cardId, authorId, authorType, authorIsQuestion]
  );
  // AI reading
  await client.query(
    `INSERT INTO readings (card_id, reader_type, proposed_type, is_question, explanation, model_used)
     VALUES ($1, 'ai', $2, $3, $4, 'mistral-small-latest')`,
    [cardId, aiType, aiIsQuestion, aiExplanation]
  );
}

async function insertVote(
  client: any, cardId: string, voterId: string,
  position: string, justification: string
): Promise<void> {
  await client.query(
    'INSERT INTO temperature_votes (card_id, voter_id, position, justification) VALUES ($1, $2, $3, $4)',
    [cardId, voterId, position, justification]
  );
}
