'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  AcademicCapIcon,
  UsersIcon,
  StarIcon,
  ClockIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarFilledIcon } from '@heroicons/react/24/solid'

interface Course {
  id: number
  title: string
  subtitle: string
  instructor: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string
  lessons: number
  students: number
  rating: number
  price: number
  status: 'published' | 'draft' | 'archived'
  lastUpdated: string
  thumbnail: string
}

export default function CoursesAdmin() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Kurzy nejsou dosud implementované v DB – ponecháme prázdný seznam bez mocků
  const courses: Course[] = [
    {
      id: 1,
      title: 'ChatGPT for Business: Complete Guide',
      subtitle: 'Master AI-powered productivity and automation',
      instructor: 'Tom Novak',
      category: 'ChatGPT & AI Assistants',
      level: 'Beginner',
      duration: '4h 30min',
      lessons: 24,
      students: 2341,
      rating: 4.8,
      price: 79,
      status: 'published',
      lastUpdated: '2024-01-15',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'Midjourney: AI Art Creation Mastery',
      subtitle: 'Create stunning AI artwork from beginner to pro',
      instructor: 'Maria Freeman',
      category: 'AI Art & Design',
      level: 'Intermediate',
      duration: '3h 15min',
      lessons: 18,
      students: 1876,
      rating: 4.9,
      price: 99,
      status: 'published',
      lastUpdated: '2024-01-12',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop'
    },
    {
      id: 3,
      title: 'Advanced Prompt Engineering',
      subtitle: 'Master the art of AI prompt crafting',
      instructor: 'Alex Turner',
      category: 'ChatGPT & AI Assistants',
      level: 'Advanced',
      duration: '3h 25min',
      lessons: 22,
      students: 0,
      rating: 0,
      price: 129,
      status: 'draft',
      lastUpdated: '2024-01-20',
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&h=200&fit=crop'
    },
    {
      id: 4,
      title: 'AI for Content Marketing',
      subtitle: 'Revolutionize your content strategy with AI',
      instructor: 'Jane Cooper',
      category: 'Marketing & AI',
      level: 'Beginner',
      duration: '3h 50min',
      lessons: 21,
      students: 3210,
      rating: 4.6,
      price: 89,
      status: 'published',
      lastUpdated: '2024-01-08',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop'
    },
    {
      id: 5,
      title: 'Python & AI: Machine Learning Basics',
      subtitle: 'Start your journey in AI programming',
      instructor: 'Dr. Martin Chen',
      category: 'Programming & AI',
      level: 'Advanced',
      duration: '8h 20min',
      lessons: 45,
      students: 1543,
      rating: 4.9,
      price: 199,
      status: 'archived',
      lastUpdated: '2023-12-15',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop'
    }
  ]

  const categories = [
    'ChatGPT & AI Assistants',
    'AI Art & Design',
    'Marketing & AI',
    'Programming & AI',
    'Automation & Workflow'
  ]

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
        return 'bg-blue-100 text-blue-800'
      case 'Advanced':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarFilledIcon
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        />
      )
    }
    return stars
  }

  const handleDelete = (courseId: number) => {
    if (confirm('Opravdu chcete smazat tento kurz? Tato akce je nevratná.')) {
      // Implementovat mazání kurzu
      console.log('Deleting course:', courseId)
    }
  }

  const handleDuplicate = (courseId: number) => {
    // Implementovat duplikování kurzu
    console.log('Duplicating course:', courseId)
  }

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.status === 'published').length,
    draft: courses.filter(c => c.status === 'draft').length,
    totalStudents: courses.reduce((sum, c) => sum + c.students, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <AcademicCapIcon className="w-8 h-8 text-purple-600" />
            Správa AI kurzů
          </h1>
          <p className="text-gray-600 mt-1">
            Spravuj online kurzy, lekce a studijní materiály
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Nový kurz
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpenIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkem kurzů</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Publikované</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.published}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentDuplicateIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Koncepty</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.draft}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-6 w-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkem studentů</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Vyhledat kurz
            </label>
            <input
              type="text"
              id="search"
              placeholder="Název kurzu nebo lektor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Všechny stavy</option>
              <option value="published">Publikované</option>
              <option value="draft">Koncepty</option>
              <option value="archived">Archivované</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Kategorie
            </label>
            <select
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Všechny kategorie</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kurz
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Úroveň
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Studenti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hodnocení
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-16 h-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {course.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {course.instructor} • {course.duration} • {course.lessons} lekcí
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{course.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.students.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {renderStars(course.rating)}
                      </div>
                      <span className="text-sm text-gray-900">
                        {course.rating > 0 ? course.rating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                      {course.status === 'published' ? 'Publikováno' : 
                       course.status === 'draft' ? 'Koncept' : 'Archivováno'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/ai-kurzy/chatgpt-for-business-complete-guide`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Zobrazit kurz"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="text-purple-600 hover:text-purple-900"
                        title="Upravit kurz"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(course.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Duplikovat kurz"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Smazat kurz"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Žádné kurzy</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'Nenalezeny žádné kurzy odpovídající filtrům.'
                : 'Začněte vytvořením nového kurzu.'}
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && (
              <div className="mt-6">
                <Link
                  href="/admin/courses/new"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Vytvořit první kurz
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 