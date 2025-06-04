export interface DashboardStats {
  totalProducts: number;
  totalServices: number;
  totalBookings: number;
  totalRevenue: number;
  totalFeedback: number;
  totalFiles: number;
  myBookings?: number;
  myFiles?: number;
  myFeedback?: number;
  recentActivity: {
    type: 'product' | 'booking' | 'feedback' | 'file';
    description: string;
    timestamp: string;
  }[];
} 