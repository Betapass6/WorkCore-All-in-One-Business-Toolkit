import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  useToast,
} from '@chakra-ui/react'
import serviceService from '../services/service.service'

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  duration: z.number().min(1),
})

type ServiceFormData = z.infer<typeof serviceSchema>

interface ServiceFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  initialData?: ServiceFormData & { id?: string }
}

export function ServiceForm({ isOpen, onClose, onSuccess, initialData }: ServiceFormProps) {
  const toast = useToast()
  const { register, handleSubmit, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData,
  })
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: ServiceFormData) => {
    setLoading(true)
    try {
      if (initialData?.id) {
        await serviceService.updateService(initialData.id, data)
      } else {
        await serviceService.createService(data)
      }
      toast({
        title: `Service ${initialData ? 'updated' : 'created'} successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      onSuccess?.()
      onClose()
    } catch (error) {
      toast({
        title: `Error ${initialData ? 'updating' : 'creating'} service`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{initialData ? 'Edit Service' : 'Add Service'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input {...register('name')} />
              </FormControl>

              <FormControl isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea {...register('description')} />
              </FormControl>

              <FormControl isInvalid={!!errors.price}>
                <FormLabel>Price</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField {...register('price', { valueAsNumber: true })} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isInvalid={!!errors.duration}>
                <FormLabel>Duration (minutes)</FormLabel>
                <NumberInput min={1}>
                  <NumberInputField {...register('duration', { valueAsNumber: true })} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                isLoading={loading}
                width="full"
              >
                {initialData ? 'Update Service' : 'Create Service'}
              </Button>
            </VStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
