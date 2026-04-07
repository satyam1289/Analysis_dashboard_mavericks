import { useEffect, useState } from "react";
import { getScopes } from "../../api/results";
import { useResults } from "../../hooks/useResults";
import { SearchableSelector } from "../common/SearchableSelector";
import { ReachLensbadge } from "../common/ReachLensbadge";
import { ClientView } from "./ClientView";
import { SectorView } from "./SectorView";
import { ComparisonView as CompView } from "./ComparisonView";
import { ReachLensView } from "./ReachLensView";
import { ALL_CLIENTS } from "../../constants/clients";

export function DashboardLayout({ uploadId }: { uploadId: string }) {
  const [scope, setScope] = useState<"sector" | "client" | "compare" | "reach">("sector");
  const [scopeValue, setScopeValue] = useState("General");
  const [keywordOptions, setKeywordOptions] = useState<string[]>(["General"]);
  const { data, loading, error } = useResults(uploadId, scope === "reach" ? "sector" : scope, scope === "reach" ? "General" : scopeValue);

  // Fetch the actual keyword values from the uploaded data
  useEffect(() => {
    if (!uploadId || scope === "reach") return;
    const fetchScope = scope === "compare" ? "client" : scope;
    getScopes(uploadId, fetchScope as "sector" | "client")
      .then((values) => {
        let allOptions = ["General"];
        if (scope === "client" || scope === "compare") {
          // Merge detected clients with target list from user
          const merged = Array.from(new Set([...values, ...ALL_CLIENTS])).sort();
          allOptions = ["General", ...merged];
        } else {
          allOptions = ["General", ...values];
        }
        setKeywordOptions(allOptions);
        setScopeValue("General");
      })
      .catch((err) => {
        setKeywordOptions(["General"]);
        setScopeValue("General");
      });
  }, [uploadId, scope]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium tracking-wide">Crunching data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 m-8 rounded-xl bg-red-50 border border-red-200 shadow-sm text-center">
        <h3 className="text-xl font-semibold text-red-700 mb-2">Analysis Failed</h3>
        <p className="text-red-600">{error.toString()}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.meta?.total_articles === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center">
        <div className="w-24 h-24 mb-4 rounded-full bg-gray-100 flex items-center justify-center shadow-inner">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-2">No Results Found</h3>
        <p className="text-gray-500 max-w-sm">No actionable insights found for this selection.</p>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-8 animate-fade-in pb-12">
      {/* View & Scope Controller */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200/50">
          <button
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${
              scope === "sector" 
              ? "bg-white text-blue-600 shadow-md transform scale-105" 
              : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setScope("sector")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            Keyword View
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${
              scope === "client" 
              ? "bg-white text-blue-600 shadow-md transform scale-105" 
              : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setScope("client")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Client View
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${
              scope === "compare" 
              ? "bg-white text-blue-600 shadow-md transform scale-105" 
              : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setScope("compare")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2" /></svg>
            COMPARE BRANDS 
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${
              scope === "reach" 
              ? "bg-white text-blue-600 shadow-md transform scale-105" 
              : "text-slate-500 hover:text-slate-800"
            }`}
            onClick={() => setScope("reach")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            REACH LENS
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Analysis For</span>
            <SearchableSelector
              value={scopeValue}
              options={keywordOptions}
              onChange={setScopeValue}
              placeholder={scope === "client" ? "Search for client..." : "Search for keyword..."}
            />
          </div>
          <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
          <ReachLensbadge enabled={Boolean(data?.reachlens_enabled)} />
        </div>
      </div>

      <div className="bg-slate-50 rounded-3xl min-h-[600px] border border-slate-100/50 pb-12">
        {scope === "sector" ? (
          <SectorView data={data} />
        ) : scope === "client" ? (
          <ClientView data={data} />
        ) : scope === "compare" ? (
          <CompView uploadId={uploadId} mainClient={scopeValue} mainData={data} />
        ) : (
          <ReachLensView />
        )}
      </div>
    </div>
  );
}
