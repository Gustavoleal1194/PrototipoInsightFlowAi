import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { api } from '../api/client.js';
import { useAuthStore } from '../store/index.js';
import { AuthLayout } from './Login.jsx';

export default function Register() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });
  const [verSenha, setVerSenha] = useState(false);
  const signIn = useAuthStore((s) => s.signIn);
  const navigate = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const mut = useMutation({
    mutationFn: () => api.register(form),
    onSuccess: (d) => {
      signIn(d);
      navigate('/');
    },
  });

  return (
    <AuthLayout
      titulo="Criar cadastro"
      subtitulo="Nome, e-mail e senha. O e-mail é validado como único no sistema."
      footer={
        <>
          Já tem conta? <Link to="/login">Entrar</Link>
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
          <label className="label" htmlFor="nome">Nome</label>
          <div className="field-icon-wrap">
            <User className="field-icon" />
            <input id="nome" className="input" value={form.nome} onChange={set('nome')} required />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="email2">E-mail</label>
          <div className="field-icon-wrap">
            <Mail className="field-icon" />
            <input id="email2" className="input" type="email" value={form.email} onChange={set('email')} required />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="senha2">Senha</label>
          <div className="field-icon-wrap">
            <Lock className="field-icon" />
            <input
              id="senha2"
              className="input has-toggle"
              type={verSenha ? 'text' : 'password'}
              minLength={8}
              value={form.senha}
              onChange={set('senha')}
              required
            />
            <button
              type="button"
              className="field-toggle"
              onClick={() => setVerSenha((v) => !v)}
              aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={verSenha}
            >
              {verSenha ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-fg-3">Mínimo de 8 caracteres. No backend, hash bcrypt com custo 12.</p>
        </div>
        <button className="btn-primary mt-2" disabled={mut.isPending}>
          {mut.isPending ? 'Criando conta…' : 'Criar conta'}
        </button>
      </form>
    </AuthLayout>
  );
}
