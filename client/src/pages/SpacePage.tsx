import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../api';
import RoomTabs from '../components/RoomTabs';
import Graph from '../components/Graph';
import CardDetail from '../components/CardDetail';
import ContributeForm from '../components/ContributeForm';
import ReviewModal from '../components/ReviewModal';
import SynthesisModal from '../components/SynthesisModal';
import VotePanel from '../components/VotePanel';
import TypeBadge from '../components/TypeBadge';
import ReadingsList from '../components/ReadingsList';

export default function SpacePage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const [space, setSpace] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoomId, setActiveRoomId] = useState('');
  const [graphData, setGraphData] = useState<{ cards: any[]; links: any[] }>({ cards: [], links: [] });
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [parentCard, setParentCard] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewBody, setReviewBody] = useState('');
  const [showSynthesis, setShowSynthesis] = useState(false);
  const [detailCard, setDetailCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadGraph = useCallback(async (roomId: string) => {
    try {
      const data = await api.getGraph(roomId);
      setGraphData(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadCardDetail = useCallback(async (cardId: string) => {
    try {
      const data = await api.getCard(cardId);
      setDetailCard(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!spaceId) return;
    Promise.all([api.getSpace(spaceId), api.getRooms(spaceId)])
      .then(([spaceData, roomsData]) => {
        setSpace(spaceData);
        setRooms(roomsData);
        if (roomsData.length > 0) {
          // Prefer first Table room over Plaza
          const firstTable = roomsData.find((r: any) => r.room_type === 'table');
          const defaultRoom = firstTable || roomsData[0];
          setActiveRoomId(defaultRoom.id);
          loadGraph(defaultRoom.id);
        }
      })
      .finally(() => setLoading(false));
  }, [spaceId, loadGraph]);

  useEffect(() => {
    if (activeRoomId) loadGraph(activeRoomId);
  }, [activeRoomId, loadGraph]);

  const handleSelectCard = useCallback((card: any) => {
    setSelectedCard(card);
    loadCardDetail(card.id);
  }, [loadCardDetail]);

  const handleContribute = (body: string) => {
    setReviewBody(body);
    setShowReview(true);
  };

  const handleCardCreated = () => {
    setShowReview(false);
    setShowSynthesis(false);
    setReviewBody('');
    setParentCard(null);
    loadGraph(activeRoomId);
  };

  const handleRespondTo = (card: any) => {
    setParentCard(card);
    setSelectedCard(null);
    setDetailCard(null);
    // Scroll to form
    document.querySelector('.contribute-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return <div className="loading">Loading space...</div>;
  if (!space) return <div className="loading">Space not found</div>;

  return (
    <div className="space-page">
      <div className="space-header">
        <div>
          <h1>{space.title}</h1>
          <p className="text-muted">{space.description}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowSynthesis(true)}>
          ✨ Suggest Synthesis
        </button>
      </div>

      <RoomTabs
        rooms={rooms}
        activeRoomId={activeRoomId}
        onSelectRoom={(id) => {
          setActiveRoomId(id);
          setSelectedCard(null);
          setDetailCard(null);
        }}
        spaceId={spaceId!}
        onRoomCreated={(room) => {
          setRooms([...rooms, room]);
          setActiveRoomId(room.id);
        }}
      />

      <div className="space-grid">
        {/* Graph panel (60%) */}
        <div className="graph-panel">
          <Graph
            cards={graphData.cards}
            links={graphData.links}
            onSelectCard={handleSelectCard}
            selectedCardId={selectedCard?.id}
          />
        </div>

        {/* Side panel (40%) */}
        <div className="side-panel">
          {/* Card detail or contribute form */}
          {detailCard ? (
            <div className="side-detail">
              <div className="card-detail-full fade-in">
                <div className="card-detail-header">
                  <TypeBadge type={detailCard.card_type} isQuestion={detailCard.is_question} />
                  <button className="btn btn-ghost" onClick={() => { setSelectedCard(null); setDetailCard(null); }}>✕</button>
                </div>
                <h3 className="card-detail-title">{detailCard.title}</h3>
                <p className="card-detail-author">by {detailCard.author_name}</p>

                {detailCard.readings && <ReadingsList readings={detailCard.readings} />}

                <div className="card-detail-body-full">{detailCard.body}</div>

                {detailCard.lineage_desc && (
                  <div className="card-detail-lineage">
                    <span className="lineage-label">Lineage:</span> {detailCard.lineage_desc}
                  </div>
                )}

                {/* Links */}
                {detailCard.links_out?.length > 0 && (
                  <div className="card-links-section">
                    <h4>Links from this card</h4>
                    {detailCard.links_out.map((l: any) => (
                      <div key={l.id} className="card-link-item" onClick={() => handleSelectCard({ id: l.target_card_id })}>
                        <span className="link-relation">{l.relation_type.replace('_', ' ')}</span>
                        <span>→ {l.target_title}</span>
                      </div>
                    ))}
                  </div>
                )}

                {detailCard.links_in?.length > 0 && (
                  <div className="card-links-section">
                    <h4>Links to this card</h4>
                    {detailCard.links_in.map((l: any) => (
                      <div key={l.id} className="card-link-item" onClick={() => handleSelectCard({ id: l.source_card_id })}>
                        <span>{l.source_title}</span>
                        <span className="link-relation">{l.relation_type.replace('_', ' ')}</span> →
                      </div>
                    ))}
                  </div>
                )}

                <button className="btn btn-secondary" onClick={() => handleRespondTo(detailCard)} style={{ marginTop: '0.5rem' }}>
                  ↩ Respond to this card
                </button>

                {/* Voting */}
                <VotePanel
                  cardId={detailCard.id}
                  votes={detailCard.votes || []}
                  onVoted={() => {
                    loadCardDetail(detailCard.id);
                    loadGraph(activeRoomId);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="side-contribute">
              <h3>Contribute</h3>
              <ContributeForm
                parentCard={parentCard}
                onSubmit={handleContribute}
                onClearParent={() => setParentCard(null)}
              />

              {/* Card list */}
              <div className="card-list">
                <h3>Cards ({graphData.cards.length})</h3>
                {graphData.cards.map(card => (
                  <div
                    key={card.id}
                    className={`card-list-item ${selectedCard?.id === card.id ? 'selected' : ''}`}
                    onClick={() => handleSelectCard(card)}
                  >
                    <TypeBadge type={card.card_type} isQuestion={card.is_question} size="sm" />
                    <span className="card-list-title">{card.title}</span>
                    <span className="card-list-author">{card.author_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review modal */}
      {showReview && (
        <ReviewModal
          roomId={activeRoomId}
          body={reviewBody}
          parentId={parentCard?.id || null}
          onClose={() => setShowReview(false)}
          onCreated={handleCardCreated}
        />
      )}

      {/* Synthesis modal */}
      {showSynthesis && (
        <SynthesisModal
          spaceId={spaceId!}
          roomId={activeRoomId}
          onClose={() => setShowSynthesis(false)}
          onCreated={handleCardCreated}
        />
      )}
    </div>
  );
}
