'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewReelPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>('')
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  const [dragOver, setDragOver] = useState<'video' | 'thumbnail' | null>(null)
  
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleVideoChange = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file')
      return
    }
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      alert('File size must be less than 50MB')
      return
    }
    
    setVideoFile(file)
    const url = URL.createObjectURL(file)
    setVideoPreview(url)
  }

  const handleThumbnailChange = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('Image size must be less than 5MB')
      return
    }
    
    setThumbnailFile(file)
    const url = URL.createObjectURL(file)
    setThumbnailPreview(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (e.target.name === 'video') {
        handleVideoChange(file)
      } else if (e.target.name === 'thumbnail') {
        handleThumbnailChange(file)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent, type: 'video' | 'thumbnail') => {
    e.preventDefault()
    setDragOver(type)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(null)
  }

  const handleDrop = (e: React.DragEvent, type: 'video' | 'thumbnail') => {
    e.preventDefault()
    setDragOver(null)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (type === 'video') {
        handleVideoChange(file)
      } else if (type === 'thumbnail') {
        handleThumbnailChange(file)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Title is required')
      return
    }
    
    if (!videoFile) {
      alert('Please select a video file')
      return
    }

    setLoading(true)

    try {
      // Create FormData for file upload
      const uploadData = new FormData()
      uploadData.append('title', formData.title.trim())
      uploadData.append('description', formData.description.trim())
      uploadData.append('video', videoFile)
      
      // Add thumbnail if provided
      if (thumbnailFile) {
        uploadData.append('thumbnail', thumbnailFile)
      }

      const response = await fetch('/api/reels', {
        method: 'POST',
        body: uploadData
      })

      if (response.ok) {
        router.push('/admin/reels')
      } else {
        const error = await response.text()
        alert(`Failed to create reel: ${error}`)
      }
    } catch (error) {
      console.error('Error creating reel:', error)
      alert('Error creating reel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/reels"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Reels
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Reel</h1>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter reel title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              placeholder="Enter reel description (optional)"
            />
          </div>

          {/* Video Upload */}
          <div>
            <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-2">
              Video File *
            </label>
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                dragOver === 'video' ? 'border-purple-400 bg-purple-50' : 'border-gray-300'
              }`}
              onDragOver={(e) => handleDragOver(e, 'video')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'video')}
            >
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="video"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                  >
                    <span>Upload a video</span>
                    <input
                      ref={videoInputRef}
                      id="video"
                      name="video"
                      type="file"
                      className="sr-only"
                      accept="video/*"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">MP4, MOV, AVI up to 50MB</p>
                {videoFile && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">
                      Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)}MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image (Optional)
            </label>
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${
                dragOver === 'thumbnail' ? 'border-purple-400 bg-purple-50' : 'border-gray-300'
              }`}
              onDragOver={(e) => handleDragOver(e, 'thumbnail')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'thumbnail')}
            >
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h36v-4a2 2 0 00-2-2H8a2 2 0 00-2 2v4zM6 20l11.172-11.172a4 4 0 015.656 0L28 14m14 6v10a2 2 0 01-2 2H8a2 2 0 01-2-2V20m14-6a4 4 0 11-8 0 4 4 0 018 0z"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="thumbnail"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                  >
                    <span>Upload a thumbnail</span>
                    <input
                      ref={thumbnailInputRef}
                      id="thumbnail"
                      name="thumbnail"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                {thumbnailFile && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">
                      Selected: {thumbnailFile.name} ({(thumbnailFile.size / (1024 * 1024)).toFixed(2)}MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {(videoFile || thumbnailFile) && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Video Preview */}
                {videoFile && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Video</h4>
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-w-md rounded-md"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                )}
                
                {/* Thumbnail Preview */}
                {thumbnailFile && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Thumbnail</h4>
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full max-w-md rounded-md object-cover"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Link
              href="/admin/reels"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating...' : 'Create Reel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 