import axios from 'axios'
import { DashboardStats } from '../types/dashboard'

const API_URL = '/api/dashboard'

class DashboardService {
  async getStats(role?: string): Promise<DashboardStats> {
    const params = new URLSearchParams();
    if (role) {
      params.append('role', role);
    }
    const response = await axios.get(`${API_URL}?${params.toString()}`)
    return response.data
  }
}

export default new DashboardService() 