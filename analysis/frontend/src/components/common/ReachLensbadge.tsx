export function ReachLensbadge({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return <span style={{ marginLeft: 8, fontSize: 12 }}>ReachLens Active</span>;
}
