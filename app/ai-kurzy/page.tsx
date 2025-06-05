'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { 
  PlayIcon, 
  ClockIcon, 
  StarIcon, 
  UserIcon,
  BookmarkIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarFilledIcon, BookmarkIcon as BookmarkFilledIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import Modal from '../../components/Modal'
import RegisterForm from '../../components/RegisterForm'

// Types for courses
interface Course {
  id: number
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  instructor: string
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  rating: number
  studentsCount: number
  price: number
  category: string
  tags: string[]
  isBookmarked: boolean
  lessons: number
}

// Course data for AI and automation
const coursesData: Course[] = [
  {
    id: 1,
    title: 'ChatGPT for Business: Complete Guide',
    description: 'Learn to leverage ChatGPT for business process automation, content creation and productivity enhancement.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop',
    videoUrl: '#',
    instructor: 'Tom Novak',
    duration: '4h 30min',
    level: 'Beginner',
    rating: 4.8,
    studentsCount: 2341,
    price: 79,
    category: 'ChatGPT & AI Assistants',
    tags: ['ChatGPT', 'Automation', 'Productivity'],
    isBookmarked: false,
    lessons: 24
  },
  {
    id: 2,
    title: 'Midjourney: AI Art Creation Mastery',
    description: 'Master the art of AI image generation. From basic prompts to advanced techniques and artistic styles.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    videoUrl: '#',
    instructor: 'Maria Freeman',
    duration: '3h 15min',
    level: 'Intermediate',
    rating: 4.9,
    studentsCount: 1876,
    price: 99,
    category: 'AI Art & Design',
    tags: ['Midjourney', 'AI Art', 'Design'],
    isBookmarked: true,
    lessons: 18
  },
  {
    id: 3,
    title: 'n8n Automation: No-Code Workflows',
    description: 'Build complex automated workflows without programming. Connect all your apps and automate everything.',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop',
    videoUrl: '#',
    instructor: 'Paul Davis',
    duration: '5h 45min',
    level: 'Intermediate',
    rating: 4.7,
    studentsCount: 967,
    price: 139,
    category: 'Automation & Workflow',
    tags: ['n8n', 'Automation', 'No-code'],
    isBookmarked: false,
    lessons: 32
  },
  {
    id: 4,
    title: 'AI for Content Marketing',
    description: 'Revolutionize your content marketing with AI tools. From content creation to SEO optimization.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
    videoUrl: '#',
    instructor: 'Jane Cooper',
    duration: '3h 50min',
    level: 'Beginner',
    rating: 4.6,
    studentsCount: 3210,
    price: 89,
    category: 'Marketing & AI',
    tags: ['Content Marketing', 'SEO', 'AI Writing'],
    isBookmarked: false,
    lessons: 21
  },
  {
    id: 5,
    title: 'Python & AI: Machine Learning for Beginners',
    description: 'Start with machine learning in Python. Practical projects and real-world applications.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop',
    videoUrl: '#',
    instructor: 'Dr. Martin Chen',
    duration: '8h 20min',
    level: 'Advanced',
    rating: 4.9,
    studentsCount: 1543,
    price: 199,
    category: 'Programming & AI',
    tags: ['Python', 'Machine Learning', 'TensorFlow'],
    isBookmarked: true,
    lessons: 45
  },
  {
    id: 6,
    title: 'AI Copywriting: Writing with Artificial Intelligence',
    description: 'Learn to write compelling sales copy with AI assistance. Jasper, Copy.ai and other cutting-edge tools.',
    thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&h=450&fit=crop',
    videoUrl: '#',
    instructor: 'Lucy Johnson',
    duration: '2h 40min',
    level: 'Beginner',
    rating: 4.5,
    studentsCount: 2890,
    price: 69,
    category: 'Copywriting & AI',
    tags: ['Copywriting', 'Jasper', 'AI Writing'],
    isBookmarked: false,
    lessons: 16
  },
  // Additional courses for Load More demonstration
  {
    id: 7,
    title: 'Advanced Prompt Engineering',
    description: 'Master the art of crafting effective prompts for AI models. Techniques used by professionals.',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop',
    videoUrl: '#',
    instructor: 'Alex Turner',
    duration: '3h 25min',
    level: 'Advanced',
    rating: 4.8,
    studentsCount: 1234,
    price: 129,
    category: 'ChatGPT & AI Assistants',
    tags: ['Prompt Engineering', 'AI Models', 'Advanced'],
    isBookmarked: false,
    lessons: 22
  },
  {
    id: 8,
    title: 'Stable Diffusion Complete Course',
    description: 'Create stunning AI art with Stable Diffusion. From installation to advanced techniques.',
    thumbnail: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=450&fit=crop',
    videoUrl: '#',
    instructor: 'Sarah Kim',
    duration: '4h 15min',
    level: 'Intermediate',
    rating: 4.7,
    studentsCount: 987,
    price: 109,
    category: 'AI Art & Design',
    tags: ['Stable Diffusion', 'AI Art', 'Image Generation'],
    isBookmarked: false,
    lessons: 28
  },
  {
    id: 9,
    title: 'AI Voice Cloning & Synthesis',
    description: 'Learn to create realistic AI voices using cutting-edge voice synthesis technology.',
    thumbnail: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=450&fit=crop',
    videoUrl: '#',
    instructor: 'Mike Rodriguez',
    duration: '2h 50min',
    level: 'Advanced',
    rating: 4.6,
    studentsCount: 756,
    price: 149,
    category: 'AI Art & Design',
    tags: ['Voice Cloning', 'AI Audio', 'Synthesis'],
    isBookmarked: false,
    lessons: 19
  }
]

const categories = [
  'All Courses',
  'ChatGPT & AI Assistants',
  'AI Art & Design',
  'Automation & Workflow',
  'Marketing & AI',
  'Programming & AI',
  'Copywriting & AI'
]

const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export default function AiKurzyPage() {
  const [courses, setCourses] = useState<Course[]>(coursesData)
  const [selectedCategory, setSelectedCategory] = useState('All Courses')
  const [selectedLevel, setSelectedLevel] = useState('All Levels')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('popularity') // popularity, rating, newest, price
  const [displayedCourses, setDisplayedCourses] = useState(6) // Show 6 courses initially
  const [loading, setLoading] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const { data: session } = useSession()

  // Filter courses
  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'All Courses' || course.category === selectedCategory
    const matchesLevel = selectedLevel === 'All Levels' || course.level === selectedLevel
    const matchesSearch = searchTerm === '' || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesLevel && matchesSearch
  })

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return b.id - a.id
      case 'price':
        return a.price - b.price
      case 'popularity':
      default:
        return b.studentsCount - a.studentsCount
    }
  })

  // Get courses to display
  const coursesToShow = sortedCourses.slice(0, displayedCourses)
  const hasMoreCourses = sortedCourses.length > displayedCourses

  const handleBookmark = (courseId: number) => {
    if (!session) {
      setShowSignUpModal(true)
      return
    }

    // User je přihlášen - toggle bookmark stav
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, isBookmarked: !course.isBookmarked }
        : course
    ))
  }

  const handleLoadMore = () => {
    setLoading(true)
    // Simulate loading delay
    setTimeout(() => {
      setDisplayedCourses(prev => prev + 6)
      setLoading(false)
    }, 800)
  }

  // Reset displayed courses when filters change
  useEffect(() => {
    setDisplayedCourses(6)
  }, [selectedCategory, selectedLevel, searchTerm, sortBy])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatStudentsCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k students`
    }
    return `${count} students`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Master the Future with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AI Courses</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Learn cutting-edge AI technologies and automation from industry experts. 
              Practical courses for real-world application in work and business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-400">50+</div>
                <div className="text-sm text-gray-300">Hours of Content</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-400">15k+</div>
                <div className="text-sm text-gray-300">Happy Students</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-pink-400">98%</div>
                <div className="text-sm text-gray-300">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and search */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, tools, or topics..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {sortedCourses.length === coursesData.length 
              ? `All Courses (${sortedCourses.length})`
              : `Found ${sortedCourses.length} courses`
            }
          </h2>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coursesToShow.map(course => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-purple-300 transition-all duration-300 group flex flex-col h-full cursor-pointer relative"
              onClick={() => window.location.href = `/ai-kurzy/${course.id}`}
            >
              {/* Hover overlay with instruction */}
              <div className="absolute inset-0 bg-purple-600 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300 pointer-events-none rounded-xl"></div>
                             <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                 <div className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                   <span>Click for details</span>
                   <ArrowRightIcon className="w-3 h-3" />
                 </div>
               </div>
              {/* Thumbnail with play button */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <button 
                    className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-opacity-100 hover:scale-110"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PlayIcon className="w-6 h-6 text-purple-600 ml-1" />
                  </button>
                </div>
                <div className="absolute top-4 right-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookmark(course.id)
                    }}
                    className="w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
                  >
                    {course.isBookmarked ? (
                      <BookmarkFilledIcon className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm font-medium">
                  {course.duration}
                </div>
              </div>

              {/* Card content - flex-1 makes it fill remaining space */}
              <div className="p-6 flex flex-col flex-1">
                {/* Level and category */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                    course.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {course.level}
                  </span>
                  <span className="text-xs text-gray-500">{course.lessons} lessons</span>
                </div>

                {/* Title */}
                <Link href={`/ai-kurzy/${course.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors cursor-pointer">
                    {course.title}
                  </h3>
                </Link>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                  {course.description}
                </p>

                {/* Instructor */}
                <div className="flex items-center gap-2 mb-3">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{course.instructor}</span>
                </div>

                {/* Rating and students */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <StarFilledIcon className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-900">{course.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">{formatStudentsCount(course.studentsCount)}</span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {course.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Price and action buttons - mt-auto pushes this to the bottom */}
                <div className="space-y-3 mt-auto">
                  {/* Price */}
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPrice(course.price)}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/ai-kurzy/${course.id}`} className="flex-1">
                      <button className="w-full px-4 py-2 h-10 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all duration-200 font-medium text-sm flex items-center justify-center">
                        Course Details
                      </button>
                    </Link>
                    <Link href={`/ai-kurzy/${course.id}`} className="flex-1">
                      <button className="w-full px-4 py-2 h-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium text-sm flex items-center justify-center">
                        Buy Course
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMoreCourses && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-8 py-4 bg-white border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </>
              ) : (
                <>
                  Load More Courses
                  <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-sm">
                    +{Math.min(6, sortedCourses.length - displayedCourses)}
                  </span>
                </>
              )}
            </button>
            <p className="text-gray-500 text-sm mt-3">
              Showing {coursesToShow.length} of {sortedCourses.length} courses
            </p>
          </div>
        )}

        {/* No courses found */}
        {sortedCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <MagnifyingGlassIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">Try changing your filters or search term</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('All Courses')
                setSelectedLevel('All Levels')
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Sign Up Modal */}
        <Modal
          isOpen={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
          title="Sign Up to Bookmark"
        >
          <RegisterForm
            onSuccess={() => {
              setShowSignUpModal(false)
              window.location.reload()
            }}
            onSwitchToLogin={() => setShowSignUpModal(false)}
          />
        </Modal>
      </div>
    </div>
  )
} 