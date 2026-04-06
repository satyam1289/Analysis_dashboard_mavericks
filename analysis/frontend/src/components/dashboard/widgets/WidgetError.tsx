export function WidgetError({ onRetry }: { onRetry: () => void }) {
  return (
    <div>
      <div>Failed to load</div>
      <button onClick={onRetry}>Retry</button>
    </div>
  );
}
