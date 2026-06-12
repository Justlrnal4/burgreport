import { PanelShell } from '@/components/search-terminal/PanelShell';
import type { SearchResult } from '@/types/burgreport';

export function ClimatReferencePanel({ result }: { result: SearchResult }) {
  const facts = [
    ['Name', result.climat.name],
    ['Village', result.climat.village],
    ['Côte', result.climat.cote],
    ['Grape', result.climat.grape],
    ['Color', result.climat.color],
    ['Size', `${result.climat.sizeHa || 0} ha`],
    ['Monopole', result.climat.isMonopole ? 'Yes' : 'No']
  ];

  return (
    <PanelShell title="Climat reference" eyebrow="Static Grand Cru data" status="reference">
      <div className="grid gap-2 sm:grid-cols-2">
        {facts.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-surface/70 p-3">
            <p className="font-mono text-[10px] uppercase tracking-normal text-hint">{label}</p>
            <p className={`mt-1 text-sm text-cream ${label === 'Size' ? 'font-mono' : ''}`}>{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">{result.description}</p>
    </PanelShell>
  );
}
