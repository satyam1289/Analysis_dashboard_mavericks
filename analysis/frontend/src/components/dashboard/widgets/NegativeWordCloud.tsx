export function NegativeWordCloud({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {data.slice(0, 20).map((item, idx) => (
        <span 
          key={idx} 
          className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg border border-rose-100 hover:bg-rose-100 transition-colors uppercase tracking-tight"
          style={{ fontSize: `${Math.max(10, 10 + Math.sqrt(item.weight) * 2)}px` }}
        >
          {item.word}
        </span>
      ))}
    </div>
  );
}
