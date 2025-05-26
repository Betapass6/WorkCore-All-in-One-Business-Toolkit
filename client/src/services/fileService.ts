import api from './api'
import { File, FileUploadRequest } from '../types'

export const fileService = {
  async upload(request: FileUploadRequest & { file: globalThis.File }) {
    const formData = new FormData()
    formData.append('file', request.file)
    const { data } = await api.post<File>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  async getAll() {
    const { data } = await api.get<File[]>('/files/admin')
    return data
  },

  async delete(id: string) {
    await api.delete(`/files/${id}`)
  },

  getDownloadUrl(uuid: string) {
    return `${api.defaults.baseURL}/files/${uuid}`
  }
}
