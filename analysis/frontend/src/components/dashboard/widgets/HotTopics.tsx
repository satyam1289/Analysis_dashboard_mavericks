interface HotTopicsProps {
  data: any[];
  message?: string;
}

export function HotTopics({ data, message }: HotTopicsProps) {
  if (message) return <div className="p-8 text-center text-slate-400 italic text-sm">{message}</div>;
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-xl">🔥</div>
        <div>
          <p className="text-xs font-bold text-amber-800 uppercase tracking-widest leading-none mb-1">Spike Alert</p>
          <p className="text-sm font-medium text-amber-700">Analyzing emergent trends in {new Date().toLocaleDateString()} batch...</p>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        {data.slice(0, 5).map((item, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
             <div className="flex items-center gap-3">
                <span className="w-5 h-5 flex items-center justify-center text-[10px] font-black text-white bg-slate-800 rounded-md">
                   {idx + 1}
                </span>
                <span className="font-bold text-slate-700 text-sm tracking-tight">{item.topic}</span>
             </div>
             <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase
               ${item.score > 2.0 ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
               Z-Score: {item.score.toFixed(2)}
             </span>
          </div>
        ))}
      </div>
    </div>
  );
}
