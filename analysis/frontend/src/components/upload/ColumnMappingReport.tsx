export function ColumnMappingReport({ mappings }: { mappings: Record<string, string | null> }) {
  return (
    <div>
      <h4>Column Mapping Report</h4>
      <ul>
        {Object.entries(mappings).map(([k, v]) => (
          <li key={k}>
            {k}: {v ?? "not mapped"}
          </li>
        ))}
      </ul>
    </div>
  );
}
