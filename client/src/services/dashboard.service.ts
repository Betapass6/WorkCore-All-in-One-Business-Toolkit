import axios from 'axios'
import { DashboardStats } from '../types/dashboard'

const API_URL = '/api/dashboard'

class DashboardService {
  async getStats(): Promise<DashboardStats> {
    const response = await axios.get(API_URL)
    return response.data
  }
}

export default new DashboardService() 