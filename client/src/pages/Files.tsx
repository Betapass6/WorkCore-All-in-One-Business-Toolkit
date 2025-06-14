import { Box, VStack, Heading, Button, HStack, Spinner, useToast, SimpleGrid, Card, CardBody, Text } from '@chakra-ui/react'
import { FileUploader } from '../components/FileUploader'
import fileService, { File } from '../services/file.service'
import dashboardService from '../services/dashboard.service'
import { DashboardStats } from '../types/dashboard'
import { useAuth } from '../contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useFetch } from '../hooks/useFetch'

export default function Files() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)
  const { user } = useAuth()

  const { data: filesData, loading: loadingFiles } = useFetch<{ files: File[], pagination: any }>("/api/files");
  const files = filesData?.files || [];

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const toast = useToast()

  useEffect(() => {
    console.log('Files data (after useFetch and data extraction):', files);
  }, [files]);

  useEffect(() => {
    if (user) {
      fetchStats()
    } else {
      setLoadingStats(false)
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const data = await dashboardService.getStats()
      setStats(data)
    } catch (error) {
      toast({
        title: 'Failed to fetch stats',
        description: 'There was an error loading the dashboard statistics',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoadingStats(false)
    }
  }

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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        status: 'error',
        duration: 3000,
      })
    }
  }

  if (loadingFiles || loadingStats) return <Spinner />

  return (
    <Box p={4}>
      <VStack spacing={8} align="stretch">
        {!loadingStats && stats && (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <Card>
              <CardBody>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Total Files
                </Text>
                <Text fontSize="2xl" fontWeight="bold">{stats.totalFiles}</Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  My Files
                </Text>
                <Text fontSize="2xl" fontWeight="bold">{files.length || 0}</Text>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Text fontSize="sm" color="gray.600" mb={1}>
                  Total Storage Used
                </Text>
                <Text fontSize="2xl" fontWeight="bold">{stats.totalFiles * 10}MB</Text>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

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
          {Array.isArray(files) && files.length > 0 ? (
            files.map((file) => (
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
            ))
          ) : (
            <Text>No files found</Text>
          )}
        </Box>
      </VStack>
    </Box>
  )
}
