import React from 'react'
import { Box, VStack, Heading } from '@chakra-ui/react'
import { useFetch } from '../hooks/useFetch'
import { FileUploader } from '../components/FileUploader'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { File } from '../types'

export default function Files() {
  const { data: files, loading } = useFetch<File[]>({ url: '/api/files' })

  if (loading) return <div>Loading...</div>

  return (
    <DashboardLayout>
      <Box p={4}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="md" mb={4}>
              Upload File
            </Heading>
            <FileUploader />
          </Box>

          <Box>
            <Heading size="md" mb={4}>
              Recent Files
            </Heading>
            {files?.map((file) => (
              <Box key={file.id} p={4} borderWidth={1} borderRadius="md" mb={4}>
                <Heading size="sm">{file.fileName}</Heading>
                <Box mt={2} fontSize="sm" color="gray.500">
                  Uploaded: {new Date(file.createdAt).toLocaleDateString()}
                </Box>
                <Box mt={2} fontSize="sm" color="gray.500">
                  Expires: {new Date(file.expiredAt).toLocaleDateString()}
                </Box>
              </Box>
            ))}
          </Box>
        </VStack>
      </Box>
    </DashboardLayout>
  )
}
