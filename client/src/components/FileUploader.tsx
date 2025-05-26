import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Box, Text, VStack, useToast } from '@chakra-ui/react'
import { fileService } from '../services/fileService'
import { useAuth } from '../hooks/useAuth'

export function FileUploader() {
  const toast = useToast()
  const { user } = useAuth() || { user: null }

  const onDrop = useCallback(async (acceptedFiles: globalThis.File[]) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload files',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    try {
      const file = acceptedFiles[0]
      const formData = new FormData()
      formData.append('file', file)
      
      const result = await fileService.upload({
        userId: user.id,
        fileName: file.name,
        size: file.size,
        file: file
      })

      toast({
        title: 'File uploaded successfully',
        description: `Download link: ${fileService.getDownloadUrl(result.uuid)}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error uploading file',
        description: 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [toast, user])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <Box
      {...getRootProps()}
      p={10}
      border="2px dashed"
      borderColor={isDragActive ? 'blue.400' : 'gray.200'}
      borderRadius="md"
      textAlign="center"
      cursor="pointer"
      _hover={{ borderColor: 'blue.400' }}
    >
      <input {...getInputProps()} />
      <VStack spacing={2}>
        <Text>Drag and drop a file here, or click to select</Text>
        <Text fontSize="sm" color="gray.500">
          Files will expire in 3 days
        </Text>
      </VStack>
    </Box>
  )
}
