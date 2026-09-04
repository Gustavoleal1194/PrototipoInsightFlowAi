import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      signIn: ({ token, usuario }) => set({ token, usuario }),
      signOut: () => set({ token: null, usuario: null }),
      updateUsuario: (patch) => set((s) => ({ usuario: { ...s.usuario, ...patch } })),
    }),
    { name: 'saa.auth' },
  ),
);

function aplicarTema(tema) {
  if (typeof document === 'undefined') return;
  if (tema === 'claro') document.documentElement.dataset.tema = 'claro';
  else delete document.documentElement.dataset.tema;
}

export const useUiStore = create(
  persist(
    (set, get) => ({
      periodo: '1a',
      overlays: { sma20: true, sma50: true, sma200: false, bollinger: false },
      searchOpen: false,
      settingsOpen: false,
      sidebarOpen: true,
      mobileNavOpen: false,
      notificacoesPush: true,
      notificacoesEmail: false,
      notificacoesMobile: true,
      notificacoesDesktop: true,
      resumoDiario: true,
      iaIndisponivel: false,
      tema: 'escuro',
      setPeriodo: (periodo) => set({ periodo }),
      toggleOverlay: (k) => set({ overlays: { ...get().overlays, [k]: !get().overlays[k] } }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      setTema: (tema) => {
        aplicarTema(tema);
        set({ tema });
      },
      toggleTema: () => {
        const tema = get().tema === 'claro' ? 'escuro' : 'claro';
        aplicarTema(tema);
        set({ tema });
      },
      setFlag: (k, v) => set({ [k]: v }),
    }),
    {
      name: 'saa.ui',
      onRehydrateStorage: () => (state) => {
        if (state) aplicarTema(state.tema);
      },
    },
  ),
);
