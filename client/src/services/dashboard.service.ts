import api from './api'
import { DashboardStats } from '../types/dashboard'

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const url = `/api/dashboard`;
    const response = await api.get(url);
    return response.data;
  }
}

export default new DashboardService()