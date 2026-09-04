import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { ASSETS } from '../api/mock/assets.js';
import { useCreateOperation } from '../hooks/queries.js';
import { fmtBRL } from '../lib/format.js';

const hoje = () => new Date().toISOString().slice(0, 10);
const vazio = (ticker) => ({ tipo: 'COMPRA', ticker: ticker || 'PETR4', quantidade: '', preco_unitario: '', data: hoje() });

/** UC-04 — registrar operação fictícia. `initialTicker` pré-seleciona o ativo
 * quando aberto a partir da tela de detalhe (atalho "Nova operação"). */
export default function OperationModal({ open, onClose, initialTicker }) {
  const [form, setForm] = useState(() => vazio(initialTicker));
  const [ok, setOk] = useState(false);
  const mut = useCreateOperation();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const total = (Number(form.quantidade) || 0) * (Number(form.preco_unitario) || 0);

  useEffect(() => {
    if (open) setForm(vazio(initialTicker));
  }, [open, initialTicker]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    mut.mutate(
      {
        ...form,
        quantidade: Number(form.quantidade),
        preco_unitario: Number(form.preco_unitario),
      },
      {
        onSuccess: () => {
          setOk(true);
          setTimeout(() => {
            setOk(false);
            onClose();
            setForm(vazio(initialTicker));
          }, 1400);
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="fade-in w-full max-w-md rounded-xl border border-border-main bg-surface shadow-lg" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-border-soft px-5 py-3.5">
          <h3 className="text-sm font-semibold text-fg-0">Nova operação</h3>
          <button onClick={onClose} className="text-fg-3 hover:text-fg-1">
            <X size={16} />
          </button>
        </header>

        {ok ? (
          <div className="grid place-items-center gap-3 px-5 py-12 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-tone-green-bg">
              <Check size={22} className="text-up" />
            </div>
            <p className="text-sm font-semibold text-fg-0">Operação registrada</p>
            <p className="text-xs text-fg-2">Os agregados da carteira foram recalculados.</p>
          </div>
        ) : (
          <form className="grid gap-4 p-5" onSubmit={submit}>
            <div className="grid grid-cols-2 gap-0.5 rounded-sm bg-elevated p-0.5">
              {['COMPRA', 'VENDA'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, tipo: t })}
                  className={`rounded-[6px] py-2 text-sm font-semibold transition-colors ${
                    form.tipo === t
                      ? t === 'COMPRA'
                        ? 'bg-tone-green-bg text-up'
                        : 'bg-tone-red-bg text-down'
                      : 'text-fg-3 hover:text-fg-1'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div>
              <label className="label" htmlFor="ativo">Ativo</label>
              <select id="ativo" className="input" value={form.ticker} onChange={set('ticker')}>
                {ASSETS.map((a) => (
                  <option key={a.ticker} value={a.ticker}>
                    {a.ticker} — {a.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="qtd">Quantidade</label>
                <input id="qtd" className="input num" type="number" step="any" min="0" value={form.quantidade} onChange={set('quantidade')} required />
              </div>
              <div>
                <label className="label" htmlFor="preco">Preço unitário</label>
                <input id="preco" className="input num" type="number" step="0.01" min="0" value={form.preco_unitario} onChange={set('preco_unitario')} required />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="data">Data</label>
              <input id="data" className="input num" type="date" max={hoje()} value={form.data} onChange={set('data')} required />
            </div>

            <div className="flex items-center justify-between rounded-sm border border-border-soft bg-elevated px-3 py-2.5">
              <span className="text-xs uppercase tracking-wider text-fg-3">Valor total</span>
              <span className="num text-lg font-bold text-fg-0">{fmtBRL(total)}</span>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancelar
              </button>
              <button className="btn-primary" disabled={mut.isPending}>
                {mut.isPending ? 'Registrando…' : 'Registrar operação'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
