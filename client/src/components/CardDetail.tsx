import { Link } from 'react-router-dom';
import TypeBadge from './TypeBadge';
import ReadingsList from './ReadingsList';

interface CardDetailProps {
  card: any;
  onClose: () => void;
}

export default function CardDetail({ card, onClose }: CardDetailProps) {
  return (
    <div className="card-detail fade-in">
      <div className="card-detail-header">
        <TypeBadge type={card.card_type} isQuestion={card.is_question} />
        <button className="btn btn-ghost" onClick={onClose}>✕</button>
      </div>

      <h3 className="card-detail-title">{card.title}</h3>
      <p className="card-detail-author">by {card.author_name}</p>

      <div className="card-detail-body">
        {card.body?.length > 200 ? card.body.substring(0, 200) + '...' : card.body}
      </div>

      {card.readings && <ReadingsList readings={card.readings} />}

      {card.lineage_desc && (
        <div className="card-detail-lineage">
          <span className="lineage-label">Lineage:</span> {card.lineage_desc}
        </div>
      )}

      {/* Vote summary */}
      {(card.vote_support > 0 || card.vote_oppose > 0) && (
        <div className="card-detail-votes">
          <span className="vote-support-count">{card.vote_support || 0} support</span>
          <span className="vote-divider">·</span>
          <span className="vote-oppose-count">{card.vote_oppose || 0} oppose</span>
        </div>
      )}

      <Link to={`/cards/${card.id}`} className="btn btn-secondary card-detail-link">
        View full details →
      </Link>
    </div>
  );
}
