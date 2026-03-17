import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../api';
import TypeBadge from '../components/TypeBadge';
import ReadingsList from '../components/ReadingsList';
import VotePanel from '../components/VotePanel';

export default function CardPage() {
  const { cardId } = useParams<{ cardId: string }>();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadCard = () => {
    if (!cardId) return;
    api.getCard(cardId).then(setCard).finally(() => setLoading(false));
  };

  useEffect(loadCard, [cardId]);

  if (loading) return <div className="loading">Loading card...</div>;
  if (!card) return <div className="loading">Card not found</div>;

  return (
    <div className="card-page">
      <div className="card-page-breadcrumb">
        <Link to="/">Spaces</Link>
        <span> / </span>
        <Link to={`/spaces/${card.room?.space_id}`}>{card.room?.space_title}</Link>
        <span> / </span>
        <span>{card.room?.title}</span>
      </div>

      <div className="card-page-content">
        <div className="card-page-main">
          <div className="card-page-header">
            <TypeBadge type={card.card_type} isQuestion={card.is_question} />
            <h1>{card.title}</h1>
          </div>

          <p className="card-page-author">
            by <strong>{card.author_name}</strong> · {new Date(card.created_at).toLocaleDateString()}
          </p>

          {card.readings && <ReadingsList readings={card.readings} />}

          <div className="card-page-body">{card.body}</div>

          {card.lineage_desc && (
            <div className="card-page-lineage">
              <h3>Lineage</h3>
              <p>{card.lineage_desc}</p>
            </div>
          )}

          {/* Links */}
          {card.links_out?.length > 0 && (
            <div className="card-page-links">
              <h3>Links from this card</h3>
              {card.links_out.map((l: any) => (
                <Link key={l.id} to={`/cards/${l.target_card_id}`} className="card-page-link-item">
                  <span className="link-relation">{l.relation_type.replace('_', ' ')}</span>
                  <span>→ {l.target_title}</span>
                  <TypeBadge type={l.target_type} size="sm" />
                </Link>
              ))}
            </div>
          )}

          {card.links_in?.length > 0 && (
            <div className="card-page-links">
              <h3>Links to this card</h3>
              {card.links_in.map((l: any) => (
                <Link key={l.id} to={`/cards/${l.source_card_id}`} className="card-page-link-item">
                  <TypeBadge type={l.source_type} size="sm" />
                  <span>{l.source_title}</span>
                  <span className="link-relation">{l.relation_type.replace('_', ' ')}</span> →
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card-page-side">
          <VotePanel
            cardId={card.id}
            votes={card.votes || []}
            onVoted={loadCard}
          />
        </div>
      </div>
    </div>
  );
}
