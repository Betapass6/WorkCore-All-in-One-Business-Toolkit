import React from 'react'
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Heading } from '@chakra-ui/react'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { Products } from './Products'
import Services from './Services'
import Bookings from './Bookings'
import Feedback from './Feedback'
import Files from './Files'

export default function AdminPanel() {
  return (
    <DashboardLayout>
      <Box p={4}>
        <Heading mb={6}>Admin Panel</Heading>
        <Tabs>
          <TabList>
            <Tab>Products</Tab>
            <Tab>Services</Tab>
            <Tab>Bookings</Tab>
            <Tab>Feedback</Tab>
            <Tab>Files</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Products />
            </TabPanel>
            <TabPanel>
              <Services />
            </TabPanel>
            <TabPanel>
              <Bookings />
            </TabPanel>
            <TabPanel>
              <Feedback />
            </TabPanel>
            <TabPanel>
              <Files />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </DashboardLayout>
  )
}
