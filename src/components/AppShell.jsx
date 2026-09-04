import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, BellRing, LineChart, LayoutDashboard, MessageSquare, PieChart, Search, Settings, LogOut, Menu } from 'lucide-react';
import { useAuthStore, useUiStore } from '../store/index.js';
import { useAlerts } from '../hooks/queries.js';
import SearchDialog from './SearchDialog.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/portfolio', label: 'Portfólio', icon: PieChart },
  { to: '/alertas', label: 'Alertas', icon: Bell },
  { to: '/meus-alertas', label: 'Meus alertas', icon: BellRing },
  { to: '/chat', label: 'Chat IA', icon: MessageSquare },
  { to: '/busca', label: 'Buscar ativos', icon: Search },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function AppShell({ children }) {
  const { usuario, signOut } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSearchOpen } = useUiStore();
  const { data: alerts } = useAlerts();
  const navigate = useNavigate();
  const naoLidos = (alerts ?? []).filter((a) => a.ativo && !a.lido).length;

  return (
    <div className="flex h-full">
      <aside
        className={`${sidebarOpen ? 'w-60' : 'w-16'} hidden shrink-0 flex-col border-r border-[#21262d] bg-[#010409] transition-all md:flex`}
      >
        <div className="flex h-16 items-center gap-2.5 px-4">
          <img src="/icone.png" alt="" className="h-8 w-8" />
          {sidebarOpen && (
            <div className="leading-tight">
              <div className="text-sm font-extrabold text-fg-0">Análise de Ativos</div>
              <div className="text-[10px] uppercase tracking-widest text-fg-3">B3 · Cripto</div>
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-2 py-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-[#0d1117] text-fg-0' : 'text-fg-2 hover:bg-[#0d1117] hover:text-fg-1'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span className="flex-1">{label}</span>}
              {sidebarOpen && to === '/alertas' && naoLidos > 0 && (
                <span className="rounded-full bg-down px-1.5 text-[11px] font-bold text-[#0d1117]">{naoLidos}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#21262d] p-3">
          {sidebarOpen && (
            <div className="mb-2 truncate px-1 text-xs text-fg-3">
              {usuario?.nome}
              <div className="truncate text-[11px]">{usuario?.email}</div>
            </div>
          )}
          <button
            onClick={() => {
              signOut();
              navigate('/login');
            }}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm text-fg-2 hover:bg-[#0d1117] hover:text-fg-1"
          >
            <LogOut size={18} />
            {sidebarOpen && 'Sair'}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border-soft bg-surface px-4 md:px-6">
          <button onClick={toggleSidebar} className="hidden rounded-sm p-2 text-fg-2 hover:bg-muted md:block">
            <Menu size={18} />
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-1 items-center gap-2 rounded-sm border border-border-main bg-elevated px-3 py-2 text-sm text-fg-3 hover:border-accent md:max-w-sm"
          >
            <Search size={16} />
            Buscar ativo por ticker ou nome
            <kbd className="ml-auto hidden rounded border border-border-main px-1.5 text-[11px] text-fg-3 md:block">/</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <Link to="/alertas" className="relative rounded-sm p-2 text-fg-2 hover:bg-muted hover:text-fg-0">
              <Bell size={18} />
              {naoLidos > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-down" />}
            </Link>
            <Link to="/chat" className="rounded-sm p-2 text-fg-2 hover:bg-muted hover:text-fg-0">
              <LineChart size={18} />
            </Link>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      <SearchDialog />
    </div>
  );
}
