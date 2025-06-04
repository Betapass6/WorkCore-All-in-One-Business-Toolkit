import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import {
  ShoppingCart as ShoppingCartIcon,
  Event as EventIcon,
  Feedback as FeedbackIcon,
  Folder as FolderIcon,
  Add as AddIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { DashboardStats } from '../types/dashboard'
import dashboardService from '../services/dashboard.service'

const Grid = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(12, 1fr)',
  '& > *': {
    gridColumn: 'span 12',
    [theme.breakpoints.up('md')]: {
      gridColumn: 'span 6',
    },
    [theme.breakpoints.up('lg')]: {
      gridColumn: 'span 3',
    },
  },
}))

const GridItem = styled('div')(({ theme }) => ({
  gridColumn: 'span 12',
}))

const ButtonGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
}))

const Dashboard = () => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getStats()
      setStats(data)
    } catch (error) {
      showToast('Failed to fetch dashboard stats', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>

      <Grid>
        {/* Stats Cards */}
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Products
            </Typography>
            <Typography variant="h4">{stats?.totalProducts || 0}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Services
            </Typography>
            <Typography variant="h4">{stats?.totalServices || 0}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Bookings
            </Typography>
            <Typography variant="h4">{stats?.totalBookings || 0}</Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h4">${stats?.totalRevenue || 0}</Typography>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <GridItem>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {stats?.recentActivity?.map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {activity.type === 'product' && <ShoppingCartIcon />}
                      {activity.type === 'booking' && <EventIcon />}
                      {activity.type === 'feedback' && <FeedbackIcon />}
                      {activity.type === 'file' && <FolderIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={new Date(activity.timestamp).toLocaleString()}
                    />
                    <Chip
                      label={activity.type}
                      size="small"
                      color={
                        activity.type === 'product'
                          ? 'primary'
                          : activity.type === 'booking'
                          ? 'secondary'
                          : activity.type === 'feedback'
                          ? 'success'
                          : 'default'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </GridItem>

        {/* Quick Actions */}
        <GridItem>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <ButtonGrid>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/products/new')}
                >
                  Add Product
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/services/new')}
                >
                  Add Service
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/bookings/new')}
                >
                  New Booking
                </Button>
              </ButtonGrid>
            </CardContent>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  )
}

export default Dashboard
