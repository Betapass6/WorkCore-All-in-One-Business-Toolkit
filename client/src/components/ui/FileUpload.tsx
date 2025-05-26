import {
  Box,
  Button,
  Text,
  useToast,
  Progress,
  VStack,
} from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FiUpload } from 'react-icons/fi'

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  accept?: string
  maxSize?: number
}

export function FileUpload({ onUpload, accept, maxSize = 5242880 }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const toast = useToast()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      if (file.size > maxSize) {
        toast({
          title: 'Error',
          description: 'File size exceeds the limit',
          status: 'error',
        })
        return
      }

      setUploading(true)
      try {
        await onUpload(file)
        toast({
          title: 'Success',
          description: 'File uploaded successfully',
          status: 'success',
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to upload file',
          status: 'error',
        })
      } finally {
        setUploading(false)
        setProgress(0)
      }
    },
    [onUpload, maxSize, toast]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    multiple: false,
  })

  return (
    <VStack spacing={4}>
      <Box
        {...getRootProps()}
        p={8}
        border="2px dashed"
        borderColor={isDragActive ? 'brand.500' : 'gray.200'}
        borderRadius="md"
        textAlign="center"
        cursor="pointer"
        _hover={{ borderColor: 'brand.500' }}
      >
        <input {...getInputProps()} />
        <FiUpload size={24} />
        <Text mt={2}>
          {isDragActive
            ? 'Drop the file here'
            : 'Drag and drop a file here, or click to select'}
        </Text>
      </Box>
      {uploading && (
        <Progress
          value={progress}
          size="sm"
          width="100%"
          colorScheme="brand"
        />
      )}
    </VStack>
  )
} 