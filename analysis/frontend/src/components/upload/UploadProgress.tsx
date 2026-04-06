type Props = { uploadId: string; status: string };

export function UploadProgress({ uploadId, status }: Props) {
  const isComplete = status === "complete";
  const isFailed = status === "failed";
  const isProcessing = !isComplete && !isFailed;

  return (
    <div className="max-w-3xl mx-auto mt-8 animate-fade-in">
      <div className="dashboard-card p-8 border-l-8 border-l-blue-600">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner
               ${isProcessing ? 'bg-blue-50 text-blue-600 animate-pulse' : ''}
               ${isComplete ? 'bg-emerald-50 text-emerald-600' : ''}
               ${isFailed ? 'bg-rose-50 text-rose-600' : ''}`}>
               {isProcessing && <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>}
               {isComplete && <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>}
               {isFailed && <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/></svg>}
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {isProcessing ? 'Analysis in Progress' : ''}
                  {isComplete ? 'Analysis Finalized' : ''}
                  {isFailed ? 'Processing Interrupted' : ''}
                </h3>
                <p className="text-sm font-medium text-slate-500 font-mono tracking-tighter uppercase">ID: {uploadId.slice(0, 8)}...{uploadId.slice(-4)}</p>
             </div>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest
            ${isProcessing ? 'bg-blue-100 text-blue-700 animate-pulse' : ''}
            ${isComplete ? 'bg-emerald-100 text-emerald-700' : ''}
            ${isFailed ? 'bg-rose-100 text-rose-700' : ''}`}>
            {status}
          </span>
        </div>

        {isProcessing && (
          <div className="space-y-4">
             <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-2/3 animate-progress-indeterminate origin-left"></div>
             </div>
             <p className="text-sm text-slate-500 font-medium">Please wait while our models extract entities, calculate sentiment scores, and generate competitive intelligence artifacts.</p>
          </div>
        )}

        {isComplete && (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
            <span className="text-xl">✅</span>
            <p className="text-sm font-medium text-emerald-800">Intelligence artifact generated successfully. Reviewing insights in the dashboard below.</p>
          </div>
        )}
      </div>
    </div>
  );
}
