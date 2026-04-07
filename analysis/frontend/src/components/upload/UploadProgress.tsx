import { useState, useEffect } from "react";

type Props = { uploadId: string; status: string };

export function UploadProgress({ uploadId, status }: Props) {
  const isComplete = status === "complete";
  const isFailed = status === "failed";
  const isProcessing = !isComplete && !isFailed;
  
  const [step, setStep] = useState(0);
  const steps = [
    "Auditing media coverage...",
    "Decoding sentiment patterns...",
    "Benchmarking competitor performance...",
    "Synthesizing strategic insights...",
    "Finalizing intelligence report..."
  ];

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setStep((s) => (s + 1) % steps.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  return (
    <div className="max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className={`dashboard-card overflow-hidden transition-all duration-500 border-l-[6px] 
        ${isProcessing ? 'border-l-blue-500 shadow-blue-100' : ''}
        ${isComplete ? 'border-l-emerald-500 shadow-emerald-100' : ''}
        ${isFailed ? 'border-l-rose-500 shadow-rose-100' : ''}`}>
        
        <div className="p-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-6">
               <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center shadow-lg transition-all duration-700
                 ${isProcessing ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white animate-pulse rotate-3' : ''}
                 ${isComplete ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white scale-110' : ''}
                 ${isFailed ? 'bg-gradient-to-br from-rose-500 to-orange-600 text-white' : ''}`}>
                 
                 {isProcessing && (
                   <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                 )}
                 {isComplete && (
                   <svg className="w-9 h-9 animate-in zoom-in duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                   </svg>
                 )}
                 {isFailed && (
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 )}
               </div>
               
               <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">
                    {isProcessing && "Synthesizing Intelligence..."}
                    {isComplete && "Intelligence Report Ready"}
                    {isFailed && "Process Terminated"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">ID: {uploadId.slice(0, 10)}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-blue-400 animate-ping' : isComplete ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                  </div>
               </div>
            </div>
            
            <div className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-sm border
              ${isProcessing ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
              ${isComplete ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
              ${isFailed ? 'bg-rose-50 text-rose-600 border-rose-100' : ''}`}>
              {isProcessing ? "PROCESSING" : isComplete ? "READY" : "ERROR"}
            </div>
          </div>

          <div className="space-y-6">
            {isProcessing && (
              <div className="animate-in fade-in duration-1000">
                <div className="flex justify-between items-end mb-3">
                   <p className="text-sm font-semibold text-blue-700 animate-pulse">{steps[step]}</p>
                   <p className="text-[10px] font-bold text-slate-400 transition-all duration-300">STAGE {step + 1} / 5</p>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner border border-slate-200/50">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-blue-500/20"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
                <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-2xl">
                  Our intelligence engine is currently auditing your media dataset. We are normalizing sentiment signatures and cross-referencing competitor mentions to build your strategic dashboard.
                </p>
              </div>
            )}

            {isComplete && (
              <div className="animate-in slide-in-from-top-2 duration-500 delay-200">
                 <div className="flex items-start gap-4 p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100/80">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-800 font-bold mb-1">Synthesis Successful</p>
                      <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        The extraction process has finished. Deep strategic insights and competitive benchmarks have been mapped across your private dashboard. Explore the findings below.
                      </p>
                    </div>
                 </div>
              </div>
            )}

            {isFailed && (
              <div className="p-6 bg-rose-50/50 rounded-2xl border border-rose-100/80">
                <p className="text-rose-800 font-bold mb-1">Could not finalize intelligence artifacts</p>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  An error occurred during the multi-dimensional analysis of your dataset. Please ensure the file format matches Maverick's ingestion standards and try again.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
