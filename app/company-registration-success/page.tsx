'use client'

import React from 'react'
import Link from 'next/link'
import { CheckCircleIcon, ClockIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export default function CompanyRegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Registration Successful!
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Thank you for joining comparee.ai as an AI company partner.
        </p>

        {/* What Happens Next */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            What happens next?
          </h2>
          
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-sm">1</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Application Review</h3>
                <p className="text-gray-600 text-sm">
                  Our team will review your application to ensure it meets our quality standards for AI companies.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-sm">2</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Email Notification</h3>
                <p className="text-gray-600 text-sm">
                  We'll send you an email confirmation once your account is approved (usually within 1-2 business days).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-sm">3</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Account Activation</h3>
                <p className="text-gray-600 text-sm">
                  Once approved, you'll gain access to your company dashboard and all partnership features.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Current Status */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ClockIcon className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Pending Review</span>
            </div>
            <p className="text-yellow-700 text-sm">
              Your application is currently being reviewed by our team.
            </p>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <EnvelopeIcon className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Stay Informed</span>
            </div>
            <p className="text-blue-700 text-sm">
              Check your email for updates on your application status.
            </p>
          </div>
        </div>

        {/* Company Benefits Preview */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What you'll get as a partner:
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Featured product listings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Performance analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Affiliate program access</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Promotional campaigns</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Direct customer feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                <span className="text-gray-700">Priority support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
          >
            Back to Homepage
          </Link>
          <a
            href="mailto:business@comparee.ai?subject=Company Registration Follow-up"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
          >
            Contact Support
          </a>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Questions about your application? Email us at{' '}
            <a href="mailto:business@comparee.ai" className="text-purple-600 hover:text-purple-700">
              business@comparee.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 