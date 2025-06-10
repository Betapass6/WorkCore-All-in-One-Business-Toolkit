import api from './api';
import { Service } from '../types'; // Import the Service interface from the types directory

const API_BASE = '/api/services'; // Base path for service API

// Define types that exactly match what ServiceForm sends
export type CreateServiceData = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateServiceData = Partial<CreateServiceData>; // All fields optional for update

class ServiceService {
  async getServices(): Promise<Service[]> {
    const response = await api.get(API_BASE);
    return response.data;
  }

  async getService(id: string): Promise<Service> {
    const response = await api.get(`${API_BASE}/${id}`);
    return response.data;
  }

  async createService(data: CreateServiceData): Promise<Service> {
    const response = await api.post(API_BASE, data);
    return response.data;
  }

  async updateService(id: string, data: UpdateServiceData): Promise<Service> {
    const response = await api.put(`${API_BASE}/${id}`, data);
    return response.data;
  }

  async deleteService(id: string): Promise<void> {
    await api.delete(`${API_BASE}/${id}`);
  }
}

export default new ServiceService();