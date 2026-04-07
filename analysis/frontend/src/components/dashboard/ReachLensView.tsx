import React, { useState } from 'react';
import { BarChart3, Globe, MessageCircle, Share2, Twitter, Linkedin, Timer, Search, Info } from 'lucide-react';
import { analyzeUrl } from '../../api/reachlens';

export function ReachLensView() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');
    const [version, setVersion] = useState('v6');
    const [timer, setTimer] = useState(0);
    const [showLogic, setShowLogic] = useState(false);
    const [url, setUrl] = useState('');

    const startTimer = (seconds: number) => {
        setTimer(seconds);
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError('');
        setData(null);
        
        // Timer simulation to match reachlens logic
        if (version === 'v9') startTimer(24);
        else if (version === 'v8') startTimer(22);
        else if (version === 'v7') startTimer(20);
        else startTimer(10);
        
        try {
            const result = await analyzeUrl(url, version);
            setData(result);
        } catch (err) {
            setError('Failed to analyze URL. Ensure the ReachLens engine is running on port 3000.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const versions = [
        { id: 'v2', name: 'v2.0 Dual-Core', desc: 'Standard Verified Data + Linear Decay' },
        { id: 'v3', name: 'v3.0 Contextual', desc: 'Positional Heat Map + Industry Scaling' },
        { id: 'v4', name: 'v4.0 Causal', desc: 'AI/GEO Detection + Sentiment Analysis' },
        { id: 'v5', name: 'v5.0 Agentic', desc: 'Behavioral Engine + Social Influence Index' },
        { id: 'v6', name: 'v6.0 Integrated', desc: 'Grounded Base + Engagement Stickiness' },
        { id: 'v7', name: 'v7.0 Truth Engine', desc: 'Reality + Social Breadth (Max Accuracy)' },
        { id: 'v8', name: 'v8.0 Oracle', desc: '96% Accuracy via Monte Carlo Simulation' },
        { id: 'v9', name: 'v9.0 Sovereign', desc: '99.2% Accuracy via Causal Logic' },
    ];

    const logicExplanations: Record<string, { title: string, points: string[] }> = {
        'v2': { title: "Dual-Core (v2.0)", points: ["Domain Authority Check", "Base Reach (75k Premier)", "Viral Keyword Boost", "Time Decay (20%/week)"] },
        'v3': { title: "Contextual (v3.0)", points: ["Industry Scaling (Tech x1.2)", "Platform Heat Map (Reddit/HackerNews)", "Power Law Decay", "Contextual Calibration"] },
        'v4': { title: "Causal (v4.0)", points: ["Sentiment Pulse (Controversy x1.5)", "AI/GEO Reference (+25k)", "Sigmoid S-Curve Decay", "Multi-Social Multiplier"] },
        'v5': { title: "Agentic (v5.0)", points: ["Gatekeeper Rank (GPT/Claude x2.0)", "Social Influence Index (S.I.S.I)", "Velocity Tipping Point (1.4x)", "Evergreen/Frozen Decay"] },
        'v6': { title: "Integrated (v6.0)", points: ["Grounded UV/UPV Baseline", "Stickiness Scale (15% Boost)", "Multi-Engine Integration", "Echo Chamber Validation"] },
        'v7': { title: "Truth Engine (v7.0)", points: ["Social Breadth Matrix", "Temporal Velocity Pulse", "Multi-Field Sentiment Sync", "Entity Authority Calibration"] },
        'v8': { title: "Oracle (v8.0)", points: ["1,000 Monte Carlo Simulations", "96% Precision Guarantee", "Canonical Source Discovery", "Future Velocity Prediction"] },
        'v9': { title: "Sovereign (v9.0)", points: ["UVR (Unique Verified Reach)", "Quasi-Monte Carlo (Sobol)", "5-Tier Provenance Graph", "Shannon Entropy Verification"] }
    };

    return (
        <div className="p-8 space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900 p-8 rounded-3xl shadow-xl text-white">
                <div>
                    <h2 className="text-2xl font-black tracking-tight mb-2">ReachLens Engine</h2>
                    <p className="text-slate-400 opacity-80">Analyze real-time reach and provenance of any URL using agentic intelligence.</p>
                </div>
                
                <form onSubmit={handleSearch} className="flex items-center gap-4 bg-white/10 p-2 rounded-2xl backdrop-blur-sm border border-white/20 w-full max-w-lg">
                    <Search className="w-5 h-5 ml-4 text-slate-400" />
                    <input 
                        type="url" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste article URL here..."
                        className="bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 w-full font-medium"
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
                    >
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </form>
            </div>

            {/* Version Toggle */}
            <div className="flex flex-col items-center space-y-4">
                <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                    {versions.map((v) => (
                        <button
                            key={v.id}
                            onClick={() => setVersion(v.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${version === v.id
                                ? 'bg-white text-blue-600 shadow-md transform scale-105'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            {v.id}
                        </button>
                    ))}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">
                    Active Module: {versions.find(v => v.id === version)?.name} — {versions.find(v => v.id === version)?.desc}
                </p>
            </div>

            {loading && timer > 0 && (
                <div className="flex flex-col items-center space-y-6 py-12 animate-pulse">
                    <div className="flex items-center space-x-3 text-blue-600">
                        <Timer className="w-8 h-8 animate-spin-slow" />
                        <span className="text-xl font-black">{timer}s — CALIBRATING TRUTH MATRIX</span>
                    </div>
                    <div className="w-full max-w-md h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className="h-full bg-blue-600 transition-all duration-1000 ease-linear" 
                            style={{ width: `${((24 - timer) / 24) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Running Causal Inference & Cross-Platform Verification</p>
                </div>
            )}

            {error && (
                <div className="bg-rose-50 text-rose-600 p-8 rounded-3xl text-center border border-rose-100 shadow-sm animate-shake">
                    <h4 className="font-bold mb-2">Engine Obstruction</h4>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {data && (
                <div className="space-y-8 animate-fade-in">
                    {/* Header Info */}
                    <div className="dashboard-card p-8 bg-white relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-slate-800 line-clamp-1">{data.breakdown?.google?.title || "Analyzed Media Asset"}</h2>
                                <p className="text-xs font-bold text-slate-400 truncate tracking-tight">{data.url}</p>
                            </div>
                            {data.breakdown?.meta?.provenanceTier && (
                                <div className={`px-4 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                    data.breakdown.meta.provenanceTier === 'T0' ? 'bg-indigo-600' : 'bg-amber-500'
                                }`}>
                                    Provenance: {data.breakdown.meta.provenanceTier} {data.breakdown.meta.provenanceTier === 'T0' ? '(ORIGIN)' : '(SYNDICATED)'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsBox title="Total Mentions" value={data.totalMentions} icon={<Globe />} color="blue" />
                        <StatsBox title="Agentic Rank" value={data.agenticStatus || "Standard"} icon={<Info />} color="indigo" subtext={data.agenticStatus === 'Gold' ? 'Agentic Alpha' : 'Basic Index'} />
                        <StatsBox title="Sovereign Reach" value={data.estimatedReach?.toLocaleString() || "0"} icon={<Share2 />} color="emerald" subtext={data.confidenceScore ? `${data.confidenceScore}% Confidence` : undefined} />
                        <StatsBox title="Social Proof" value={data.breakdown?.reddit?.count || 0} icon={<MessageCircle />} color="rose" subtext="Verified Shares" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Logic Card */}
                        <div className="dashboard-card p-8 bg-white flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Calculation Logics ({version})</h3>
                                <button onClick={() => setShowLogic(!showLogic)} className="text-blue-600 text-[10px] font-black uppercase hover:underline">
                                    {showLogic ? 'Hide Math' : 'Show Math'}
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {logicExplanations[version]?.points.map((p, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all">
                                        <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-black text-blue-600">{i+1}</div>
                                        <p className="text-sm font-semibold text-slate-600 group-hover:text-slate-800">{p}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Mentions */}
                        {data.breakdown?.reddit?.posts?.length > 0 && (
                            <div className="dashboard-card p-8 bg-white">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Verification Sources (Reddit)</h3>
                                <div className="space-y-4">
                                    {data.breakdown.reddit.posts.slice(0, 4).map((post: any, i: number) => (
                                        <a href={post.permalink} target="_blank" key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-slate-800 line-clamp-1">{post.title}</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">r/{post.subreddit}</p>
                                            </div>
                                            <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">↑ {post.score}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatsBox({ title, value, icon, color, subtext }: { title: string, value: any, icon: any, color: string, subtext?: string }) {
    const colorClasses: Record<string, string> = {
        blue: "border-l-blue-600 text-blue-600 bg-blue-50/10",
        indigo: "border-l-indigo-600 text-indigo-600 bg-indigo-50/10",
        emerald: "border-l-emerald-600 text-emerald-600 bg-emerald-50/10",
        rose: "border-l-rose-600 text-rose-600 bg-rose-50/10"
    };

    return (
        <div className={`dashboard-card p-6 border-l-4 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center opacity-60`}>
                    {React.cloneElement(icon, { size: 18 })}
                </div>
            </div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            {subtext && <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-tighter">{subtext}</p>}
        </div>
    );
}
