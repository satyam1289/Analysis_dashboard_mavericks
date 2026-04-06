import { HotTopics } from "./widgets/HotTopics";
import { NegativeWordCloud } from "./widgets/NegativeWordCloud";
import { PositiveWordCloud } from "./widgets/PositiveWordCloud";
import { SentimentOverview } from "./widgets/SentimentOverview";
import { TopCompanies } from "./widgets/TopCompanies";
import { TopJournalists } from "./widgets/TopJournalists";
import { TopPublications } from "./widgets/TopPublications";
import { WordCloud } from "./widgets/WordCloud";

const WidgetCard = ({ title, children, className = "" }: { title: string, children: any, className?: string }) => (
  <div className={`dashboard-card p-6 flex flex-col ${className} animate-slide-up`}>
    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
      <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
      {title}
    </h3>
    <div className="flex-1 w-full overflow-hidden">
      {children}
    </div>
  </div>
);

export function DashboardWidgets({ data }: { data: any }) {
  const w = data?.widgets ?? {};
  const meta = data?.meta ?? {};

  return (
    <div className="space-y-8 pb-12">
      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="dashboard-card p-6 border-l-4 border-l-blue-500">
          <p className="stat-label mb-1">Total Mentions</p>
          <p className="stat-value">{meta.total_articles?.toLocaleString()}</p>
        </div>
        <div className="dashboard-card p-6 border-l-4 border-l-emerald-500">
          <p className="stat-label mb-1">English Articles</p>
          <p className="stat-value">{meta.english_articles?.toLocaleString()}</p>
        </div>
        <div className="dashboard-card p-6 border-l-4 border-l-amber-500">
          <p className="stat-label mb-1">Duplicate Rate</p>
          <p className="stat-value">
            {meta.total_articles > 0 
              ? ((meta.duplicate_articles / meta.total_articles) * 100).toFixed(1) 
              : "0"}%
          </p>
        </div>
        <div className="dashboard-card p-6 border-l-4 border-l-rose-500">
          <p className="stat-label mb-1">Processing Errors</p>
          <p className="stat-value text-rose-600">{meta.failed_rows || 0}</p>
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Row 1 */}
        <WidgetCard title="Sentiment Breakdown" className="lg:col-span-4">
          <SentimentOverview donut={w.sentiment_overview?.donut ?? []} />
        </WidgetCard>
        
        <WidgetCard title="Top Media Outlets" className="lg:col-span-8">
          <TopPublications data={w.top_publications?.data ?? []} />
        </WidgetCard>

        {/* Row 2 */}
        <WidgetCard title="Intelligence Word Cloud" className="lg:col-span-8">
          <WordCloud data={w.word_cloud?.data ?? []} message={w.word_cloud?.message} />
        </WidgetCard>

        <WidgetCard title="Top Companies & Brands" className="lg:col-span-4">
          <TopCompanies data={w.top_companies?.data ?? []} />
        </WidgetCard>

        {/* Row 3 - Niche widgets */}
        <WidgetCard title="Top Journalists" className="lg:col-span-4">
          <TopJournalists data={w.top_journalists?.data ?? []} />
        </WidgetCard>

        <WidgetCard title="Trending Issues" className="lg:col-span-4">
          <HotTopics data={w.hot_topics?.data ?? []} message={w.hot_topics?.message} />
        </WidgetCard>

        <div className="lg:col-span-4 grid grid-rows-2 gap-8">
          <div className="dashboard-card p-5 bg-emerald-50/30 border-emerald-100">
             <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               Positive Insights
             </h4>
             <PositiveWordCloud data={w.positive_word_cloud?.data ?? []} />
          </div>
          <div className="dashboard-card p-5 bg-rose-50/30 border-rose-100">
             <h4 className="text-xs font-bold text-rose-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                Negative Risk Factors
             </h4>
             <NegativeWordCloud data={w.negative_word_cloud?.data ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
