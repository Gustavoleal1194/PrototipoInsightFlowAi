export function Card({ title, action, children, className = '', bodyClass = 'p-4' }) {
  return (
    <section className={`card flex min-w-0 flex-col ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-border-soft px-4 py-3">
          <h3 className="text-sm font-semibold text-fg-1">{title}</h3>
          {action}
        </header>
      )}
      <div className={`min-w-0 flex-1 ${bodyClass}`}>{children}</div>
    </section>
  );
}

const TONES = {
  green: 'bg-[#0d2b1a] text-up',
  red: 'bg-[#2d1218] text-down',
  yellow: 'bg-[#2b1e00] text-warn',
  orange: 'bg-[#2b1800] text-[#e3b341]',
  blue: 'bg-[#0d1f36] text-accent',
  purple: 'bg-[#1f1040] text-purple',
  slate: 'bg-muted text-fg-2',
};

export function Pill({ tone = 'slate', children, className = '' }) {
  return <span className={`pill ${TONES[tone] ?? TONES.slate} ${className}`}>{children}</span>;
}

export function Kpi({ label, value, hint, tone }) {
  return (
    <div className="card p-4">
      <div className="text-xs font-medium uppercase tracking-wider text-fg-3">{label}</div>
      <div className={`mt-2 num text-2xl font-bold ${tone ?? 'text-fg-0'}`}>{value}</div>
      {hint && <div className="mt-1 text-xs text-fg-2">{hint}</div>}
    </div>
  );
}

export function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`animate-pulse rounded-sm bg-muted ${className}`} />;
}

export function Empty({ children }) {
  return <div className="py-10 text-center text-sm text-fg-3">{children}</div>;
}
