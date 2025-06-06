import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

console.log('API_URL resolved to:', API_URL);

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

const serviceService = {
  async getAllServices(): Promise<Service[]> {
    const response = await axios.get(`${API_URL}/services`);
    return response.data;
  },

  async getServiceById(id: string): Promise<Service> {
    const response = await axios.get(`${API_URL}/services/${id}`);
    return response.data;
  },

  async createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const response = await axios.post(`${API_URL}/services`, service, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  async updateService(id: string, service: Partial<Service>): Promise<Service> {
    const response = await axios.put(`${API_URL}/services/${id}`, service, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  async deleteService(id: string): Promise<void> {
    await axios.delete(`${API_URL}/services/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
};

export default serviceService;