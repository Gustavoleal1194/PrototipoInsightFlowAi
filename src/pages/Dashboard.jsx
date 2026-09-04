import { Link } from 'react-router-dom';
import { Bell, BellOff, Sparkles, Trash2 } from 'lucide-react';
import { useWatchlist, useSignals, usePortfolio, useDailySummary, useWatchlistMutations } from '../hooks/queries.js';
import { generateCandles } from '../api/mock/assets.js';
import { Card, Kpi, Pill, Skeleton, Empty } from '../components/ui.jsx';
import { Sparkline } from '../components/Charts.jsx';
import Disclaimer from '../components/Disclaimer.jsx';
import { fmtBRL, fmtNum, fmtPct, sinceNow, trendClass } from '../lib/format.js';

export default function Dashboard() {
  const { data: watchlist, isLoading } = useWatchlist();
  const { data: signals } = useSignals({ apenasAtivos: true });
  const { data: portfolio } = usePortfolio();
  const { data: resumo } = useDailySummary();
  const { remove, toggle } = useWatchlistMutations();

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6">
      <header>
        <h2 className="text-2xl font-bold">Visão geral</h2>
        <p className="mt-1">
          {watchlist?.length ?? 0} ativos em watchlist · {signals?.length ?? 0} sinais ativos
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Patrimônio simulado"
          value={portfolio ? fmtBRL(portfolio.valor_total) : '—'}
          hint={portfolio ? `Custo ${fmtBRL(portfolio.custo_total)}` : ''}
        />
        <Kpi
          label="Resultado não realizado"
          value={portfolio ? fmtBRL(portfolio.resultado) : '—'}
          tone={portfolio ? trendClass(portfolio.resultado) : ''}
          hint={portfolio ? fmtPct(portfolio.resultado_pct) : ''}
        />
        <Kpi
          label="Variação do dia"
          value={portfolio ? fmtPct(portfolio.variacao_dia_pct) : '—'}
          tone={portfolio ? trendClass(portfolio.variacao_dia_pct) : ''}
          hint="Ibovespa +0,31% · CDI +0,04%"
        />
        <Kpi label="Sinais ativos" value={signals?.length ?? '—'} hint="Reavaliação a cada 15 min no pregão" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Watchlist" action={<Link to="/busca" className="text-xs font-semibold">Adicionar ativo</Link>} bodyClass="p-0">
          {isLoading ? (
            <div className="grid gap-3 p-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (watchlist ?? []).length === 0 ? (
            <Empty>Nenhum ativo na watchlist.</Empty>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wider text-fg-3">
                <tr className="border-b border-border-soft">
                  <th className="px-4 py-2 text-left font-medium">Ativo</th>
                  <th className="px-2 py-2 text-right font-medium">Preço</th>
                  <th className="px-2 py-2 text-right font-medium">Dia</th>
                  <th className="hidden px-2 py-2 text-left font-medium md:table-cell">40 pregões</th>
                  <th className="px-2 py-2 text-center font-medium">Sinais</th>
                  <th className="px-4 py-2 text-right font-medium">Alertas</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((w) => (
                  <tr key={w.ticker} className="border-b border-border-soft last:border-0 hover:bg-elevated">
                    <td className="px-4 py-2.5">
                      <Link to={`/ativo/${w.ticker}`} className="block">
                        <span className="num font-bold text-fg-0">{w.ticker}</span>
                        <span className="ml-2 text-xs text-fg-3">{w.tipo}</span>
                        <div className="truncate text-xs text-fg-2">{w.nome}</div>
                      </Link>
                    </td>
                    <td className="num px-2 py-2.5 text-right text-fg-0">{fmtNum(w.cotacao.preco)}</td>
                    <td className={`num px-2 py-2.5 text-right ${trendClass(w.cotacao.variacao_pct)}`}>
                      {fmtPct(w.cotacao.variacao_pct)}
                    </td>
                    <td className="hidden w-32 px-2 py-2.5 md:table-cell">
                      <Sparkline candles={generateCandles(w.ticker)} positive={w.cotacao.variacao_pct >= 0} />
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      {w.sinais > 0 ? <Pill tone="blue">{w.sinais}</Pill> : <span className="text-fg-3">—</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggle.mutate(w.ticker)}
                          title={w.notificar ? 'Desabilitar notificações' : 'Habilitar notificações'}
                          className={`rounded-sm p-1.5 hover:bg-muted ${w.notificar ? 'text-accent' : 'text-fg-3'}`}
                        >
                          {w.notificar ? <Bell size={15} /> : <BellOff size={15} />}
                        </button>
                        <button
                          onClick={() => remove.mutate(w.ticker)}
                          title="Remover da watchlist"
                          className="rounded-sm p-1.5 text-fg-3 hover:bg-muted hover:text-down"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <div className="grid content-start gap-6">
          <Card
            title="Resumo diário"
            action={<Sparkles size={15} className="text-purple" />}
          >
            {resumo ? (
              <>
                <p className="text-fg-1">{resumo.texto}</p>
                <Disclaimer className="mt-3" />
              </>
            ) : (
              <div className="grid gap-2">
                <Skeleton /> <Skeleton /> <Skeleton className="h-4 w-2/3" />
              </div>
            )}
          </Card>

          <Card title="Sinais ativos" bodyClass="p-0">
            {(signals ?? []).length === 0 ? (
              <Empty>Nenhum sinal ativo.</Empty>
            ) : (
              <ul>
                {signals.map((s) => (
                  <li key={s.id} className="border-b border-border-soft last:border-0">
                    <Link to={`/ativo/${s.ticker}`} className="flex items-start gap-3 px-4 py-3 hover:bg-elevated">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="num text-sm font-bold text-fg-0">{s.ticker}</span>
                          <Pill tone={s.regra.tom}>{s.regra.nome}</Pill>
                        </div>
                        <p className="mt-1 text-xs">
                          {s.backtest.ocorrencias} ocorrências em 24 meses · retorno médio {fmtPct(s.backtest.ret20)} em
                          20 pregões
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-fg-3">{sinceNow(s.data_ativacao)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
