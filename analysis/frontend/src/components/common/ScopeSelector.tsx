type Props = { value: string; options: string[]; onChange: (v: string) => void };

export function ScopeSelector({ value, options, onChange }: Props) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
