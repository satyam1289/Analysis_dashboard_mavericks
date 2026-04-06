export function WidgetSkeleton() {
  return (
    <div className="animate-pulse bg-slate-100 rounded-xl h-[300px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
        <div className="w-32 h-3 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  );
}
