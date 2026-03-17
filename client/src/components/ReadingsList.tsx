import TypeBadge from './TypeBadge';

interface Reading {
  id: string;
  reader_type: string;
  proposed_type: string;
  is_question: boolean;
  explanation?: string;
  rethink_explanation?: string;
}

interface ReadingsListProps {
  readings: Reading[];
}

export default function ReadingsList({ readings }: ReadingsListProps) {
  if (!readings || readings.length === 0) return null;

  const authorReading = readings.find(r => r.reader_type === 'author');
  const aiReading = readings.find(r => r.reader_type === 'ai');
  const contested = authorReading && aiReading &&
    (authorReading.proposed_type !== aiReading.proposed_type || authorReading.is_question !== aiReading.is_question);

  return (
    <div className="readings-list">
      {contested && <div className="readings-contested">⚡ Contested</div>}
      <div className="readings-row">
        {authorReading && (
          <div className="reading-item">
            <span className="reading-label">Author:</span>
            <TypeBadge type={authorReading.proposed_type} isQuestion={authorReading.is_question} size="sm" />
          </div>
        )}
        {aiReading && (
          <div className="reading-item">
            <span className="reading-label">AI:</span>
            <TypeBadge type={aiReading.proposed_type} isQuestion={aiReading.is_question} size="sm" />
            {aiReading.explanation && (
              <span className="reading-explanation" title={aiReading.explanation}>ℹ️</span>
            )}
          </div>
        )}
      </div>
      {aiReading?.rethink_explanation && (
        <div className="reading-rethink">
          <em>Rethink: {aiReading.rethink_explanation}</em>
        </div>
      )}
    </div>
  );
}
