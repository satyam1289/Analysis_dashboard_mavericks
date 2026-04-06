import ReactWordcloud from "react-wordcloud";

interface WordCloudProps {
  data: any[];
  message?: string;
}

export function WordCloud({ data, message }: WordCloudProps) {
  if (message) return <div className="p-8 text-center text-slate-400 italic text-sm">{message}</div>;
  if (!data || data.length === 0) return null;

  const words = data.slice(0, 100).map(d => ({
    text: d.word,
    value: Math.sqrt(d.weight) * 20
  }));

  const options: any = {
    colors: ["#3b82f6", "#10b981", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6"],
    enableTooltip: true,
    deterministic: true,
    fontFamily: "Outfit, sans-serif",
    fontSizes: [12, 48],
    fontStyle: "normal",
    fontWeight: "bold",
    padding: 3,
    rotations: 2,
    rotationAngles: [0, 90],
    scale: "sqrt",
    spiral: "archimedean"
  };

  return (
    <div className="h-[400px] w-full flex items-center justify-center p-4">
      <ReactWordcloud words={words} options={options} />
    </div>
  );
}
