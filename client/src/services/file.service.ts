import api from './api'

export interface File {
  id: string
  fileName: string
  uuid: string
  expiredAt: string
  downloadCount: number
  userId: string
  user: {
    id: string
    name: string
  }
}

class FileService {
  async uploadFile(file: Blob, fileName: string) {
    const formData = new FormData()
    formData.append('file', file, fileName)
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async getFiles(role: string) {
    return api.get(`/files/${role.toLowerCase()}`)
  }

  async deleteFile(id: string) {
    await api.delete(`/files/${id}`)
  }

  getDownloadUrl(uuid: string) {
    return `${api.defaults.baseURL}/files/${uuid}`
  }
}

export default new FileService()