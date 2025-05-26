import React from 'react'
import { Box, Heading, Text, Button } from '@chakra-ui/react'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box textAlign="center" py={10}>
          <Heading size="lg" mb={4}>
            Something went wrong
          </Heading>
          <Text color="gray.600" mb={4}>
            {this.state.error?.message}
          </Text>
          <Button
            colorScheme="brand"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
} 