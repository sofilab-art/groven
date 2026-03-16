import { useState, useEffect, useRef } from 'react';
import { streamSynthesis, createCard } from '../api';
import TypeBadge from './TypeBadge';

interface SynthesisModalProps {
  spaceId: string;
  roomId: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function SynthesisModal({ spaceId, roomId, onClose, onCreated }: SynthesisModalProps) {
  const [reasoning, setReasoning] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [status, setStatus] = useState('Analyzing discussion threads...');
  const [error, setError] = useState('');
  const [applying, setApplying] = useState<number | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const reasoningRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    controllerRef.current = streamSynthesis(spaceId, (event, data) => {
      if (event === 'reasoning') {
        setReasoning(prev => prev + data.text);
        if (reasoningRef.current) {
          reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
        }
      } else if (event === 'status') {
        setStatus(data.text);
      } else if (event === 'suggestions') {
        setSuggestions(data.suggestions);
        setStatus('Synthesis complete');
      } else if (event === 'error') {
        setError(data.error);
      }
    });

    return () => controllerRef.current?.abort();
  }, [spaceId]);

  const handleApply = async (suggestion: any, index: number) => {
    setApplying(index);
    try {
      await createCard(roomId, {
        body: suggestion.body,
        card_type: suggestion.card_type || 'summary',
        is_question: false,
        title: suggestion.title,
        lineage_desc: suggestion.lineage_desc,
        parent_card_id: suggestion.parent_id || undefined,
        link_relation: suggestion.relation_type || 'builds_on',
      });
      onCreated();
    } catch (err: any) {
      setError(err.message);
      setApplying(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal synthesis-modal" onClick={e => e.stopPropagation()}>
        <div className="review-header">
          <h2>AI Synthesis Suggestions</h2>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="review-status">{status}</div>

        {/* Reasoning stream */}
        {reasoning && (
          <div className="synthesis-reasoning" ref={reasoningRef}>
            <h3>AI Analysis</h3>
            <pre className="synthesis-reasoning-text">{reasoning}</pre>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="synthesis-suggestions">
            <h3>Suggestions ({suggestions.length})</h3>
            {suggestions.map((s, i) => (
              <div key={i} className="synthesis-card fade-in">
                <div className="synthesis-card-header">
                  <TypeBadge type={s.card_type || 'summary'} />
                  <span className="synthesis-card-title">{s.title}</span>
                </div>
                <p className="synthesis-card-body">{s.body}</p>
                {s.proposal_summary && (
                  <p className="synthesis-card-summary"><strong>Summary:</strong> {s.proposal_summary}</p>
                )}
                {s.parent_title && (
                  <p className="synthesis-card-meta">Builds on: {s.parent_title} by {s.parent_author}</p>
                )}
                {s.referenced_cards?.length > 0 && (
                  <p className="synthesis-card-meta">
                    References: {s.referenced_cards.map((c: any) => c.title).join(', ')}
                  </p>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => handleApply(s, i)}
                  disabled={applying !== null}
                >
                  {applying === i ? 'Publishing...' : 'Use this suggestion'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Loading animation */}
        {!suggestions.length && !error && (
          <div className="synthesis-loading">
            <div className="synthesis-dots">
              <span style={{ animation: 'pulse 1.5s infinite' }}>●</span>
              <span style={{ animation: 'pulse 1.5s infinite 0.3s' }}>●</span>
              <span style={{ animation: 'pulse 1.5s infinite 0.6s' }}>●</span>
            </div>
          </div>
        )}

        <div className="review-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
