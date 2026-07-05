'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Upload, X, File as FileIcon, FileText, Image as ImageIcon, Archive, Check, AlertTriangle,
  Trash2, Eye, Download, RotateCcw, Plus, Paperclip, Cloud,
  FileSpreadsheet, FileImage, FileVideo, Music, Folder
} from 'lucide-react'

// ============= Types =============
export interface FileItem {
  id: string
  file: File
  name: string
  size: number
  type: string
  status: 'uploading' | 'completed' | 'error' | 'pending'
  progress: number
  preview?: string
  error?: string
  url?: string
}

export interface DragDropUploadProps {
  accept?: string[]
  maxFiles?: number
  maxSize?: number // in bytes
  multiple?: boolean
  onFilesChange?: (files: FileItem[]) => void
  onUpload?: (files: FileItem[]) => Promise<void>
  className?: string
  disabled?: boolean
  children?: React.ReactNode
  showPreview?: boolean
  allowReorder?: boolean
  autoUpload?: boolean
  compressionOptions?: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
  }
}

// ============= File Type Icons =============
const getFileIcon = (type: string, size: string = 'h-8 w-8') => {
  if (type.startsWith('image/')) return <FileImage className={`${size} text-green-500`} />
  if (type.startsWith('video/')) return <FileVideo className={`${size} text-purple-500`} />
  if (type.startsWith('audio/')) return <Music className={`${size} text-orange-500`} />
  if (type.includes('pdf')) return <FileText className={`${size} text-red-500`} />
  if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className={`${size} text-green-600`} />
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return <Archive className={`${size} text-yellow-500`} />
  return <FileIcon className={`${size} text-gray-500`} />
}

// ============= File Size Formatter =============
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ============= Main Drag Drop Upload Component =============
export const DragDropUpload: React.FC<DragDropUploadProps> = ({
  accept = [],
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  onFilesChange,
  onUpload,
  className = '',
  disabled = false,
  children,
  showPreview = true,
  allowReorder = true,
  autoUpload = false,
  compressionOptions
}) => {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Generate unique file ID
  const generateFileId = () => Math.random().toString(36).substr(2, 9)

  // Validate file
  const validateFile = (file: File): string | null => {
    if (accept.length > 0) {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const mimeType = file.type.toLowerCase()

      const isAccepted = accept.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return fileExtension === acceptedType.toLowerCase()
        }
        if (acceptedType.includes('*')) {
          const baseType = acceptedType.split('/')[0]
          return mimeType.startsWith(baseType)
        }
        return mimeType === acceptedType.toLowerCase()
      })

      if (!isAccepted) {
        return `File type not supported. Accepted types: ${accept.join(', ')}`
      }
    }

    if (file.size > maxSize) {
      return `File size exceeds limit of ${formatFileSize(maxSize)}`
    }

    return null
  }

  // Create file preview
  const createPreview = async (file: File): Promise<string | undefined> => {
    if (!showPreview || !file.type.startsWith('image/')) return undefined

    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = () => resolve(undefined)
      reader.readAsDataURL(file)
    })
  }

  // Compress image if needed
  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/') || !compressionOptions) return file

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = compressionOptions

        let { width, height } = img

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file)
            }
          },
          file.type,
          quality
        )
      }

      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  // Process files
  const processFiles = useCallback(async (fileList: FileList | File[]) => {
    const newFiles: FileItem[] = []
    const filesArray = Array.from(fileList)

    // Check total file count
    if (files.length + filesArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    for (const file of filesArray) {
      const error = validateFile(file)

      if (error) {
        newFiles.push({
          id: generateFileId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'error',
          progress: 0,
          error
        })
        continue
      }

      const compressedFile = await compressImage(file)
      const preview = await createPreview(compressedFile)

      newFiles.push({
        id: generateFileId(),
        file: compressedFile,
        name: compressedFile.name,
        size: compressedFile.size,
        type: compressedFile.type,
        status: autoUpload ? 'uploading' : 'pending',
        progress: 0,
        preview
      })
    }

    const updatedFiles = [...files, ...newFiles]
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)

    if (autoUpload && onUpload) {
      const filesToUpload = newFiles.filter(f => f.status !== 'error')
      if (filesToUpload.length > 0) {
        await handleUpload(filesToUpload)
      }
    }
  }, [files, maxFiles, maxSize, accept, showPreview, compressionOptions, autoUpload, onUpload, onFilesChange])

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragOver(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Only set to false if leaving the main drop zone
    if (e.currentTarget === e.target) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles)
    }
  }, [disabled, processFiles])

  // Handle file input
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      processFiles(selectedFiles)
    }
    // Reset input value to allow same file selection
    e.target.value = ''
  }, [processFiles])

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }, [files, onFilesChange])

  // Retry file upload
  const retryFile = useCallback(async (fileId: string) => {
    const updatedFiles = files.map(f =>
      f.id === fileId
        ? { ...f, status: 'uploading' as const, progress: 0, error: undefined }
        : f
    )
    setFiles(updatedFiles)

    if (onUpload) {
      const fileToRetry = updatedFiles.find(f => f.id === fileId)
      if (fileToRetry) {
        await handleUpload([fileToRetry])
      }
    }
  }, [files, onUpload])

  // Handle upload
  const handleUpload = async (filesToUpload?: FileItem[]) => {
    const targetFiles = filesToUpload || files.filter(f => f.status === 'pending')
    if (targetFiles.length === 0 || !onUpload) return

    setIsUploading(true)

    try {
      // Simulate upload progress
      for (const file of targetFiles) {
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'uploading' } : f
        ))

        // Simulate progress updates
        for (let progress = 0; progress <= 100; progress += 20) {
          setFiles(prev => prev.map(f =>
            f.id === file.id ? { ...f, progress } : f
          ))
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      await onUpload(targetFiles)

      // Mark as completed
      setFiles(prev => prev.map(f =>
        targetFiles.some(tf => tf.id === f.id)
          ? { ...f, status: 'completed', progress: 100 }
          : f
      ))
    } catch (error) {
      // Mark as error
      setFiles(prev => prev.map(f =>
        targetFiles.some(tf => tf.id === f.id)
          ? { ...f, status: 'error', error: 'Upload failed' }
          : f
      ))
    } finally {
      setIsUploading(false)
    }
  }

  // Handle file reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!allowReorder) return
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleFileDropOver = (e: React.DragEvent, index: number) => {
    if (!allowReorder) return
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleFileDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!allowReorder) return
    e.preventDefault()
    setDragOverIndex(null)

    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (dragIndex === dropIndex) return

    const newFiles = [...files]
    const draggedFile = newFiles[dragIndex]
    newFiles.splice(dragIndex, 1)
    newFiles.splice(dropIndex, 0, draggedFile)

    setFiles(newFiles)
    onFilesChange?.(newFiles)
  }

  // Clear all files
  const clearAll = () => {
    setFiles([])
    onFilesChange?.([])
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
        aria-label="File upload area"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        {children || (
          <div className="space-y-2">
            <div className="flex justify-center">
              <Cloud className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop files here or click to upload
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {accept.length > 0 && `Supports: ${accept.join(', ')} • `}
                Max size: {formatFileSize(maxSize)} • Max files: {maxFiles}
              </p>
            </div>
            {isDragOver && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg flex items-center justify-center">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium">
                  Drop files here
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Uploaded Files ({files.length})
            </h3>
            <div className="flex items-center gap-2">
              {!autoUpload && files.some(f => f.status === 'pending') && (
                <button
                  onClick={() => handleUpload()}
                  disabled={isUploading}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload All
                </button>
              )}
              <button
                onClick={clearAll}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            {files.map((file, index) => (
              <div
                key={file.id}
                draggable={allowReorder}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleFileDropOver(e, index)}
                onDrop={(e) => handleFileDrop(e, index)}
                className={`
                  bg-white border border-gray-200 rounded-lg p-3 transition-all
                  ${allowReorder ? 'cursor-move hover:shadow-md' : ''}
                  ${dragOverIndex === index ? 'border-blue-500 shadow-md' : ''}
                  ${file.status === 'error' ? 'border-red-200 bg-red-50' : ''}
                  ${file.status === 'completed' ? 'border-green-200 bg-green-50' : ''}
                `}
              >
                <div className="flex items-center space-x-4">
                  {/* File Icon/Preview */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-12 w-12 object-cover rounded-lg"
                      />
                    ) : (
                      getFileIcon(file.type, 'h-12 w-12')
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        {/* Status Icon */}
                        {file.status === 'completed' && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                        {file.status === 'error' && (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        {file.status === 'uploading' && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
                        )}

                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          {file.preview && (
                            <button
                              onClick={() => {
                                // Build nodes via DOM APIs (not innerHTML) so a
                                // malicious file name/preview can never inject markup.
                                const modal = document.createElement('div')
                                modal.className = 'fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-3'

                                const box = document.createElement('div')
                                box.className = 'bg-white rounded-lg p-3 max-h-full overflow-auto'

                                const img = document.createElement('img')
                                img.src = file.preview as string
                                img.alt = file.name
                                img.className = 'max-w-full h-auto'

                                const closeBtn = document.createElement('button')
                                closeBtn.textContent = 'Close'
                                closeBtn.className = 'mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600'
                                closeBtn.addEventListener('click', () => {
                                  document.body.removeChild(modal)
                                })

                                box.appendChild(img)
                                box.appendChild(closeBtn)
                                modal.appendChild(box)
                                document.body.appendChild(modal)
                              }}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}

                          {file.status === 'error' && (
                            <button
                              onClick={() => retryFile(file.id)}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Retry upload"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Remove file"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                      {file.error && (
                        <p className="text-sm text-red-600">{file.error}</p>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <div className="mt-2">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {file.progress}% uploaded
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============= Simple Upload Button Component =============
interface UploadButtonProps {
  onFileSelect: (files: File[]) => void
  accept?: string[]
  multiple?: boolean
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}

export const UploadButton: React.FC<UploadButtonProps> = ({
  onFileSelect,
  accept = [],
  multiple = true,
  disabled = false,
  children,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFileSelect(files)
    }
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept.join(',')}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {children || (
          <>
            <Paperclip className="h-4 w-4 mr-2" />
            Choose Files
          </>
        )}
      </button>
    </>
  )
}