import { create } from 'zustand'
import { serviceService, Service } from '../services/service.service'

interface ServiceState {
  services: Service[]
  loading: boolean
  error: string | null
  fetchServices: () => Promise<void>
  addService: (service: Omit<Service, 'id'>) => Promise<void>
  updateService: (id: string, service: Partial<Service>) => Promise<void>
  deleteService: (id: string) => Promise<void>
}

export const useServiceStore = create<ServiceState>((set) => ({
  services: [],
  loading: false,
  error: null,
  fetchServices: async () => {
    set({ loading: true, error: null })
    try {
      const services = await serviceService.getAll()
      set({ services, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch services', loading: false })
    }
  },
  addService: async (service) => {
    set({ loading: true, error: null })
    try {
      const newService = await serviceService.create(service)
      set((state) => ({
        services: [...state.services, newService],
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to add service', loading: false })
    }
  },
  updateService: async (id, service) => {
    set({ loading: true, error: null })
    try {
      const updatedService = await serviceService.update(id, service)
      set((state) => ({
        services: state.services.map((s) =>
          s.id === id ? updatedService : s
        ),
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to update service', loading: false })
    }
  },
  deleteService: async (id) => {
    set({ loading: true, error: null })
    try {
      await serviceService.delete(id)
      set((state) => ({
        services: state.services.filter((s) => s.id !== id),
        loading: false,
      }))
    } catch (error) {
      set({ error: 'Failed to delete service', loading: false })
    }
  },
})) 