'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  PlayIcon, 
  ClockIcon, 
  StarIcon, 
  UserIcon,
  BookmarkIcon,
  ShareIcon,
  ChevronRightIcon,
  CheckIcon,
  HeartIcon,
  AcademicCapIcon,
  ChartBarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  EyeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarFilledIcon, BookmarkIcon as BookmarkFilledIcon, HeartIcon as HeartFilledIcon } from '@heroicons/react/24/solid'
import Modal from '../../../components/Modal'
import RegisterForm from '../../../components/RegisterForm'

// Types
interface CourseLesson {
  id: number
  title: string
  duration: string
  isPreview: boolean
  isCompleted?: boolean
}

interface CourseSection {
  id: number
  title: string
  lessons: CourseLesson[]
  totalDuration: string
}

interface CourseReview {
  id: number
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: string
  verified: boolean
  helpful: number
}

interface Instructor {
  name: string
  title: string
  avatar: string
  bio: string
  experience: string
  studentsCount: number
  coursesCount: number
  rating: number
  specialties: string[]
}

interface Course {
  id: number
  title: string
  subtitle: string
  description: string
  thumbnail: string
  videoUrl: string
  instructor: Instructor
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  rating: number
  studentsCount: number
  reviewsCount: number
  price: number
  originalPrice?: number
  category: string
  tags: string[]
  isBookmarked: boolean
  isLiked: boolean
  lessons: number
  sections: CourseSection[]
  reviews: CourseReview[]
  whatYouWillLearn: string[]
  requirements: string[]
  includes: string[]
  lastUpdated: string
  language: string
  certificateAvailable: boolean
  lifetimeAccess: boolean
  mobileAccess: boolean
  downloadableResources: number
}

// Mock course data
const courseData: Course = {
  id: 1,
  title: 'ChatGPT for Business: Complete Guide',
  subtitle: 'Master AI-powered productivity and automation for modern business success',
  description: `Transform your business operations with the power of ChatGPT. This comprehensive course takes you from beginner to expert, covering everything from basic prompts to advanced automation strategies.

You'll learn practical applications for content creation, customer service, data analysis, and process optimization. By the end of this course, you'll be able to integrate ChatGPT seamlessly into your business workflow and achieve remarkable productivity gains.

Perfect for entrepreneurs, business professionals, marketers, and anyone looking to leverage AI for competitive advantage.`,
  thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
  videoUrl: '#preview-video',
  instructor: {
    name: 'Tom Novak',
    title: 'AI Business Consultant & Entrepreneur',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Tom is a leading AI consultant who has helped over 500 businesses implement AI solutions. With 10+ years in business automation and a passion for emerging technologies, he makes complex AI concepts accessible to everyone.',
    experience: '10+ years',
    studentsCount: 25000,
    coursesCount: 12,
    rating: 4.9,
    specialties: ['AI Strategy', 'Business Automation', 'ChatGPT', 'Process Optimization']
  },
  duration: '4h 30min',
  level: 'Beginner',
  rating: 4.8,
  studentsCount: 2341,
  reviewsCount: 389,
  price: 79,
  originalPrice: 149,
  category: 'ChatGPT & AI Assistants',
  tags: ['ChatGPT', 'AI', 'Business', 'Productivity', 'Automation'],
  isBookmarked: false,
  isLiked: false,
  lessons: 24,
  lastUpdated: 'January 2024',
  language: 'English',
  certificateAvailable: true,
  lifetimeAccess: true,
  mobileAccess: true,
  downloadableResources: 15,
  whatYouWillLearn: [
    'Master ChatGPT prompting techniques for business applications',
    'Automate content creation and marketing campaigns',
    'Streamline customer service with AI-powered responses',
    'Analyze data and generate business insights using ChatGPT',
    'Create efficient workflows and process automation',
    'Develop custom GPTs for specific business needs',
    'Integrate ChatGPT with existing business tools',
    'Measure ROI and track AI implementation success'
  ],
  requirements: [
    'Basic computer skills and internet access',
    'No prior AI or programming experience required',
    'Willingness to experiment and practice with new tools',
    'A business or professional context to apply learnings'
  ],
  includes: [
    'Lifetime access to course content',
    'Certificate of completion',
    'Access on mobile and desktop',
    '15 downloadable resources and templates',
    'Private community access',
    'Direct instructor support'
  ],
  sections: [
    {
      id: 1,
      title: 'Getting Started with ChatGPT',
      totalDuration: '45min',
      lessons: [
        { id: 1, title: 'Welcome and Course Overview', duration: '5min', isPreview: true },
        { id: 2, title: 'Setting Up Your ChatGPT Account', duration: '8min', isPreview: true },
        { id: 3, title: 'Understanding AI and Language Models', duration: '12min', isPreview: false },
        { id: 4, title: 'Your First ChatGPT Conversation', duration: '10min', isPreview: false },
        { id: 5, title: 'Best Practices and Safety Guidelines', duration: '10min', isPreview: false }
      ]
    },
    {
      id: 2,
      title: 'Mastering Prompt Engineering',
      totalDuration: '1h 15min',
      lessons: [
        { id: 6, title: 'The Art of Effective Prompting', duration: '15min', isPreview: false },
        { id: 7, title: 'Advanced Prompt Techniques', duration: '20min', isPreview: false },
        { id: 8, title: 'Context and Conversation Management', duration: '18min', isPreview: false },
        { id: 9, title: 'Common Prompting Mistakes to Avoid', duration: '12min', isPreview: false },
        { id: 10, title: 'Prompt Templates for Business', duration: '10min', isPreview: false }
      ]
    },
    {
      id: 3,
      title: 'Business Applications and Use Cases',
      totalDuration: '1h 45min',
      lessons: [
        { id: 11, title: 'Content Creation and Marketing', duration: '25min', isPreview: false },
        { id: 12, title: 'Customer Service Automation', duration: '20min', isPreview: false },
        { id: 13, title: 'Data Analysis and Reporting', duration: '22min', isPreview: false },
        { id: 14, title: 'Email and Communication', duration: '18min', isPreview: false },
        { id: 15, title: 'Project Management and Planning', duration: '20min', isPreview: false }
      ]
    },
    {
      id: 4,
      title: 'Advanced Integration and Automation',
      totalDuration: '45min',
      lessons: [
        { id: 16, title: 'API Integration Basics', duration: '15min', isPreview: false },
        { id: 17, title: 'Workflow Automation Tools', duration: '15min', isPreview: false },
        { id: 18, title: 'Custom GPT Development', duration: '15min', isPreview: false }
      ]
    }
  ],
  reviews: [
    {
      id: 1,
      userName: 'Sarah Johnson',
      userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=50&h=50&fit=crop&crop=face',
      rating: 5,
      comment: 'Absolutely fantastic course! Tom explains everything so clearly and the practical examples are incredibly valuable. I\'ve already implemented ChatGPT in my marketing workflow and saved hours every week.',
      date: '2 weeks ago',
      verified: true,
      helpful: 24
    },
    {
      id: 2,
      userName: 'Michael Chen',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
      rating: 5,
      comment: 'Best investment I\'ve made for my business this year. The ROI from what I learned here has been incredible. The customer service automation alone has transformed how we handle support.',
      date: '1 week ago',
      verified: true,
      helpful: 18
    },
    {
      id: 3,
      userName: 'Emma Rodriguez',
      userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
      rating: 4,
      comment: 'Great course with lots of practical value. Would love to see more advanced automation examples, but overall very satisfied with the content and teaching quality.',
      date: '3 weeks ago',
      verified: true,
      helpful: 12
    }
  ]
}

// Related courses
const relatedCourses = [
  {
    id: 2,
    title: 'Advanced Prompt Engineering',
    instructor: 'Alex Turner',
    rating: 4.8,
    price: 129,
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&h=200&fit=crop'
  },
  {
    id: 3,
    title: 'AI for Content Marketing',
    instructor: 'Jane Cooper',
    rating: 4.6,
    price: 89,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop'
  }
]

export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [isBookmarked, setIsBookmarked] = useState(courseData.isBookmarked)
  const [isLiked, setIsLiked] = useState(courseData.isLiked)
  const [expandedSections, setExpandedSections] = useState<number[]>([1])
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const { data: session } = useSession()

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatStudentsCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`
    }
    return count.toString()
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const emptyStars = 5 - Math.ceil(rating)
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarFilledIcon key={`full-${i}`} className={`${sizeClass} text-yellow-400`} />)
    }
    if (hasHalfStar) {
      stars.push(<StarFilledIcon key="half" className={`${sizeClass} text-yellow-400 opacity-50`} />)
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className={`${sizeClass} text-gray-300`} />)
    }
    return stars
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-purple-600">Home</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <Link href="/ai-kurzy" className="hover:text-purple-600">AI Courses</Link>
            <ChevronRightIcon className="w-4 h-4" />
            <span className="text-gray-900">{courseData.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Category & Level */}
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-purple-600 rounded-full text-sm font-medium">
                  {courseData.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  courseData.level === 'Beginner' ? 'bg-green-600' :
                  courseData.level === 'Intermediate' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                  {courseData.level}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h1 className="text-4xl font-bold mb-3">{courseData.title}</h1>
                <p className="text-xl text-purple-100">{courseData.subtitle}</p>
              </div>

              {/* Rating & Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex">{renderStars(courseData.rating, 'sm')}</div>
                  <span className="font-medium">{courseData.rating}</span>
                  <span className="text-purple-200">({courseData.reviewsCount} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <UserIcon className="w-4 h-4" />
                  <span>{formatStudentsCount(courseData.studentsCount)} students</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{courseData.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <AcademicCapIcon className="w-4 h-4" />
                  <span>{courseData.lessons} lessons</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center space-x-3">
                <img 
                  src={courseData.instructor.avatar} 
                  alt={courseData.instructor.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium">Created by {courseData.instructor.name}</p>
                  <p className="text-purple-200 text-sm">{courseData.instructor.title}</p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-center space-x-4 text-sm text-purple-200">
                <div className="flex items-center space-x-1">
                  <CalendarDaysIcon className="w-4 h-4" />
                  <span>Last updated {courseData.lastUpdated}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GlobeAltIcon className="w-4 h-4" />
                  <span>{courseData.language}</span>
                </div>
              </div>
            </div>

            {/* Video Preview */}
            <div className="lg:col-span-1">
              <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
                <img 
                  src={courseData.thumbnail} 
                  alt={courseData.title}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <button className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
                    <PlayIcon className="w-6 h-6 text-purple-600 ml-1" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                  Preview
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2">
            {/* Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b">
                <nav className="flex space-x-8 px-6" aria-label="Course Navigation">
                  {[
                    { id: 'overview', label: 'Overview', icon: EyeIcon },
                    { id: 'curriculum', label: 'Curriculum', icon: AcademicCapIcon },
                    { id: 'reviews', label: 'Reviews', icon: StarIcon },
                    { id: 'instructor', label: 'Instructor', icon: UserIcon }
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* About This Course */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">About This Course</h3>
                      <div className="prose prose-gray max-w-none">
                        {courseData.description.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="text-gray-600 leading-relaxed mb-4">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* What You'll Learn */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">What You'll Learn</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {courseData.whatYouWillLearn.map((item, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
                      <ul className="space-y-2">
                        {courseData.requirements.map((req, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-600">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tags */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Topics Covered</h3>
                      <div className="flex flex-wrap gap-2">
                        {courseData.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Curriculum Tab */}
                {activeTab === 'curriculum' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">Course Curriculum</h3>
                      <div className="text-sm text-gray-600">
                        {courseData.sections.length} sections • {courseData.lessons} lessons • {courseData.duration} total length
                      </div>
                    </div>

                    <div className="space-y-4">
                      {courseData.sections.map((section) => (
                        <div key={section.id} className="border rounded-lg">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 flex items-center justify-between"
                          >
                            <div>
                              <h4 className="font-medium text-gray-900">{section.title}</h4>
                              <p className="text-sm text-gray-600">
                                {section.lessons.length} lessons • {section.totalDuration}
                              </p>
                            </div>
                            <ChevronRightIcon className={`w-5 h-5 text-gray-400 transform transition-transform ${
                              expandedSections.includes(section.id) ? 'rotate-90' : ''
                            }`} />
                          </button>
                          
                          {expandedSections.includes(section.id) && (
                            <div className="border-t">
                              {section.lessons.map((lesson) => (
                                <div key={lesson.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                                  <div className="flex items-center space-x-3">
                                    {lesson.isPreview ? (
                                      <PlayIcon className="w-4 h-4 text-purple-600" />
                                    ) : (
                                      <LockClosedIcon className="w-4 h-4 text-gray-400" />
                                    )}
                                    <span className="text-gray-900">{lesson.title}</span>
                                    {lesson.isPreview && (
                                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-600">{lesson.duration}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">Student Reviews</h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex">{renderStars(courseData.rating, 'sm')}</div>
                        <span className="font-medium">{courseData.rating}</span>
                        <span className="text-gray-600">({courseData.reviewsCount} reviews)</span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {courseData.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0">
                          <div className="flex items-start space-x-4">
                            <img 
                              src={review.userAvatar} 
                              alt={review.userName}
                              className="w-12 h-12 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-medium text-gray-900">{review.userName}</h4>
                                {review.verified && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="flex">{renderStars(review.rating, 'sm')}</div>
                                <span className="text-sm text-gray-600">{review.date}</span>
                              </div>
                              <p className="text-gray-700 mb-3">{review.comment}</p>
                              <div className="flex items-center space-x-4 text-sm">
                                <button className="flex items-center space-x-1 text-gray-600 hover:text-purple-600">
                                  <HeartIcon className="w-4 h-4" />
                                  <span>Helpful ({review.helpful})</span>
                                </button>
                                <button className="text-gray-600 hover:text-purple-600">Reply</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructor Tab */}
                {activeTab === 'instructor' && (
                  <div className="space-y-6">
                    <div className="flex items-start space-x-6">
                      <img 
                        src={courseData.instructor.avatar} 
                        alt={courseData.instructor.name}
                        className="w-24 h-24 rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">{courseData.instructor.name}</h3>
                        <p className="text-lg text-purple-600 mb-4">{courseData.instructor.title}</p>
                        
                        {/* Instructor Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{courseData.instructor.rating}</div>
                            <div className="text-sm text-gray-600">Instructor Rating</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{formatStudentsCount(courseData.instructor.studentsCount)}</div>
                            <div className="text-sm text-gray-600">Students</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{courseData.instructor.coursesCount}</div>
                            <div className="text-sm text-gray-600">Courses</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{courseData.instructor.experience}</div>
                            <div className="text-sm text-gray-600">Experience</div>
                          </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-6">{courseData.instructor.bio}</p>

                        {/* Specialties */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Specialties</h4>
                          <div className="flex flex-wrap gap-2">
                            {courseData.instructor.specialties.map((specialty, index) => (
                              <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Purchase Card */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900">{formatPrice(courseData.price)}</span>
                    {courseData.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">{formatPrice(courseData.originalPrice)}</span>
                    )}
                  </div>
                  {courseData.originalPrice && (
                    <div className="text-sm text-green-600 font-medium">
                      Save {formatPrice(courseData.originalPrice - courseData.price)} ({Math.round(((courseData.originalPrice - courseData.price) / courseData.originalPrice) * 100)}% off)
                    </div>
                  )}
                </div>

                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium text-lg hover:from-purple-700 hover:to-pink-700 transition-all mb-4">
                  Enroll Now
                </button>

                <div className="text-center text-sm text-gray-600 mb-6">
                  30-day money-back guarantee
                </div>

                {/* Course Includes */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">This course includes:</h4>
                  <div className="space-y-2 text-sm">
                    {courseData.includes.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckIcon className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <button
                    onClick={() => {
                      if (!session) {
                        setShowSignUpModal(true)
                        return
                      }
                      setIsBookmarked(!isBookmarked)
                    }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-purple-600"
                  >
                    {isBookmarked ? (
                      <BookmarkFilledIcon className="w-5 h-5" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5" />
                    )}
                    <span>Save</span>
                  </button>
                  
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-500"
                  >
                    {isLiked ? (
                      <HeartFilledIcon className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span>Like</span>
                  </button>

                  <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-600">
                    <ShareIcon className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h4 className="font-medium text-gray-900 mb-4">Course Features</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{courseData.duration} on-demand video</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ArrowDownTrayIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{courseData.downloadableResources} downloadable resources</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">Access on mobile and TV</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AcademicCapIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">Certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Courses */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Students Also Bought</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {course.instructor}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <div className="flex">{renderStars(course.rating, 'sm')}</div>
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">{formatPrice(course.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sign Up Modal */}
      <Modal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        title="Sign Up"
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
  )
} 