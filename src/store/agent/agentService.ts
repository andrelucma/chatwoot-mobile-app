import { apiService } from '@/services/APIService';
import type { AgentAPIResponse } from './agentTypes';
import { transformAgent } from '@/utils/camelCaseKeys';
import { Agent } from '@/types';

export class AgentService {
  static async getAgents(): Promise<Agent[]> {
    const response = await apiService.get<AgentAPIResponse>('agents');
    return response.data.map(transformAgent);
  }
}
