import { Bell, BellOff } from 'lucide-react';
import { useAuthStore, useUiStore } from '../store/index.js';
import { useWatchlist, useWatchlistMutations } from '../hooks/queries.js';
import { Card, Pill } from '../components/ui.jsx';
import { fmtDate } from '../lib/format.js';

function Toggle({ label, hint, value, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border-soft py-3.5 last:border-0">
      <div>
        <div className="text-sm font-medium text-fg-1">{label}</div>
        {hint && <p className="mt-0.5 text-xs text-fg-3">{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-accent' : 'bg-muted'}`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${value ? 'left-[22px]' : 'left-0.5'}`}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const { usuario } = useAuthStore();
  const { notificacoesPush, resumoDiario, setFlag } = useUiStore();
  const { data: watchlist } = useWatchlist();
  const { toggle } = useWatchlistMutations();

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <header>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="mt-1">Conta, notificações e preferências de exibição.</p>
      </header>

      <Card title="Conta">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-fg-3">Nome</dt>
            <dd className="text-sm text-fg-1">{usuario?.nome}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-fg-3">E-mail</dt>
            <dd className="text-sm text-fg-1">{usuario?.email}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-fg-3">Sessão</dt>
            <dd className="text-sm text-fg-1">JWT mockado, expiração de 24 h</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-fg-3">Plano</dt>
            <dd><Pill tone="green">Demonstração</Pill></dd>
          </div>
        </dl>
      </Card>

      <Card title="Notificações">
        <Toggle
          label="Web push"
          hint="Alertas de sinal técnico entregues no navegador."
          value={notificacoesPush}
          onChange={(v) => setFlag('notificacoesPush', v)}
        />
        <Toggle
          label="Resumo diário"
          hint="Resumo textual da carteira como primeira notificação do dia."
          value={resumoDiario}
          onChange={(v) => setFlag('resumoDiario', v)}
        />
      </Card>

      <Card title="Notificações por ativo" bodyClass="p-0">
        <ul>
          {(watchlist ?? []).map((w) => (
            <li key={w.ticker} className="flex items-center gap-3 border-b border-border-soft px-4 py-3 last:border-0">
              <div className="min-w-0 flex-1">
                <span className="num text-sm font-bold text-fg-0">{w.ticker}</span>
                <div className="truncate text-xs text-fg-2">Adicionado em {fmtDate(w.adicionado_em)}</div>
              </div>
              <button
                onClick={() => toggle.mutate(w.ticker)}
                className={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-xs font-semibold ${
                  w.notificar ? 'border-accent text-accent' : 'border-border-main text-fg-3'
                }`}
              >
                {w.notificar ? <Bell size={13} /> : <BellOff size={13} />}
                {w.notificar ? 'Ativas' : 'Desativadas'}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Sobre esta versão">
        <p>
          Cliente web em React + Vite consumindo uma camada de dados mockada em memória. Todos os indicadores são
          calculados no navegador a partir de séries OHLCV sintéticas e determinísticas. Nenhuma operação real é
          executada e nenhuma chamada a provedor de IA é feita.
        </p>
      </Card>
    </div>
  );
}
