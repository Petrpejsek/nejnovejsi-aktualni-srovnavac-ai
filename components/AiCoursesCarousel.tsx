'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PlayIcon, 
  StarIcon,
  ClockIcon,
  UserIcon,
  BookmarkIcon,
  ShieldCheckIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarFilledIcon, BookmarkIcon as BookmarkFilledIcon } from '@heroicons/react/24/solid'

interface Review {
  id: number
  userName: string
  rating: number
  comment: string
  date: string
  verified: boolean
}

interface Course {
  id: number
  title: string
  description: string
  thumbnail: string
  instructor: string
  duration: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  rating: number
  studentsCount: number
  price: number
  category: string
  isBookmarked: boolean
  lessons: number
  reviewsCount: number
  reviews: Review[]
}

// Sample course data with detailed reviews
const featuredCourses: Course[] = [
  {
    id: 1,
    title: 'ChatGPT for Business: Complete Guide',
    description: 'Learn to leverage ChatGPT for business process automation, content creation and productivity enhancement.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
    instructor: 'Tom Novak',
    duration: '4h 30min',
    level: 'Beginner',
    rating: 4.8,
    studentsCount: 2341,
    price: 79,
    category: 'ChatGPT & AI Assistants',
    isBookmarked: false,
    lessons: 24,
    reviewsCount: 389,
    reviews: [
      {
        id: 1,
        userName: 'John Smith',
        rating: 5,
        comment: 'Amazing course! I use ChatGPT daily at work now and save hours of time. Practical examples and clear explanations.',
        date: 'January 15, 2024',
        verified: true
      },
      {
        id: 2,
        userName: 'Sarah Johnson',
        rating: 5,
        comment: 'Finally a course that showed me the real potential of AI. I recommend it to everyone who wants to be more efficient.',
        date: 'January 8, 2024',
        verified: true
      }
    ]
  },
  {
    id: 2,
    title: 'Midjourney: AI Art Creation Mastery',
    description: 'Master the art of AI image generation. From basic prompts to advanced techniques and artistic styles.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
    instructor: 'Maria Freeman',
    duration: '3h 15min',
    level: 'Intermediate',
    rating: 4.9,
    studentsCount: 1876,
    price: 99,
    category: 'AI Art & Design',
    isBookmarked: true,
    lessons: 18,
    reviewsCount: 267,
    reviews: [
      {
        id: 3,
        userName: 'Peter Brown',
        rating: 5,
        comment: 'Incredible! From complete beginner I became an AI artist. The course is well structured and full of inspiration.',
        date: 'January 20, 2024',
        verified: true
      },
      {
        id: 4,
        userName: 'Anna Wilson',
        rating: 5,
        comment: 'Midjourney opened up a completely new world of creativity for me. Thanks to this course I create images I never dreamed of.',
        date: 'January 12, 2024',
        verified: true
      }
    ]
  },
  {
    id: 3,
    title: 'n8n Automation: No-Code Workflows',
    description: 'Build complex automated workflows without programming. Connect all your apps and automate everything.',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop',
    instructor: 'Paul Davis',
    duration: '5h 45min',
    level: 'Intermediate',
    rating: 4.7,
    studentsCount: 967,
    price: 139,
    category: 'Automation & Workflow',
    isBookmarked: false,
    lessons: 32,
    reviewsCount: 156,
    reviews: [
      {
        id: 5,
        userName: 'Thomas Miller',
        rating: 5,
        comment: 'Automation game changer! I automated my entire workflow and finally have time for important things.',
        date: 'January 18, 2024',
        verified: true
      },
      {
        id: 6,
        userName: 'Claire Davis',
        rating: 4,
        comment: 'Great course for beginners. I gradually learned to create complex automations without a single line of code.',
        date: 'January 10, 2024',
        verified: true
      }
    ]
  },
  {
    id: 4,
    title: 'AI for Content Marketing',
    description: 'Revolutionize your content marketing with AI tools. From content creation to SEO optimization.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    instructor: 'Jane Cooper',
    duration: '3h 50min',
    level: 'Beginner',
    rating: 4.6,
    studentsCount: 3210,
    price: 89,
    category: 'Marketing & AI',
    isBookmarked: false,
    lessons: 21,
    reviewsCount: 445,
    reviews: [
      {
        id: 7,
        userName: 'David Lee',
        rating: 5,
        comment: 'My content marketing sped up 5x thanks to AI! The course contains practical tools I use every day.',
        date: 'January 22, 2024',
        verified: true
      },
      {
        id: 8,
        userName: 'Lisa White',
        rating: 4,
        comment: 'Very useful course. I learned to create quality content faster than ever before.',
        date: 'January 16, 2024',
        verified: true
      }
    ]
  },
  {
    id: 5,
    title: 'Python & AI: Machine Learning for Beginners',
    description: 'Start with machine learning in Python. Practical projects and real-world applications.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
    instructor: 'Dr. Martin Chen',
    duration: '8h 20min',
    level: 'Advanced',
    rating: 4.9,
    studentsCount: 1543,
    price: 199,
    category: 'Programming & AI',
    isBookmarked: true,
    lessons: 45,
    reviewsCount: 298,
    reviews: [
      {
        id: 9,
        userName: 'Jake Taylor',
        rating: 5,
        comment: 'Best programming course I have ever taken! From zero to my own AI projects. Amazing!',
        date: 'January 25, 2024',
        verified: true
      },
      {
        id: 10,
        userName: 'Emma Garcia',
        rating: 5,
        comment: 'Great explanation of complex concepts. Even I, as a beginner, understood machine learning.',
        date: 'January 19, 2024',
        verified: true
      }
    ]
  }
]

export default function AiCoursesCarousel() {
  const [courses, setCourses] = useState<Course[]>(featuredCourses)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollButtons()
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 350
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
      
      setTimeout(checkScrollButtons, 300)
    }
  }

  const handleBookmark = (courseId: number) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, isBookmarked: !course.isBookmarked }
        : course
    ))
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

  // Komponenta pro vykreslení hvězdiček s lepším designem
  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const emptyStars = 5 - Math.ceil(rating)

    const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

    // Plné hvězdičky
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarFilledIcon key={`full-${i}`} className={`${sizeClass} text-yellow-400`} />
      )
    }

    // Půl hvězdička
    if (hasHalfStar) {
      stars.push(
        <div key="half" className={`${sizeClass} relative`}>
          <StarIcon className={`${sizeClass} text-gray-300 absolute`} />
          <div className="overflow-hidden w-1/2">
            <StarFilledIcon className={`${sizeClass} text-yellow-400`} />
          </div>
        </div>
      )
    }

    // Prázdné hvězdičky
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className={`${sizeClass} text-gray-300`} />
      )
    }

    return stars
  }

  // Čistý, decentní rating badge
  const renderCleanRating = (rating: number, reviewsCount: number) => {
    const isExcellent = rating >= 4.8

    return (
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {renderStars(rating, 'sm')}
          </div>
          <span className="text-sm font-medium text-gray-900">{rating}</span>
          <span className="text-xs text-gray-500">({reviewsCount})</span>
        </div>
        {isExcellent && (
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
            <CheckBadgeIcon className="w-3 h-3 text-yellow-600" />
            <span className="text-xs font-medium text-yellow-700">Top Course</span>
          </div>
        )}
      </div>
    )
  }

  // Kompaktní recenze preview
  const renderCompactReview = (review: Review) => {
    return (
      <div className="mb-3 p-2 bg-gray-50 rounded-lg border-l-2 border-yellow-400">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex">{renderStars(review.rating, 'sm')}</div>
          <span className="text-xs font-medium text-gray-900">{review.userName}</span>
          {review.verified && (
            <CheckBadgeIcon className="w-3 h-3 text-green-500" />
          )}
        </div>
        <p className="text-xs text-gray-600 line-clamp-1 italic">
          "{review.comment}"
        </p>
      </div>
    )
  }

  return (
    <div className="mt-16 mb-8">
      {/* Header section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Best <span className="text-gradient-primary">AI Courses</span>
          </h2>
          <p className="text-gray-600 text-lg">
            Learn cutting-edge AI technologies and automation from industry experts
          </p>
        </div>
        <Link 
          href="/ai-kurzy"
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
        >
          View All Courses
        </Link>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${
            canScrollLeft 
              ? 'hover:bg-gray-50 hover:shadow-xl cursor-pointer opacity-100' 
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 ${
            canScrollRight 
              ? 'hover:bg-gray-50 hover:shadow-xl cursor-pointer opacity-100' 
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <ChevronRightIcon className="w-6 h-6 text-gray-700" />
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-2 py-4"
          onScroll={checkScrollButtons}
        >
          {courses.map(course => (
            <div
              key={course.id}
              className="flex-none w-80 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
              style={{ height: '550px' }}
            >
              {/* Thumbnail with play button */}
              <div className="relative h-44 overflow-hidden flex-shrink-0">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <button className="w-14 h-14 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-opacity-100 hover:scale-110">
                    <PlayIcon className="w-5 h-5 text-purple-600 ml-0.5" />
                  </button>
                </div>
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleBookmark(course.id)}
                    className="w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all duration-200"
                  >
                    {course.isBookmarked ? (
                      <BookmarkFilledIcon className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <BookmarkIcon className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
                <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                  {course.duration}
                </div>
              </div>

              {/* Card content - fixed layout */}
              <div className="p-4 flex flex-col flex-1 min-h-0">
                {/* Level and lesson count */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                    course.level === 'Intermediate' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {course.level}
                  </span>
                  <span className="text-xs text-gray-500">{course.lessons} lessons</span>
                </div>

                {/* Course title - fixed height */}
                <Link href={`/ai-kurzy/chatgpt-for-business-complete-guide`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors cursor-pointer" style={{ height: '3.5rem' }}>
                    {course.title}
                  </h3>
                </Link>

                {/* Instructor */}
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{course.instructor}</span>
                </div>

                {/* Clean rating */}
                {renderCleanRating(course.rating, course.reviewsCount)}

                {/* Course description - VRÁCENO */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {course.description}
                </p>

                {/* Compact review for top courses - menší */}
                {course.rating >= 4.7 && course.reviews.length > 0 && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg border-l-2 border-yellow-400">
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex">{renderStars(course.reviews[0].rating, 'sm')}</div>
                      <span className="text-xs font-medium text-gray-900">{course.reviews[0].userName}</span>
                      {course.reviews[0].verified && (
                        <CheckBadgeIcon className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1 italic">
                      "{course.reviews[0].comment}"
                    </p>
                  </div>
                )}

                {/* Price and button - always at bottom */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <div className="text-xl font-bold text-purple-600">
                    {formatPrice(course.price)}
                  </div>
                  <Link href={`/ai-kurzy/chatgpt-for-business-complete-guide`}>
                    <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium text-sm">
                      Buy Now
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile tip */}
      <div className="mt-6 text-center md:hidden">
        <p className="text-sm text-gray-500">
          💡 Tip: Swipe left and right to browse more courses
        </p>
      </div>
    </div>
  )
} 