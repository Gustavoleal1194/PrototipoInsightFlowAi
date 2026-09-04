import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { usePositions, usePortfolio, useDistribution, useOperations } from '../hooks/queries.js';
import { Card, Kpi, Pill, Skeleton, Empty } from '../components/ui.jsx';
import { BenchmarkChart } from '../components/Charts.jsx';
import OperationModal from '../components/OperationModal.jsx';
import { USD_BRL } from '../api/mock/assets.js';
import { fmtBRL, fmtNum, fmtPct, fmtDate, trendClass } from '../lib/format.js';

const BAR_COLORS = ['#58a6ff', '#7dfda1', '#d2a8ff', '#d29922', '#8b949e'];

function DistributionList({ titulo, itens }) {
  return (
    <div>
      <h5 className="mb-2 text-xs font-medium uppercase tracking-wider text-fg-3">{titulo}</h5>
      <ul className="grid gap-2">
        {itens.map((d, i) => (
          <li key={d.nome}>
            <div className="flex justify-between text-sm">
              <span className="text-fg-1">{d.nome}</span>
              <span className="num text-fg-2">{fmtNum(d.pct, 1)}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Portfolio() {
  const [modal, setModal] = useState(false);
  const { data: pos, isLoading } = usePositions();
  const { data: resumo } = usePortfolio();
  const { data: dist } = useDistribution();
  const { data: ops } = useOperations();

  return (
    <div className="mx-auto grid max-w-[1400px] gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Portfólio</h2>
          <p className="mt-1">Operações fictícias. O sistema não executa ordens em corretora.</p>
        </div>
        <button className="btn-primary" onClick={() => setModal(true)}>
          <Plus size={15} /> Nova operação
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Valor de mercado"
          value={resumo ? fmtBRL(resumo.valor_total) : '—'}
          hint={resumo ? `${pos?.length ?? 0} posições · posições em USD convertidas a ${fmtNum(USD_BRL)}` : ''}
        />
        <Kpi label="Custo total" value={resumo ? fmtBRL(resumo.custo_total) : '—'} />
        <Kpi
          label="Resultado"
          value={resumo ? fmtBRL(resumo.resultado) : '—'}
          tone={resumo ? trendClass(resumo.resultado) : ''}
          hint={resumo ? fmtPct(resumo.resultado_pct) : ''}
        />
        <Kpi
          label="Contra benchmarks"
          value={resumo ? fmtPct(resumo.resultado_pct - resumo.benchmarks.ibovespa) : '—'}
          tone={resumo ? trendClass(resumo.resultado_pct - resumo.benchmarks.ibovespa) : ''}
          hint={resumo ? `Ibovespa ${fmtPct(resumo.benchmarks.ibovespa)} · CDI ${fmtPct(resumo.benchmarks.cdi)}` : ''}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card title="Carteira vs. benchmarks (base 100)" bodyClass="p-3">
          {resumo ? <BenchmarkChart data={resumo.curva} /> : <Skeleton className="h-[240px]" />}
        </Card>
        <Card title="Distribuição">
          {dist ? (
            <div className="grid gap-5">
              <DistributionList titulo="Por classe de ativo" itens={dist.classe} />
              <DistributionList titulo="Por setor" itens={dist.setor} />
              <DistributionList titulo="Por moeda" itens={dist.moeda} />
            </div>
          ) : (
            <div className="grid gap-2">
              <Skeleton /> <Skeleton /> <Skeleton />
            </div>
          )}
        </Card>
      </div>

      <Card title="Posições" bodyClass="p-0">
        {isLoading ? (
          <div className="grid gap-3 p-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : (pos ?? []).length === 0 ? (
          <Empty>Nenhuma posição aberta.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-xs uppercase tracking-wider text-fg-3">
                <tr className="border-b border-border-soft">
                  <th className="px-4 py-2 text-left font-medium">Ativo</th>
                  <th className="px-2 py-2 text-right font-medium">Qtd.</th>
                  <th className="px-2 py-2 text-right font-medium">Preço médio</th>
                  <th className="px-2 py-2 text-right font-medium">Preço atual</th>
                  <th className="px-2 py-2 text-right font-medium">Valor</th>
                  <th className="px-4 py-2 text-right font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((p) => (
                  <tr key={p.ticker} className="border-b border-border-soft last:border-0 hover:bg-elevated">
                    <td className="px-4 py-2.5">
                      <Link to={`/ativo/${p.ticker}`}>
                        <span className="num font-bold text-fg-0">{p.ticker}</span>
                        <div className="truncate text-xs text-fg-2">{p.tipo === 'CRIPTO' ? 'CRIPTO' : p.setor}</div>
                      </Link>
                    </td>
                    <td className="num px-2 py-2.5 text-right">{fmtNum(p.quantidade, p.tipo === 'CRIPTO' ? 4 : 0)}</td>
                    <td className="num px-2 py-2.5 text-right">{fmtNum(p.preco_medio)}</td>
                    <td className="num px-2 py-2.5 text-right">{fmtNum(p.preco_atual)}</td>
                    <td className="num px-2 py-2.5 text-right text-fg-0">{fmtBRL(p.valor_atual, p.moeda)}</td>
                    <td className={`num px-4 py-2.5 text-right ${trendClass(p.resultado)}`}>
                      {fmtBRL(p.resultado, p.moeda)}
                      <div className="text-xs">{fmtPct(p.resultado_pct)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Operações registradas" bodyClass="p-0">
        <ul>
          {(ops ?? []).map((o) => (
            <li key={o.id} className="flex items-center gap-3 border-b border-border-soft px-4 py-2.5 last:border-0">
              <Pill tone={o.tipo === 'COMPRA' ? 'green' : 'red'}>{o.tipo}</Pill>
              <span className="num text-sm font-bold text-fg-0">{o.ticker}</span>
              <span className="num text-sm text-fg-2">
                {fmtNum(o.quantidade, o.quantidade < 1 ? 4 : 0)} × {fmtNum(o.preco_unitario)}
              </span>
              <span className="num ml-auto text-sm text-fg-1">{fmtBRL(o.quantidade * o.preco_unitario)}</span>
              <span className="num w-20 text-right text-xs text-fg-3">{fmtDate(o.data)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <OperationModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}
