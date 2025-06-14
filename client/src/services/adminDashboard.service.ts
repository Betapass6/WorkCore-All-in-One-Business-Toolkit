import api from './api';

interface AdminDashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalBookings: number;
  totalFeedback: number;
  totalFiles: number;
}

class AdminDashboardService {
  async getStats(): Promise<AdminDashboardStats> {
    const response = await api.get('/admin-dashboard');
    return response.data;
  }
}

export default new AdminDashboardService(); 