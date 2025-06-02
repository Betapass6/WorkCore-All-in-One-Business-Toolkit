import { Box, VStack, Heading, Button, HStack, Spinner, useToast } from '@chakra-ui/react'
import { useFetch } from '../hooks/useFetch'
import { FileUploader } from '../components/FileUploader'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { File } from '../types'
import fileService from '../services/file.service'

export default function Files() {
  const { data: files, loading } = useFetch<File[]>({ url: '/api/files' })
  const toast = useToast()

  const handleDownload = (uuid: string) => {
    const url = fileService.getDownloadUrl(uuid)
    window.open(url, '_blank')
  }

  const handleDelete = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId)
      toast({
        title: 'Success',
        description: 'File deleted successfully',
        status: 'success',
        duration: 3000,
      })
      // Refresh the data
      window.location.reload()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        status: 'error',
        duration: 3000,
      })
    }
  }

  if (loading) return <Spinner />

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
                <HStack mt={4}>
                  <Button size="sm" colorScheme="blue" onClick={() => handleDownload(file.uuid)}>
                    Download
                  </Button>
                  <Button size="sm" colorScheme="red" onClick={() => handleDelete(file.id)}>
                    Delete
                  </Button>
                </HStack>
              </Box>
            ))}
          </Box>
        </VStack>
      </Box>
    </DashboardLayout>
  )
}
