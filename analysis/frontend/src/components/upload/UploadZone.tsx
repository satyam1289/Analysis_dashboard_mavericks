import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

type Props = {
  onAnalyze: (file: File) => Promise<string>;
  onUploaded: (uploadId: string) => void;
};

export function UploadZone({ onAnalyze, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024,
    multiple: false,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
    },
  });

  const handleAnalyze = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    try {
      const id = await onAnalyze(file);
      onUploaded(id);
    } catch (err: any) {
      setError(err.message || "The file could not be analyzed. Please verify the structure and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[620px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 mt-12">
      <div className="bg-white p-14 border border-slate-200 rounded-[32px] flex flex-col items-center shadow-xl shadow-slate-200/40 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 opacity-80"></div>
        
        {/* Error HUD */}
        {error && (
          <div className="w-full mb-10 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 animate-in shake duration-500">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-rose-800 uppercase tracking-[0.1em] mb-0.5">Integration Halted</p>
              <p className="text-xs text-rose-600 font-bold leading-relaxed">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-2 text-rose-300 hover:text-rose-500 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Phase Badge */}
        <div className="px-5 py-1.5 bg-slate-900 border border-slate-800 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-10 shadow-lg shadow-slate-900/10">
          Source Ingestion · Phase 01
        </div>
        
        <h2 className="text-3xl font-black text-slate-800 mb-3 text-center tracking-tight">
          Strategic Asset Upload
        </h2>
        <p className="text-sm font-semibold text-slate-400 mb-12 text-center max-w-sm leading-relaxed">
          Ingest your media datasets to extract patterns, decode sentiment signatures, and benchmark competition.
        </p>

        <div 
          {...getRootProps()} 
          className={`w-full border-2 border-dashed rounded-[24px] min-h-[160px] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group/drop
            ${isDragActive ? 'border-blue-500 bg-blue-50/50 scale-[1.02]' : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50 shadow-inner'}`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-4">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md
               ${file ? 'bg-emerald-500 text-white -rotate-3' : 'bg-white text-slate-400 group-hover/drop:scale-110 group-hover/drop:text-blue-500'}`}>
               {file ? (
                 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               ) : (
                 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0l-4 4m4-4v12" />
                 </svg>
               )}
             </div>
             
             <div className="text-center">
               <p className={`text-sm font-black tracking-tight ${file ? 'text-slate-800' : 'text-slate-500'}`}>
                 {file ? file.name : (isDragActive ? 'Ready for release' : 'Drop strategic file or browse sources')}
               </p>
               {!file && <p className="text-[11px] text-slate-400 mt-1 font-bold">Secure XLSX, XLS, or CSV up to 50MB</p>}
             </div>
             
             {file && (
               <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-lg">
                 <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             )}
          </div>
        </div>

        <button
          disabled={!file || loading}
          onClick={handleAnalyze}
          className={`mt-12 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.15em] transition-all w-full flex items-center justify-center gap-3 shadow-xl
            ${!file || loading 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-slate-900 text-white hover:bg-black active:scale-[0.98] shadow-slate-900/20'}`}
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Synthesizing...
            </>
          ) : (
            <>
              <span>Initialize Analysis Ecosystem</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>

        {/* Security Footer */}
        <div className="mt-10 flex items-center gap-3 text-slate-400 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
          </div>
          <span className="text-[10px] font-bold tracking-tight uppercase leading-none mt-0.5">End-to-End Session Security · Transient Data Synthesis</span>
        </div>
      </div>
    </div>
  );
}
