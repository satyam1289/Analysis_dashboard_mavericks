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
      console.log(`[Upload] Starting analysis for file: ${file.name}`);
      const id = await onAnalyze(file);
      console.log(`[Upload] Analysis started. Upload ID: ${id}`);
      onUploaded(id);
    } catch (err: any) {
      console.error(`[Upload] Analysis failed:`, err);
      setError(err.message || "Failed to start analysis. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[580px] mx-auto animate-fade-in mt-12">
      <div className="bg-white p-12 border border-[#e2e8f0] rounded-2xl flex flex-col items-center shadow-none">
        
        {/* Error HUD */}
        {error && (
          <div className="w-full mb-8 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 animate-head-shake">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white shrink-0">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-0.5">Critical System Error</p>
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-rose-300 hover:text-rose-500 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" /></svg>
            </button>
          </div>
        )}

        {/* Pill Badge */}
        <div className="px-3 py-1 bg-[#0f172a] text-white rounded-full text-[11px] font-bold uppercase tracking-widest mb-8">
          Data Import · Step 1
        </div>
        
        <h2 className="text-[24px] font-medium text-[#0f172a] mb-2 text-center leading-tight">
          Upload your intelligence data
        </h2>
        <p className="text-sm text-[#64748b] mb-10 text-center">
          Mavericks will extract insights, map sentiment, and surface competitive signals.
        </p>

        <div 
          {...getRootProps()} 
          className={`w-full border-[2px] border-dashed rounded-xl h-[130px] flex flex-col items-center justify-center transition-all cursor-pointer
            ${isDragActive ? 'border-[#3b82f6] bg-[#f0f7ff]' : 'border-[#e2e8f0] bg-[#f8f9fc]'}`}
        >
          <input {...getInputProps()} />
          
          <div className="flex items-center gap-3">
             <svg className={`w-5 h-5 ${file ? 'text-blue-500' : 'text-[#94a3b8]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
               {file ? (
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
               ) : (
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0l-4 4m4-4v12" />
               )}
             </svg>
             <p className={`text-sm font-medium ${file ? 'text-[#0f172a]' : 'text-[#475569]'}`}>
               {file ? file.name : (isDragActive ? 'Drop file here' : 'Drop file here or browse')}
             </p>
             {file && (
               <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-[#94a3b8] hover:text-[#0f172a] ml-1">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" /></svg>
               </button>
             )}
          </div>
          <p className="text-[11px] text-[#94a3b8] mt-3 font-medium tracking-tight">Formats: XLSX, XLS, CSV up to 50MB</p>
        </div>

        <button
          disabled={!file || loading}
          onClick={handleAnalyze}
          className={`mt-10 py-4 rounded-lg font-bold text-sm tracking-wide transition-all w-full flex items-center justify-center gap-2
            ${!file || loading 
              ? 'bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed shadow-none' 
              : 'bg-[#0f172a] text-white hover:bg-[#1e293b] active:scale-[0.98]'}`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-[#94a3b8] border-t-white rounded-full animate-spin"></div>
              Orchestrating...
            </>
          ) : (
            'Run Mavericks Analysis →'
          )}
        </button>

        {/* Trust Line */}
        <div className="mt-8 flex items-center gap-2 text-[#94a3b8]">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
          <span className="text-[11px] font-medium tracking-tight uppercase">Data is processed in your session · Nothing is stored</span>
        </div>
      </div>
    </div>
  );
}
