import React from 'react'
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'

export default function Register() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [name, setName] = React.useState('')
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await authService.register({ email, password, name })
      toast({
        title: 'Success',
        description: 'Registration successful. Please login.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      navigate('/login')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Registration failed. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Box p={8} maxWidth="500px" borderWidth={1} borderRadius={8} boxShadow="lg">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>
          <Button type="submit" colorScheme="blue" width="full">
            Register
          </Button>
        </VStack>
      </form>
    </Box>
  )
}
