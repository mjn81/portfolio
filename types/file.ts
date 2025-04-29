export type FileType = 'image' | 'video' | 'audio' | 'document';

export type MediaFile = {
  id: string
  name: string
  type: FileType
  url: string
  size: number
  dimensions: string
  uploaded_at: string
  used: number
  is_private: boolean
}