import { useState } from "react";
import { UploadZone } from "./components/upload/UploadZone";
import { UploadProgress } from "./components/upload/UploadProgress";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { useUpload } from "./hooks/useUpload";

export function App() {
  const [uploadId, setUploadId] = useState<string | null>(null);
  const { status, startUpload } = useUpload();

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#0f172a] font-sans antialiased">
      {/* Top Bar */}
      <nav className="h-16 px-8 border-b border-[#e2e8f0] bg-white flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-[#0f172a] rounded flex items-center justify-center text-white">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">Mavericks</span>
          <span className="mx-2 text-[#e2e8f0]">|</span>
          <span className="text-sm font-medium text-[#94a3b8]">Analysis Dashboard</span>
        </div>
        {!uploadId && (
          <div className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">
            Step 1 <span className="text-[#cbd5e1] mx-1">of</span> 2
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto pt-16 px-6">
        {!uploadId ? (
          <UploadZone
            onUploaded={(id) => {
              setUploadId(id);
            }}
            onAnalyze={startUpload}
          />
        ) : (
          <div className="space-y-12 pb-24">
            <UploadProgress uploadId={uploadId} status={status} />
            {status === "complete" ? <DashboardLayout uploadId={uploadId} /> : null}
          </div>
        )}
      </main>
    </div>
  );
}
