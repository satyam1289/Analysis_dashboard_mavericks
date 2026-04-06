import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

export function TopPublications({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const chartData = data.slice(0, 10).map((item, idx) => ({
    name: item.publisher,
    count: item.article_count,
    color: `hsl(${210 + idx * 15}, 70%, 50%)`
  }));

  return (
    <div className="h-[350px] w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} 
            width={120}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="custom-tooltip">
                    <p className="text-slate-500 mb-1">{payload[0].payload.name}</p>
                    <p className="text-slate-900 font-bold">{payload[0].value} Mentions</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="count" 
            radius={[0, 4, 4, 0]} 
            barSize={20}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
