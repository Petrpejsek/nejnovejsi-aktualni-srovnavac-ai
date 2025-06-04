'use client'

import React, { useState } from 'react'
import { 
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  CalendarIcon,
  EyeIcon,
  AcademicCapIcon,
  CubeIcon,
  BuildingOfficeIcon,
  CogIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Permission {
  id: string
  name: string
  description: string
  category: 'content' | 'analytics' | 'users' | 'system'
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  color: string
}

interface User {
  id: number
  email: string
  name: string
  role: string
  permissions: string[]
  isActive: boolean
  lastLogin: string
  createdAt: string
}

export default function UsersAdmin() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState('editor')

  // Definice oprávnění
  const permissions: Permission[] = [
    // Content permissions
    { id: 'products.read', name: 'Zobrazit produkty', description: 'Přístup k seznamu produktů', category: 'content' },
    { id: 'products.write', name: 'Upravit produkty', description: 'Přidávání a úprava produktů', category: 'content' },
    { id: 'products.delete', name: 'Mazat produkty', description: 'Mazání produktů', category: 'content' },
    
    { id: 'courses.read', name: 'Zobrazit kurzy', description: 'Přístup k seznamu kurzů', category: 'content' },
    { id: 'courses.write', name: 'Upravit kurzy', description: 'Vytváření a úprava kurzů', category: 'content' },
    { id: 'courses.delete', name: 'Mazat kurzy', description: 'Mazání kurzů', category: 'content' },
    
    { id: 'companies.read', name: 'Zobrazit firmy', description: 'Přístup k seznamu firem', category: 'content' },
    { id: 'companies.approve', name: 'Schvalovat firmy', description: 'Schvalování nových firem', category: 'content' },
    { id: 'companies.delete', name: 'Mazat firmy', description: 'Mazání firem', category: 'content' },
    
    { id: 'pages.read', name: 'Zobrazit stránky', description: 'Přístup k editoru stránek', category: 'content' },
    { id: 'pages.write', name: 'Upravit stránky', description: 'Úprava statických stránek', category: 'content' },
    
    // Analytics permissions
    { id: 'analytics.read', name: 'Zobrazit analytics', description: 'Přístup k analytickým datům', category: 'analytics' },
    { id: 'analytics.export', name: 'Exportovat data', description: 'Export analytických reportů', category: 'analytics' },
    
    // User management permissions
    { id: 'users.read', name: 'Zobrazit uživatele', description: 'Přístup k seznamu uživatelů', category: 'users' },
    { id: 'users.write', name: 'Upravit uživatele', description: 'Správa uživatelských účtů', category: 'users' },
    { id: 'users.permissions', name: 'Spravovat oprávnění', description: 'Přidělování oprávnění', category: 'users' },
    
    // System permissions
    { id: 'system.settings', name: 'Nastavení systému', description: 'Přístup k nastavením', category: 'system' },
    { id: 'system.logs', name: 'Systémové logy', description: 'Zobrazení logů', category: 'system' }
  ]

  // Definice rolí
  const roles: Role[] = [
    {
      id: 'super_admin',
      name: 'Super Administrator',
      description: 'Neomezený přístup ke všem funkcím',
      permissions: permissions.map(p => p.id),
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Správa obsahu a uživatelů',
      permissions: [
        'products.read', 'products.write', 'products.delete',
        'courses.read', 'courses.write', 'courses.delete',
        'companies.read', 'companies.approve', 'companies.delete',
        'pages.read', 'pages.write',
        'analytics.read', 'analytics.export',
        'users.read', 'users.write'
      ],
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'editor',
      name: 'Editor',
      description: 'Úprava obsahu a produktů',
      permissions: [
        'products.read', 'products.write',
        'courses.read', 'courses.write',
        'companies.read',
        'pages.read', 'pages.write',
        'analytics.read'
      ],
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'moderator',
      name: 'Moderator',
      description: 'Schvalování a moderace obsahu',
      permissions: [
        'products.read',
        'courses.read',
        'companies.read', 'companies.approve',
        'analytics.read'
      ],
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'viewer',
      name: 'Prohlížeč',
      description: 'Pouze čtení dat',
      permissions: [
        'products.read',
        'courses.read',
        'companies.read',
        'pages.read',
        'analytics.read'
      ],
      color: 'bg-gray-100 text-gray-800'
    }
  ]

  // Mock data uživatelů
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      email: 'admin@example.com',
      name: 'Petr Admin',
      role: 'super_admin',
      permissions: roles.find(r => r.id === 'super_admin')?.permissions || [],
      isActive: true,
      lastLogin: '2024-01-25 14:30',
      createdAt: '2024-01-01'
    },
    {
      id: 2,
      email: 'editor@example.com',
      name: 'Jana Editorka',
      role: 'editor',
      permissions: roles.find(r => r.id === 'editor')?.permissions || [],
      isActive: true,
      lastLogin: '2024-01-24 16:45',
      createdAt: '2024-01-15'
    },
    {
      id: 3,
      email: 'moderator@example.com',
      name: 'Milan Moderátor',
      role: 'moderator',
      permissions: roles.find(r => r.id === 'moderator')?.permissions || [],
      isActive: false,
      lastLogin: '2024-01-20 09:15',
      createdAt: '2024-01-10'
    }
  ])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  const getRoleInfo = (roleId: string) => {
    return roles.find(r => r.id === roleId) || roles[4] // fallback to viewer
  }

  const handleAddUser = () => {
    if (!newUserEmail.trim()) return

    const role = roles.find(r => r.id === newUserRole)
    if (!role) return

    const newUser: User = {
      id: users.length + 1,
      email: newUserEmail.trim(),
      name: newUserEmail.split('@')[0],
      role: newUserRole,
      permissions: role.permissions,
      isActive: true,
      lastLogin: 'Nikdy',
      createdAt: new Date().toISOString().split('T')[0]
    }

    setUsers([...users, newUser])
    setNewUserEmail('')
    setShowAddUser(false)
  }

  const handleToggleUserStatus = (userId: number) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ))
  }

  const handleDeleteUser = (userId: number) => {
    if (confirm('Opravdu chcete smazat tohoto uživatele?')) {
      setUsers(users.filter(user => user.id !== userId))
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content':
        return <CubeIcon className="w-4 h-4" />
      case 'analytics':
        return <ChartBarIcon className="w-4 h-4" />
      case 'users':
        return <UserGroupIcon className="w-4 h-4" />
      case 'system':
        return <CogIcon className="w-4 h-4" />
      default:
        return <EyeIcon className="w-4 h-4" />
    }
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    roles: {
      super_admin: users.filter(u => u.role === 'super_admin').length,
      admin: users.filter(u => u.role === 'admin').length,
      editor: users.filter(u => u.role === 'editor').length,
      moderator: users.filter(u => u.role === 'moderator').length,
      viewer: users.filter(u => u.role === 'viewer').length
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UserGroupIcon className="w-8 h-8 text-purple-600" />
            Správa uživatelů
          </h1>
          <p className="text-gray-600 mt-1">
            Spravuj uživatelské účty, role a oprávnění
          </p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Přidat uživatele
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Celkem</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckIcon className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Aktivní</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Admini</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.roles.super_admin + stats.roles.admin}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <PencilIcon className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Editori</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.roles.editor}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EyeIcon className="h-6 w-6 text-gray-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Prohlížeči</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.roles.viewer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Přidat nového uživatele</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="uzivatel@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Přidat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Vyhledat uživatele
            </label>
            <input
              type="text"
              id="search"
              placeholder="Email nebo jméno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              id="role"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Všechny role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uživatel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poslední přihlášení
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const roleInfo = getRoleInfo(user.role)
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-purple-600 font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleInfo.color}`}>
                        {roleInfo.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className={`text-sm ${user.isActive ? 'text-green-800' : 'text-red-800'}`}>
                          {user.isActive ? 'Aktivní' : 'Neaktivní'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleUserStatus(user.id)}
                          className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={user.isActive ? 'Deaktivovat' : 'Aktivovat'}
                        >
                          {user.isActive ? <XMarkIcon className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
                        </button>
                        <button
                          className="text-purple-600 hover:text-purple-900"
                          title="Upravit uživatele"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Smazat uživatele"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Přehled oprávnění podle kategorií</h3>
          <p className="text-sm text-gray-600 mt-1">Dostupná oprávnění v systému</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['content', 'analytics', 'users', 'system'].map(category => {
              const categoryPermissions = permissions.filter(p => p.category === category)
              const categoryName = {
                content: 'Obsah',
                analytics: 'Analytics',
                users: 'Uživatelé',
                system: 'Systém'
              }[category]

              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <h4 className="font-medium text-gray-900">{categoryName}</h4>
                  </div>
                  <div className="space-y-2">
                    {categoryPermissions.map(permission => (
                      <div key={permission.id} className="text-sm">
                        <div className="font-medium text-gray-900">{permission.name}</div>
                        <div className="text-gray-500 text-xs">{permission.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 