import api from './api'
import { DashboardStats } from '../types/dashboard'

class DashboardService {
  async getStats(role?: string): Promise<DashboardStats> {
    const url = `/api/dashboard/${role?.toLowerCase()}`;
    const response = await api.get(url);
    return response.data;
  }
}

export default new DashboardService()