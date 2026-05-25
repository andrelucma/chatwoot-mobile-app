import type { RootState } from '@/store';
import { teamAdapter } from './teamSlice';
import { createSelector } from '@reduxjs/toolkit';
import i18n from '@/i18n';

export const selectTeamsState = (state: RootState) => state.teams;

export const selectLoading = createSelector([selectTeamsState], state => state.isLoading);

export const { selectAll: selectAllTeams } = teamAdapter.getSelectors<RootState>(selectTeamsState);

export const filterTeams = createSelector(
  [selectAllTeams, (state: RootState, searchTerm: string) => searchTerm],
  (teams, searchTerm) => {
    const teamsList = [
      {
        id: '0',
        name: i18n.t('CONVERSATION.NONE'),
        description: null,
        allowAutoAssign: false,
        accountId: 0,
        isMember: false,
      },
      ...teams,
    ];

    return searchTerm ? teamsList.filter(team => team?.name?.includes(searchTerm)) : teamsList;
  },
);
