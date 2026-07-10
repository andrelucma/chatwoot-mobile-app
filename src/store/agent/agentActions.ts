import { createAsyncThunk } from '@reduxjs/toolkit';
import { AgentService } from './agentService';
import { Agent } from '@/types';

export const agentActions = {
  fetchAgents: createAsyncThunk<Agent[], void>(
    'agents/fetchAgents',
    async (_, { rejectWithValue }) => {
      try {
        return await AgentService.getAgents();
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        return rejectWithValue(message);
      }
    },
  ),
};
