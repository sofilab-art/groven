import { useState, useEffect, useRef } from 'react';
import { streamPreview, reclassifyPreview, createCard } from '../api';
import TypeBadge from './TypeBadge';

const CARD_TYPES = ['question', 'claim', 'experience', 'evidence', 'proposal', 'amendment', 'summary', 'request', 'offer'];
const LINK_RELATIONS = ['builds_on', 'questions', 'contradicts', 'reframes', 'supports', 'evidences', 'amends', 'answers', 'spins_off', 'implements'];

interface ReviewModalProps {
  roomId: string;
  body: string;
  parentId: string | null;
  onClose: () => void;
  onCreated: () => void;
}

export default function ReviewModal({ roomId, body, parentId, onClose, onCreated }: ReviewModalProps) {
  const [classification, setClassification] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [lineage, setLineage] = useState('');
  const [status, setStatus] = useState('Analyzing your contribution...');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Override state
  const [overrideType, setOverrideType] = useState<string | null>(null);
  const [overrideQuestion, setOverrideQuestion] = useState<boolean | null>(null);
  const [overrideRelation, setOverrideRelation] = useState<string | null>(null);
  const [rethinkExplanation, setRethinkExplanation] = useState('');
  const [rethinking, setRethinking] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    controllerRef.current = streamPreview(roomId, body, parentId, (event, data) => {
      if (event === 'classification') {
        setClassification(data);
        setStatus('Generating title...');
      } else if (event === 'title') {
        setTitle(data.title);
      } else if (event === 'lineage') {
        setLineage(data.lineage);
      } else if (event === 'done') {
        setDone(true);
        setStatus('Review complete');
      } else if (event === 'error') {
        setError(data.error);
      }
    });

    return () => controllerRef.current?.abort();
  }, [roomId, body, parentId]);

  const finalType = overrideType || classification?.proposed_type;
  const finalQuestion = overrideQuestion !== null ? overrideQuestion : classification?.is_question;
  const finalRelation = overrideRelation || classification?.proposed_relation;

  const handleRethink = async () => {
    if (!overrideType || !classification) return;
    setRethinking(true);
    try {
      const result = await reclassifyPreview({
        parent_card_id: parentId || undefined,
        body,
        chosen_type: overrideType,
        original_type: classification.proposed_type,
        original_explanation: classification.explanation,
      });
      setRethinkExplanation(result.explanation || result.rethink_explanation || '');
    } catch {
      // Reclassify is optional, proceed without
    }
    setRethinking(false);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      const readings = [];
      // Author reading
      readings.push({
        reader_type: 'author',
        proposed_type: finalType,
        is_question: finalQuestion,
        explanation: 'Author\'s own classification',
      });
      // AI reading
      if (classification) {
        readings.push({
          reader_type: 'ai',
          proposed_type: classification.proposed_type,
          is_question: classification.is_question,
          explanation: classification.explanation,
          rethink_explanation: rethinkExplanation || undefined,
          model_used: 'mistral-small-latest',
        });
      }

      await createCard(roomId, {
        body,
        card_type: finalType,
        is_question: finalQuestion,
        title,
        lineage_desc: lineage || undefined,
        parent_card_id: parentId || undefined,
        link_relation: parentId ? finalRelation : undefined,
        readings,
      });
      onCreated();
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal review-modal" onClick={e => e.stopPropagation()}>
        <div className="review-header">
          <h2>Review Your Contribution</h2>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="review-status">{status}</div>

        {/* Body preview */}
        <div className="review-body">
          <p>{body.length > 300 ? body.substring(0, 300) + '...' : body}</p>
        </div>

        {/* Classification */}
        {classification && (
          <div className="review-section">
            <h3>Classification</h3>
            <div className="review-classification">
              <div className="review-field">
                <span className="review-label">AI proposes:</span>
                <TypeBadge type={classification.proposed_type} isQuestion={classification.is_question} />
                <span className="review-confidence">{Math.round((classification.confidence || 0) * 100)}% confident</span>
              </div>
              <p className="review-explanation">{classification.explanation}</p>

              {/* Type override */}
              <div className="review-override">
                <span className="review-label">Your reading:</span>
                <div className="review-type-grid">
                  {CARD_TYPES.map(t => (
                    <button
                      key={t}
                      className={`type-select-btn ${(overrideType || classification.proposed_type) === t ? 'selected' : ''}`}
                      onClick={() => {
                        setOverrideType(t === classification.proposed_type ? null : t);
                      }}
                    >
                      <TypeBadge type={t} size="sm" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Question toggle */}
              <label className="review-question-toggle">
                <input
                  type="checkbox"
                  checked={finalQuestion}
                  onChange={e => setOverrideQuestion(e.target.checked)}
                />
                <span>This is a question</span>
              </label>

              {/* Rethink button */}
              {overrideType && overrideType !== classification.proposed_type && (
                <div className="review-rethink">
                  <button className="btn btn-secondary" onClick={handleRethink} disabled={rethinking}>
                    {rethinking ? 'Rethinking...' : '🔄 Ask AI to rethink'}
                  </button>
                  {rethinkExplanation && (
                    <p className="review-rethink-text"><em>{rethinkExplanation}</em></p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Relation (if has parent) */}
        {parentId && classification?.proposed_relation && (
          <div className="review-section">
            <h3>Relation to parent</h3>
            <div className="review-relations">
              {LINK_RELATIONS.map(r => (
                <button
                  key={r}
                  className={`relation-btn ${(overrideRelation || classification.proposed_relation) === r ? 'selected' : ''}`}
                  onClick={() => setOverrideRelation(r === classification.proposed_relation ? null : r)}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        {title && (
          <div className="review-section">
            <h3>Title</h3>
            <input
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
        )}

        {/* Lineage */}
        {lineage && (
          <div className="review-section">
            <h3>Lineage Description</h3>
            <textarea
              className="form-textarea"
              value={lineage}
              onChange={e => setLineage(e.target.value)}
              rows={2}
              style={{ minHeight: '50px' }}
            />
          </div>
        )}

        {/* Actions */}
        <div className="review-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!done || submitting}
          >
            {submitting ? 'Publishing...' : 'Confirm & Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}
