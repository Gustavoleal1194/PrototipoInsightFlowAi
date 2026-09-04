import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      signIn: ({ token, usuario }) => set({ token, usuario }),
      signOut: () => set({ token: null, usuario: null }),
    }),
    { name: 'saa.auth' },
  ),
);

export const useUiStore = create(
  persist(
    (set, get) => ({
      periodo: '1a',
      overlays: { sma20: true, sma50: true, sma200: false, bollinger: false },
      searchOpen: false,
      sidebarOpen: true,
      notificacoesPush: true,
      resumoDiario: true,
      setPeriodo: (periodo) => set({ periodo }),
      toggleOverlay: (k) => set({ overlays: { ...get().overlays, [k]: !get().overlays[k] } }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
      setFlag: (k, v) => set({ [k]: v }),
    }),
    { name: 'saa.ui' },
  ),
);
