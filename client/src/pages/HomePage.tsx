import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';

interface Space {
  id: string;
  title: string;
  description: string;
  room_count: string;
  card_count: string;
  created_at: string;
}

export default function HomePage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.getSpaces().then(setSpaces).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading spaces...</div>;

  return (
    <div className="home-page">
      <div className="home-header">
        <div>
          <h1>Discussion Spaces</h1>
          <p className="text-muted">Explore ongoing deliberations or start a new one</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Space
        </button>
      </div>

      <div className="spaces-grid">
        {spaces.map(space => (
          <Link to={`/spaces/${space.id}`} key={space.id} className="space-card">
            <h2 className="space-card-title">{space.title}</h2>
            <p className="space-card-desc">{space.description}</p>
            <div className="space-card-meta">
              <span>{space.room_count} rooms</span>
              <span>·</span>
              <span>{space.card_count} cards</span>
            </div>
          </Link>
        ))}
      </div>

      {showModal && (
        <NewSpaceModal
          onClose={() => setShowModal(false)}
          onCreated={(space) => {
            setSpaces([...spaces, space]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function NewSpaceModal({ onClose, onCreated }: { onClose: () => void; onCreated: (s: any) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const space = await api.createSpace(title, description);
      onCreated(space);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Create New Space</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>
          {error && <div className="login-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
