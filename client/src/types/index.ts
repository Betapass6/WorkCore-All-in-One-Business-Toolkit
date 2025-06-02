export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
}

export interface Supplier {
  id: string
  name: string
  contact: string
  address: string
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
}

export interface Booking {
  id: string
  date: string
  time: string
  service: Service
  customer: {
    id: string
    name: string
    email: string
  }
  status: 'pending' | 'confirmed' | 'cancelled'
}

export interface Feedback {
  id: string
  title: string
  content: string
  rating: number
  createdAt: string
  userId: string
  serviceId: string
  service: Service
}

export interface File {
  id: string
  userId: string
  fileName: string
  uuid: string
  createdAt: string
  expiredAt: string
  size: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  name: string
}

export interface FileUploadRequest {
  userId: string;
  fileName: string;
  size: number;
} 