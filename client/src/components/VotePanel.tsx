import { useState } from 'react';
import * as api from '../api';
import { useAuth } from '../context/AuthContext';

interface Vote {
  id: string;
  voter_id: string;
  voter_name: string;
  position: string;
  justification: string;
  created_at: string;
}

interface VotePanelProps {
  cardId: string;
  votes: Vote[];
  onVoted: () => void;
}

export default function VotePanel({ cardId, votes, onVoted }: VotePanelProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState<'support' | 'oppose' | null>(null);
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);

  const support = votes.filter(v => v.position === 'support');
  const oppose = votes.filter(v => v.position === 'oppose');
  const total = votes.length;
  const supportPct = total > 0 ? (support.length / total) * 100 : 50;
  const userVote = votes.find(v => v.voter_id === user?.id);

  const handleVote = async (position: 'support' | 'oppose') => {
    if (!justification.trim()) return;
    setLoading(true);
    try {
      await api.vote(cardId, position, justification);
      setShowForm(null);
      setJustification('');
      onVoted();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vote-panel">
      <div className="vote-header">
        <span className="vote-label">Temperature</span>
        <span className="vote-counts">
          <span className="vote-support-count">{support.length} support</span>
          <span className="vote-divider">·</span>
          <span className="vote-oppose-count">{oppose.length} oppose</span>
        </span>
      </div>

      {/* Arc gauge */}
      <div className="vote-arc">
        <svg viewBox="0 0 200 110" className="vote-arc-svg">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {total > 0 && (
            <>
              {/* Support arc (left side, green) */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="var(--color-support)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(supportPct / 100) * 251.2} 251.2`}
              />
              {/* Oppose arc (right side, from end) */}
              <path
                d="M 180 100 A 80 80 0 0 0 20 100"
                fill="none"
                stroke="var(--color-oppose)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${((100 - supportPct) / 100) * 251.2} 251.2`}
              />
            </>
          )}
          <text x="100" y="90" textAnchor="middle" className="vote-arc-text">
            {total > 0 ? `${Math.round(supportPct)}%` : '—'}
          </text>
          <text x="100" y="105" textAnchor="middle" className="vote-arc-subtext">
            {total} vote{total !== 1 ? 's' : ''}
          </text>
        </svg>
      </div>

      {/* Vote buttons */}
      {!showForm && (
        <div className="vote-buttons">
          <button
            className={`btn btn-support ${userVote?.position === 'support' ? 'voted' : ''}`}
            onClick={() => setShowForm('support')}
          >
            {userVote?.position === 'support' ? '✓ Supporting' : '↑ Support'}
          </button>
          <button
            className={`btn btn-oppose ${userVote?.position === 'oppose' ? 'voted' : ''}`}
            onClick={() => setShowForm('oppose')}
          >
            {userVote?.position === 'oppose' ? '✓ Opposing' : '↓ Oppose'}
          </button>
        </div>
      )}

      {/* Vote form */}
      {showForm && (
        <div className="vote-form">
          <textarea
            className="form-textarea"
            placeholder={`Why do you ${showForm} this?`}
            value={justification}
            onChange={e => setJustification(e.target.value)}
            rows={2}
            style={{ minHeight: '60px' }}
          />
          <div className="vote-form-actions">
            <button
              className={`btn ${showForm === 'support' ? 'btn-support' : 'btn-oppose'}`}
              onClick={() => handleVote(showForm)}
              disabled={loading || !justification.trim()}
            >
              {loading ? 'Submitting...' : `Submit ${showForm}`}
            </button>
            <button className="btn btn-ghost" onClick={() => { setShowForm(null); setJustification(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Vote list */}
      {votes.length > 0 && (
        <div className="vote-list">
          {votes.map(v => (
            <div key={v.id} className={`vote-item vote-${v.position}`}>
              <div className="vote-item-header">
                <span className={`vote-indicator ${v.position}`}>{v.position === 'support' ? '↑' : '↓'}</span>
                <span className="vote-item-name">{v.voter_name}</span>
              </div>
              <p className="vote-item-text">{v.justification}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
