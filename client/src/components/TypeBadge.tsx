interface TypeBadgeProps {
  type: string;
  isQuestion?: boolean;
  size?: 'sm' | 'md';
}

export default function TypeBadge({ type, isQuestion, size = 'md' }: TypeBadgeProps) {
  const style = size === 'sm' ? { fontSize: '0.65rem', padding: '1px 6px' } : {};
  return (
    <span className={`type-badge ${type}`} style={style}>
      {isQuestion && <span>?</span>}
      {type}
    </span>
  );
}
