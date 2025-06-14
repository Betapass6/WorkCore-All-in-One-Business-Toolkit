import api from './api';
import { User } from '../types/user';

interface UpdateUserRoleData {
  role: string;
}

class AdminService {
  async getUsers(): Promise<User[]> {
    const response = await api.get('/admin/users');
    return response.data;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const response = await api.put<User>(`/admin/users/${id}/role`, { role });
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  }
}

export default new AdminService(); 