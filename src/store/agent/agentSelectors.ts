import type { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';
import { MAINTENANCE_AGENT_EMAILS } from '@/constants';

export const selectAgentsState = (state: RootState) => state.agents;

export const selectAgentsLoading = createSelector(
  [selectAgentsState],
  state => state.uiFlags.isLoading,
);

export const selectAgentsList = createSelector([selectAgentsState], state =>
  state.records
    .filter(agent => !MAINTENANCE_AGENT_EMAILS.includes(agent.email || ''))
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR', { sensitivity: 'base' })),
);
