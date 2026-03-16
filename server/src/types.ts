export type RoomType = 'plaza' | 'table';
export type RoomStatus = 'open' | 'archived';
export type CardType = 'question' | 'claim' | 'experience' | 'evidence' | 'proposal' | 'amendment' | 'summary' | 'request' | 'offer';
export type LinkRelation = 'builds_on' | 'questions' | 'contradicts' | 'reframes' | 'supports' | 'evidences' | 'amends' | 'answers' | 'spins_off' | 'implements';
export type ReaderType = 'author' | 'ai' | 'steward';
export type VotePosition = 'support' | 'oppose';

export const CARD_TYPES: CardType[] = ['question', 'claim', 'experience', 'evidence', 'proposal', 'amendment', 'summary', 'request', 'offer'];
export const LINK_RELATIONS: LinkRelation[] = ['builds_on', 'questions', 'contradicts', 'reframes', 'supports', 'evidences', 'amends', 'answers', 'spins_off', 'implements'];

export interface User {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
  created_at: Date;
}

export interface Space {
  id: string;
  title: string;
  description: string | null;
  ai_enabled: boolean;
  created_at: Date;
}

export interface Room {
  id: string;
  space_id: string;
  room_type: RoomType;
  title: string;
  description: string | null;
  status: RoomStatus;
  created_at: Date;
}

export interface Card {
  id: string;
  room_id: string;
  author_id: string;
  card_type: CardType;
  is_question: boolean;
  title: string | null;
  body: string;
  lineage_desc: string | null;
  created_at: Date;
}

export interface Link {
  id: string;
  source_card_id: string;
  target_card_id: string;
  relation_type: LinkRelation;
  created_at: Date;
}

export interface Reading {
  id: string;
  card_id: string;
  reader_type: ReaderType;
  reader_id: string | null;
  proposed_type: CardType;
  is_question: boolean;
  explanation: string | null;
  rethink_explanation: string | null;
  model_used: string | null;
  created_at: Date;
}

export interface TemperatureVote {
  id: string;
  card_id: string;
  voter_id: string;
  position: VotePosition;
  justification: string;
  created_at: Date;
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
    username: string;
    displayName: string;
  }
}
