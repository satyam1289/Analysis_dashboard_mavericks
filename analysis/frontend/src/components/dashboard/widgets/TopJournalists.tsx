export function TopJournalists({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {data.slice(0, 10).map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/60 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {item.author ? item.author.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors uppercase tracking-tight">{item.author}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Journalist / Contributor</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-slate-900 leading-none">
                {Number(item.article_count).toLocaleString()}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Mentions</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
