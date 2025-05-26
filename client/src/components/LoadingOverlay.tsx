import React from 'react'
import { Box, Spinner, Text, VStack } from '@chakra-ui/react'

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
}

export function LoadingOverlay({ isLoading, message = 'Loading...' }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
    >
      <VStack spacing={4}>
        <Spinner size="xl" color="white" />
        <Text color="white">{message}</Text>
      </VStack>
    </Box>
  )
} 