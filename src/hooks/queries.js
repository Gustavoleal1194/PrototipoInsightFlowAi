import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';

export const useWatchlist = () => useQuery({ queryKey: ['watchlist'], queryFn: () => api.getWatchlist() });
export const useAsset = (t) => useQuery({ queryKey: ['asset', t], queryFn: () => api.getAsset(t), enabled: !!t });
export const useHistory = (t, p) =>
  useQuery({ queryKey: ['history', t, p], queryFn: () => api.getHistory(t, p), enabled: !!t });
export const useIndicators = (t) =>
  useQuery({ queryKey: ['indicators', t], queryFn: () => api.getIndicatorSnapshot(t), enabled: !!t });
export const useSignals = (params) => useQuery({ queryKey: ['signals', params], queryFn: () => api.getSignals(params) });
export const useScore = (t) => useQuery({ queryKey: ['score', t], queryFn: () => api.getScore(t), enabled: !!t });
export const useSearch = (termo) => useQuery({ queryKey: ['search', termo], queryFn: () => api.searchAssets(termo) });
export const useOperations = () => useQuery({ queryKey: ['operations'], queryFn: () => api.getOperations() });
export const usePositions = () => useQuery({ queryKey: ['positions'], queryFn: () => api.getPositions() });
export const usePortfolio = () => useQuery({ queryKey: ['portfolio'], queryFn: () => api.getPortfolioSummary() });
export const useDistribution = () => useQuery({ queryKey: ['distribution'], queryFn: () => api.getDistribution() });
export const useAlerts = () => useQuery({ queryKey: ['alerts'], queryFn: () => api.getAlerts() });
export const useAnalysis = (t) =>
  useQuery({ queryKey: ['analysis', t], queryFn: () => api.getAssetAnalysis(t), enabled: !!t });
export const useDailySummary = () => useQuery({ queryKey: ['daily'], queryFn: () => api.getDailySummary() });

export const useUserRules = () => useQuery({ queryKey: ['userRules'], queryFn: () => api.getUserRules() });
export const useUserTriggers = () => useQuery({ queryKey: ['userTriggers'], queryFn: () => api.getUserTriggers() });

export function useUserRuleMutations() {
  const qc = useQueryClient();
  const inv = () => {
    qc.invalidateQueries({ queryKey: ['userRules'] });
    qc.invalidateQueries({ queryKey: ['userTriggers'] });
  };
  return {
    create: useMutation({ mutationFn: (r) => api.createUserRule(r), onSuccess: inv }),
    toggle: useMutation({ mutationFn: (id) => api.toggleUserRule(id), onSuccess: inv }),
    remove: useMutation({ mutationFn: (id) => api.deleteUserRule(id), onSuccess: inv }),
  };
}

export function useCreateOperation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (op) => api.createOperation(op),
    onSuccess: () => {
      ['operations', 'positions', 'portfolio', 'distribution'].forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
    },
  });
}

export function useWatchlistMutations() {
  const qc = useQueryClient();
  const inv = () => qc.invalidateQueries({ queryKey: ['watchlist'] });
  return {
    add: useMutation({ mutationFn: (t) => api.addToWatchlist(t), onSuccess: inv }),
    remove: useMutation({ mutationFn: (t) => api.removeFromWatchlist(t), onSuccess: inv }),
    toggle: useMutation({ mutationFn: (t) => api.toggleNotify(t), onSuccess: inv }),
  };
}

export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.markAlertRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}
