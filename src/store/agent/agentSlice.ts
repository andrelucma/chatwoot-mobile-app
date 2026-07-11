import { createSlice } from '@reduxjs/toolkit';
import type { Agent } from '@/types';
import { agentActions } from './agentActions';

export interface AgentState {
  records: Agent[];
  uiFlags: {
    isLoading: boolean;
    hasError: boolean;
  };
}

const initialState: AgentState = {
  records: [],
  uiFlags: {
    isLoading: false,
    hasError: false,
  },
};

const agentSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(agentActions.fetchAgents.pending, state => {
        state.uiFlags.isLoading = true;
        state.uiFlags.hasError = false;
      })
      .addCase(agentActions.fetchAgents.fulfilled, (state, action) => {
        state.records = action.payload;
        state.uiFlags.isLoading = false;
      })
      .addCase(agentActions.fetchAgents.rejected, state => {
        state.uiFlags.isLoading = false;
        state.uiFlags.hasError = true;
      });
  },
});

export default agentSlice.reducer;
