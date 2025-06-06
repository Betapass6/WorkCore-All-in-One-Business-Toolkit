export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'USER';
  createdAt: string;
  updatedAt: string;
} 