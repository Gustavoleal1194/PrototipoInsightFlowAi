import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useAuthStore } from '../store/index.js';

export function AuthLayout({ titulo, subtitulo, children, footer }) {
  return (
    <div className="grid h-full lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-border-soft bg-surface p-12 lg:flex">
        <div className="flex items-center gap-3">
          <img src="/icone.png" alt="" className="h-10 w-10" />
          <div className="text-sm font-extrabold leading-tight text-fg-0">
            Sistema de Análise
            <br />
            de Ativos
          </div>
        </div>
        <div className="max-w-md">
          <h1 className="text-3xl font-extrabold leading-tight text-fg-0">
            Indicadores técnicos, sinais e carteira simulada em um só lugar.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-fg-2">
            Acompanhamento de ativos da B3 e de criptomoedas com SMA, RSI, MACD, Bandas de Bollinger e volume relativo
            calculados sobre o histórico OHLCV, sinais técnicos com contexto histórico de 24 meses e registro de
            operações fictícias.
          </p>
          <ul className="mt-8 grid gap-2 text-xs text-fg-3">
            <li>· Watchlist com alertas por ativo</li>
            <li>· Backtest das ocorrências anteriores de cada sinal</li>
            <li>· Análise textual gerada por IA, sempre com aviso legal</li>
          </ul>
        </div>
        <p className="text-xs text-fg-3">
          Ferramenta de análise e apoio à decisão. Não constitui serviço de recomendação de investimento.
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img src="/icone.png" alt="" className="h-9 w-9" />
            <span className="text-sm font-extrabold text-fg-0">Análise de Ativos</span>
          </div>
          <h2 className="text-2xl font-bold text-fg-0">{titulo}</h2>
          <p className="mt-1 text-sm text-fg-2">{subtitulo}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-fg-2">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState('investidor@exemplo.com');
  const [senha, setSenha] = useState('demo1234');
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();

  const mut = useMutation({
    mutationFn: () => api.login({ email, senha }),
    onSuccess: (d) => {
      signIn(d);
      navigate('/');
    },
  });

  return (
    <AuthLayout
      titulo="Entrar"
      subtitulo="Use qualquer e-mail válido — os dados desta versão são mockados."
      footer={
        <>
          Não tem conta? <Link to="/cadastro">Criar cadastro</Link>
        </>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate();
        }}
      >
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="senha">Senha</label>
          <input id="senha" className="input" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </div>
        {mut.isError && <p className="text-xs text-down">{mut.error.message}</p>}
        <button className="btn-primary mt-2" disabled={mut.isPending}>
          {mut.isPending ? 'Autenticando…' : 'Entrar'}
        </button>
      </form>
    </AuthLayout>
  );
}
