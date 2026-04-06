export function TopCompanies({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 py-2">
      {data.slice(0, 10).map((item, idx) => {
        const percentage = Math.max(10, (item.count / data[0].count) * 100);
        return (
          <div key={idx} className="flex flex-col gap-1 group">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.name}</span>
              <span className="text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                {item.count} Mentions
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-blue-500/80 group-hover:bg-blue-600 rounded-full transition-all duration-700 ease-in-out`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
