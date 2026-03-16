import { useState } from 'react';
import * as api from '../api';

interface Room {
  id: string;
  room_type: string;
  title: string;
  description?: string;
  card_count: string;
}

interface RoomTabsProps {
  rooms: Room[];
  activeRoomId: string;
  onSelectRoom: (roomId: string) => void;
  spaceId: string;
  onRoomCreated: (room: Room) => void;
}

export default function RoomTabs({ rooms, activeRoomId, onSelectRoom, spaceId, onRoomCreated }: RoomTabsProps) {
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const room = await api.createRoom(spaceId, title, desc);
      onRoomCreated(room);
      setShowNew(false);
      setTitle('');
      setDesc('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="room-tabs-container">
      <div className="room-tabs">
        {rooms.map(room => (
          <button
            key={room.id}
            className={`room-tab ${room.id === activeRoomId ? 'active' : ''}`}
            onClick={() => onSelectRoom(room.id)}
          >
            <span className="room-tab-icon">{room.room_type === 'plaza' ? '🏛️' : '🔲'}</span>
            <span>{room.title}</span>
            <span className="room-tab-count">{room.card_count}</span>
          </button>
        ))}
        <button className="room-tab room-tab-new" onClick={() => setShowNew(!showNew)}>
          + New Table
        </button>
      </div>

      {showNew && (
        <form className="room-new-form" onSubmit={handleCreate}>
          <input
            className="form-input"
            placeholder="Table title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <input
            className="form-input"
            placeholder="Description (optional)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>Create</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
