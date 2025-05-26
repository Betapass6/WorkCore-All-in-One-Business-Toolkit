import api from './api'

export interface File {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadDate: string
  downloads: number
  expiresAt: string
}

export const fileService = {
  async upload(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post<File>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  async getAll() {
    const { data } = await api.get<File[]>('/files')
    return data
  },

  async delete(id: string) {
    await api.delete(`/files/${id}`)
  },

  async download(id: string) {
    const { data } = await api.get(`/files/${id}/download`, {
      responseType: 'blob',
    })
    return data
  }
} 