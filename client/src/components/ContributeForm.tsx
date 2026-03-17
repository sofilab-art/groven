import { useState } from 'react';

interface ContributeFormProps {
  parentCard?: any;
  onSubmit: (body: string) => void;
  onClearParent?: () => void;
}

export default function ContributeForm({ parentCard, onSubmit, onClearParent }: ContributeFormProps) {
  const [body, setBody] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    onSubmit(body);
    setBody('');
  };

  return (
    <form className="contribute-form" onSubmit={handleSubmit}>
      {parentCard && (
        <div className="contribute-parent">
          <span>Responding to: <strong>{parentCard.title}</strong></span>
          <button type="button" className="btn btn-ghost" onClick={onClearParent} style={{ fontSize: '0.75rem' }}>✕ Clear</button>
        </div>
      )}
      <textarea
        className="form-textarea"
        placeholder={parentCard ? `Respond to "${parentCard.title}"...` : 'Share your thinking...'}
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={4}
      />
      <button type="submit" className="btn btn-primary" disabled={!body.trim()}>
        Preview & Review
      </button>
    </form>
  );
}
