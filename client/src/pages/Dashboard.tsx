import React from 'react'
import { Box, Grid, Heading, Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/react'
import { useFetch } from '../hooks/useFetch'
import { DashboardLayout } from '../layouts/DashboardLayout'

export default function Dashboard() {
  const { data: stats } = useFetch<{
    totalProducts: number
    totalServices: number
    totalBookings: number
    totalRevenue: number
  }>({ url: '/api/dashboard/stats' })

  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading mb={6}>Dashboard</Heading>
        <Grid templateColumns="repeat(4, 1fr)" gap={6}>
          <Stat>
            <StatLabel>Total Products</StatLabel>
            <StatNumber>{stats?.totalProducts || 0}</StatNumber>
            <StatHelpText>Active inventory items</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Total Services</StatLabel>
            <StatNumber>{stats?.totalServices || 0}</StatNumber>
            <StatHelpText>Available services</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Total Bookings</StatLabel>
            <StatNumber>{stats?.totalBookings || 0}</StatNumber>
            <StatHelpText>Current bookings</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Total Revenue</StatLabel>
            <StatNumber>${stats?.totalRevenue || 0}</StatNumber>
            <StatHelpText>This month</StatHelpText>
          </Stat>
        </Grid>
      </Box>
    </DashboardLayout>
  )
}
