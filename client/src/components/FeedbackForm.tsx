import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { feedbackService } from '../services/feedbackService'
import { useToast } from '@chakra-ui/react'
import { useAuth } from '../hooks/useAuth'

const feedbackSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  rating: z.number().min(1).max(5),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
})

type FeedbackFormData = z.infer<typeof feedbackSchema>

interface FeedbackFormProps {
  productId?: string
  serviceId?: string
  onSuccess?: () => void
}

export function FeedbackForm({ productId, serviceId, onSuccess }: FeedbackFormProps) {
  const toast = useToast()
  const { user } = useAuth() || { user: null }
  const { register, handleSubmit, formState: { errors } } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      productId,
      serviceId,
    },
  })

  const onSubmit = async (data: FeedbackFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit feedback',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    try {
      await feedbackService.create({
        ...data,
        userId: user.id,
        createdAt: new Date().toISOString(),
      })
      toast({
        title: 'Feedback submitted',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error submitting feedback',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.title}>
          <FormLabel>Title</FormLabel>
          <Input {...register('title')} />
        </FormControl>

        <FormControl isInvalid={!!errors.rating}>
          <FormLabel>Rating</FormLabel>
          <NumberInput min={1} max={5}>
            <NumberInputField {...register('rating', { valueAsNumber: true })} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl isInvalid={!!errors.content}>
          <FormLabel>Content</FormLabel>
          <Textarea {...register('content')} />
        </FormControl>

        <Button type="submit" colorScheme="blue">
          Submit Feedback
        </Button>
      </VStack>
    </form>
  )
}
