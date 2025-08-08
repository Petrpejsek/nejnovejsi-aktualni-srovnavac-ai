'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  TrophyIcon,
  StarIcon,
  FireIcon,
  CheckIcon,
  BookmarkIcon,
  ShareIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { TrophyIcon as TrophyFilledIcon, StarIcon as StarFilledIcon, BookmarkIcon as BookmarkFilledIcon } from '@heroicons/react/24/solid'
import { getScreenshotUrl } from '@/lib/screenshot-utils'
import { useSession } from 'next-auth/react'
import Modal from '@/components/Modal'
import RegisterForm from '@/components/RegisterForm'

// Toast notification helper  
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
    type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
  }`
  toast.textContent = message
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => document.body.removeChild(toast), 300)
  }, 2000)
}

// SEO Content helpers
const getCategoryDescription = (categoryId: string): string => {
  const descriptions: { [key: string]: string } = {
    'code-generation': 'Code generation AI tools revolutionize software development by automatically creating high-quality code from natural language descriptions. These powerful tools help developers accelerate their workflow, reduce bugs, and focus on creative problem-solving rather than repetitive coding tasks.',
    'productivity': 'Productivity AI tools are designed to streamline workflows, automate repetitive tasks, and enhance overall efficiency. From smart scheduling to automated content creation, these tools help professionals and teams achieve more in less time.',
    'writing-tools': 'AI writing tools transform the way we create content, offering everything from grammar checking to full article generation. These tools help writers, marketers, and content creators produce high-quality text faster and more effectively.',
    'chatbots': 'AI chatbots provide intelligent conversational interfaces that can handle customer support, answer questions, and assist with various tasks. Modern chatbots use advanced natural language processing to deliver human-like interactions.',
    'image-generation': 'AI image generation tools create stunning visuals from text descriptions, enabling anyone to produce professional-quality artwork, illustrations, and designs without traditional design skills.',
    'video-editing': 'AI video editing tools automate complex editing tasks, from color correction to scene transitions, making professional video production accessible to creators of all skill levels.',
    'voice-assistants': 'AI voice assistants provide hands-free interaction with technology, helping users manage tasks, control smart devices, and access information through natural speech commands.',
    'data-analysis': 'AI data analysis tools process vast amounts of information to uncover insights, patterns, and trends that would be impossible to detect manually, enabling data-driven decision making.',
    'customer-support': 'AI customer support tools enhance service quality by providing instant responses, routing inquiries efficiently, and maintaining consistent support availability 24/7.',
    'sales': 'AI sales tools optimize the entire sales process from lead generation to closing deals, providing insights into customer behavior and automating routine sales tasks.',
    'marketing': 'AI marketing tools personalize campaigns, optimize ad spending, and analyze customer behavior to maximize ROI and engagement across all marketing channels.',
    'healthcare': 'AI healthcare tools assist medical professionals with diagnosis, treatment planning, and patient monitoring, improving care quality while reducing administrative burden.',
    'finance': 'AI finance tools provide automated trading, risk assessment, fraud detection, and financial planning, helping individuals and businesses make better financial decisions.',
    'education': 'AI education tools personalize learning experiences, automate grading, and provide intelligent tutoring to enhance both teaching and learning outcomes.',
    'hr': 'AI HR tools streamline recruitment, employee onboarding, performance evaluation, and workforce management, helping organizations build and maintain effective teams.',
    'cybersecurity': 'AI cybersecurity tools detect threats, prevent attacks, and monitor systems for suspicious activity, providing advanced protection against evolving cyber threats.',
    'research': 'AI research tools accelerate scientific discovery by analyzing literature, processing data, and identifying patterns across vast datasets in various research fields.',
    'ecommerce': 'AI ecommerce tools optimize online shopping experiences through personalized recommendations, dynamic pricing, and automated customer service.',
    'social-media': 'AI social media tools automate content creation, optimize posting schedules, and analyze engagement metrics to maximize social media impact.',
    'text-to-speech': 'AI text-to-speech tools convert written content into natural-sounding speech, enabling accessibility features and audio content creation.',
    'legal': 'AI legal tools assist with contract analysis, legal research, and document automation, helping legal professionals work more efficiently and accurately.',
  }
  return descriptions[categoryId] || `Discover the best AI tools in the ${categoryId} category, carefully selected for their innovation, reliability, and user satisfaction.`
}

const getCategoryFAQ = (categoryId: string) => {
  const faqs: { [key: string]: { question: string; answer: string }[] } = {
    'code-generation': [
      {
        question: 'What are AI code generation tools?',
        answer: 'AI code generation tools use machine learning to automatically write code based on natural language descriptions, comments, or existing code patterns. They can generate functions, classes, and entire applications.'
      },
      {
        question: 'Are AI-generated codes reliable for production?',
        answer: 'While AI-generated code can be very helpful, it should always be reviewed and tested before production use. Modern tools produce increasingly reliable code, but human oversight remains essential.'
      },
      {
        question: 'Which programming languages do these tools support?',
        answer: 'Most AI code generation tools support popular languages like Python, JavaScript, Java, C++, and many others. The best tools typically support 20+ programming languages.'
      }
    ],
    'productivity': [
      {
        question: 'How can AI productivity tools help my workflow?',
        answer: 'AI productivity tools can automate repetitive tasks, schedule meetings intelligently, prioritize emails, generate reports, and provide insights to help you focus on high-value activities.'
      },
      {
        question: 'Are these tools suitable for small businesses?',
        answer: 'Yes, many AI productivity tools offer scalable plans suitable for small businesses, freelancers, and individual users. They often provide significant time savings even with basic features.'
      },
      {
        question: 'What\'s the learning curve for productivity AI tools?',
        answer: 'Most modern productivity AI tools are designed to be user-friendly with minimal learning curves. Many integrate seamlessly with existing workflows and provide helpful onboarding.'
      }
    ],
    'writing-tools': [
      {
        question: 'Can AI writing tools replace human writers?',
        answer: 'AI writing tools are best used as assistants rather than replacements. They excel at generating drafts, checking grammar, and providing suggestions, but human creativity and judgment remain essential.'
      },
      {
        question: 'Do AI writing tools help with SEO?',
        answer: 'Many AI writing tools include SEO optimization features like keyword suggestions, readability analysis, and content structure recommendations to improve search rankings.'
      },
      {
        question: 'Are there AI tools for different types of writing?',
        answer: 'Yes, there are specialized AI tools for blog posts, marketing copy, academic writing, creative fiction, technical documentation, and more, each optimized for specific writing styles.'
      }
    ]
  }
  
  // Default FAQ for categories not specifically defined
  const defaultFaq = [
    {
      question: `What makes these ${categoryId} AI tools the best?`,
      answer: 'Our selection criteria include user reviews, feature completeness, reliability, customer support quality, and innovation. Each tool has been tested and evaluated by our experts.'
    },
    {
      question: 'Are these tools suitable for beginners?',
      answer: 'Our list includes tools for all skill levels. Many offer user-friendly interfaces and comprehensive tutorials to help beginners get started quickly.'
    },
    {
      question: 'How often is this list updated?',
      answer: 'We regularly review and update our rankings based on new features, user feedback, and emerging tools in the market to ensure you always have access to the latest and best options.'
    }
  ]
  
  return faqs[categoryId] || defaultFaq
}

const getCategoryTips = (categoryId: string) => {
  const tips: { [key: string]: { factors: string[]; gettingStarted: string[] } } = {
    'code-generation': {
      factors: [
        'Programming language support',
        'Code quality and accuracy',
        'Integration with your IDE',
        'Learning and adaptation capabilities',
        'Security and privacy features'
      ],
      gettingStarted: [
        'Start with simple code generation tasks',
        'Review and test all generated code',
        'Learn the tool\'s syntax and commands',
        'Integrate gradually into your workflow',
        'Join community forums for tips'
      ]
    },
    'productivity': {
      factors: [
        'Integration with existing tools',
        'Automation capabilities',
        'User interface and ease of use',
        'Customization options',
        'Pricing and scalability'
      ],
      gettingStarted: [
        'Identify your biggest time-wasters',
        'Start with one tool at a time',
        'Set up basic automations first',
        'Track time saved to measure impact',
        'Gradually expand to more features'
      ]
    }
  }
  
  // Default tips for categories not specifically defined
  const defaultTips = {
    factors: [
      'Feature set and capabilities',
      'Ease of use and learning curve',
      'Integration possibilities',
      'Pricing and value for money',
      'Customer support quality'
    ],
    gettingStarted: [
      'Start with free trials or basic plans',
      'Watch tutorial videos and guides',
      'Join user communities and forums',
      'Begin with simple use cases',
      'Gradually explore advanced features'
    ]
  }
  
  return tips[categoryId] || defaultTips
}



// Professional icons for all categories - same as used throughout the site
const getAllCategoryIcons = (): { [key: string]: React.ReactNode } => ({
  'writing-tools': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  'chatbots': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>,
  'image-generation': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>,
  'speech-to-text': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>,
  'text-to-speech': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.59-.79-1.59-1.75v-3.5c0-.96.71-1.75 1.59-1.75h2.24z" /></svg>,
  'video-editing': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>,
  'automation': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  'developer-tools': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
  'marketing': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>,
  'customer-support': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>,
  'design-tools': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>,
  'education': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
  'hr-recruiting': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
  'legal': <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4c-2.5 0-4.5 2-4.5 4.5 0 1.5 0.7 2.8 1.8 3.5-1.1 0.7-1.8 2-1.8 3.5 0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5c0-1.5-0.7-2.8-1.8-3.5 1.1-0.7 1.8-2 1.8-3.5C16.5 6 14.5 4 12 4zM12 6c1.4 0 2.5 1.1 2.5 2.5S13.4 11 12 11s-2.5-1.1-2.5-2.5S10.6 6 12 6zM12 13c1.4 0 2.5 1.1 2.5 2.5S13.4 18 12 18s-2.5-1.1-2.5-2.5S10.6 13 12 13z"/><path d="M11 10h2v4h-2z" fill="currentColor"/></svg>,
  'healthcare': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
  'finance': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'ecommerce': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>,
  'code-generation': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" /></svg>,
  'productivity': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  'website-builders': <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.896c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25" /></svg>
})

const getAllCategories = () => {
  const icons = getAllCategoryIcons()
  return [
    { slug: 'writing-tools', name: 'Writing Tools', icon: icons['writing-tools'] },
    { slug: 'chatbots', name: 'Chatbots & Virtual Assistants', icon: icons['chatbots'] },
    { slug: 'image-generation', name: 'Image Generation', icon: icons['image-generation'] },
    { slug: 'speech-to-text', name: 'Speech to Text', icon: icons['speech-to-text'] },
    { slug: 'text-to-speech', name: 'Text to Speech', icon: icons['text-to-speech'] },
    { slug: 'video-editing', name: 'Video Editing', icon: icons['video-editing'] },
    { slug: 'automation', name: 'Process Automation', icon: icons['automation'] },
    { slug: 'developer-tools', name: 'Developer Tools', icon: icons['developer-tools'] },
    { slug: 'marketing', name: 'Marketing Tools', icon: icons['marketing'] },
    { slug: 'customer-support', name: 'Customer Support', icon: icons['customer-support'] },
    { slug: 'design-tools', name: 'Design Tools', icon: icons['design-tools'] },
    { slug: 'education', name: 'Education & Learning', icon: icons['education'] },
    { slug: 'hr-recruiting', name: 'HR & Recruiting', icon: icons['hr-recruiting'] },
    { slug: 'legal', name: 'Legal Tools', icon: icons['legal'] },
    { slug: 'healthcare', name: 'Healthcare', icon: icons['healthcare'] },
    { slug: 'finance', name: 'Finance & Accounting', icon: icons['finance'] },
    { slug: 'ecommerce', name: 'E-commerce', icon: icons['ecommerce'] },
    { slug: 'code-generation', name: 'Code Generation', icon: icons['code-generation'] },
    { slug: 'productivity', name: 'Productivity', icon: icons['productivity'] },
    { slug: 'website-builders', name: 'Website Builders', icon: icons['website-builders'] }
  ]
}

interface TopList {
  id: string
  title: string
  description: string
  category: string
  products: string[]
  status: string
  clicks: number
  conversion: number
  createdAt: string
  updatedAt: string
}

interface Product {
  id: string
  name: string
  description: string
  imageUrl?: string
  externalUrl: string
  pricingInfo?: any
  effective_balance?: number
  screenshot_url?: string
  tags?: string[]
  hasTrial?: boolean
}

// Category icons a styling
const categoryIcons: { [key: string]: React.ReactNode } = {
  'writing-tools': <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  'chatbots': <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>,
  'productivity': <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  'video-editing': <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" /></svg>,
  'text-to-speech': <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.59-.79-1.59-1.75v-3.5c0-.96.71-1.75 1.59-1.75h2.24z" /></svg>,
  'legal': <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4c-2.5 0-4.5 2-4.5 4.5 0 1.5 0.7 2.8 1.8 3.5-1.1 0.7-1.8 2-1.8 3.5 0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5c0-1.5-0.7-2.8-1.8-3.5 1.1-0.7 1.8-2 1.8-3.5C16.5 6 14.5 4 12 4zM12 6c1.4 0 2.5 1.1 2.5 2.5S13.4 11 12 11s-2.5-1.1-2.5-2.5S10.6 6 12 6zM12 13c1.4 0 2.5 1.1 2.5 2.5S13.4 18 12 18s-2.5-1.1-2.5-2.5S10.6 13 12 13z"/><path d="M11 10h2v4h-2z" fill="currentColor"/></svg>
}

const categoryStyles: { [key: string]: { gradient: string, iconBg: string, name: string } } = {
  'writing-tools': { gradient: 'bg-emerald-50', iconBg: 'bg-emerald-100 text-emerald-700', name: 'Writing Tools' },
  'chatbots': { gradient: 'bg-blue-50', iconBg: 'bg-blue-100 text-blue-700', name: 'Chatbots' },
  'productivity': { gradient: 'bg-sky-50', iconBg: 'bg-sky-100 text-sky-700', name: 'Productivity' },
  'video-editing': { gradient: 'bg-red-50', iconBg: 'bg-red-100 text-red-700', name: 'Video Editing' },
  'text-to-speech': { gradient: 'bg-violet-50', iconBg: 'bg-violet-100 text-violet-700', name: 'Text to Speech' },
  'legal': { gradient: 'bg-gray-50', iconBg: 'bg-gray-100 text-gray-700', name: 'Legal Tools' }
}

export default function CategoryListPage() {
  const { data: session } = useSession()
  const params = useParams() || ({} as Record<string, string>)
  const categoryId = (params as any)?.category as string
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [topList, setTopList] = useState<TopList | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  
  const categoryStyle = categoryStyles[categoryId] || categoryStyles['productivity']
  const categoryIcon = categoryIcons[categoryId] || <SparklesIcon className="w-6 h-6 sm:w-8 sm:h-8" />
  
  // Načítání dat z API
  useEffect(() => {
    const loadTopListData = async () => {
      try {
        setLoading(true)
        
        // SUPER RYCHLÉ načítání - 1 API call místo 21!
        const topListResponse = await fetch(`/api/top-lists?category=${categoryId}&status=published&includeProducts=true`)
        if (!topListResponse.ok) {
          throw new Error('Failed to load top list')
        }
        
        const topListsData = await topListResponse.json()
        const currentTopList = topListsData.find((list: any) => list.category === categoryId)
        
        if (!currentTopList) {
          throw new Error('Top list not found for this category')
        }
        
        setTopList(currentTopList)
        
        // Produkty jsou už naložené v currentTopList.productsData - jen přidej screenshoty
        const productsData: Product[] = []
        if (currentTopList.productsData && Array.isArray(currentTopList.productsData)) {
          for (const product of currentTopList.productsData) {
            const productWithScreenshot = {
              ...product,
              screenshot_url: product.imageUrl || getScreenshotUrl(product.name)
            }
            productsData.push(productWithScreenshot)
          }
        }
        
        setProducts(productsData)
        setError(null)
      } catch (err) {
        console.error('Failed to load top list data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    
    loadTopListData()
  }, [categoryId])
  
  const handleFavorite = async (productId: string) => {
    if (!session) {
      setShowSignUpModal(true)
      return
    }

    // Start animation immediately
    setIsAnimating(true)

    // OPTIMISTIC UPDATE - okamžitě aktualizujeme UI
    const newFavorites = new Set(favorites)
    const isCurrentlyFavorited = newFavorites.has(productId)
    
    if (isCurrentlyFavorited) {
      newFavorites.delete(productId)
      setFavorites(newFavorites)
      showToast('Removed!', 'success')
    } else {
      newFavorites.add(productId)
      setFavorites(newFavorites)
      showToast('Saved!', 'success')
    }
    
    // End animation quickly
    setTimeout(() => setIsAnimating(false), 300)

    // API call in background - no await, non-blocking
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return
      
      if (!isCurrentlyFavorited) {
        // Add to favorites
        fetch('/api/users/saved-products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: productId,
            productName: product.name,
            category: product.tags?.[0] || 'AI Tool',
            imageUrl: product.screenshot_url || product.imageUrl,
            price: product.hasTrial ? 0 : 0
          }),
        }).catch(error => {
          console.error('Error saving product:', error)
          // Revert on error
          const revertedFavorites = new Set(favorites)
          revertedFavorites.delete(productId)
          setFavorites(revertedFavorites)
          showToast('Error saving', 'error')
        })
      } else {
        // Remove from favorites
        fetch(`/api/users/saved-products?productId=${productId}`, {
          method: 'DELETE'
        }).catch(error => {
          console.error('Error removing product:', error)
        })
      }
    } catch (error) {
      console.error('Error with favorite operation:', error)
    }
  }

  const handleShare = async (product: Product) => {
    const shareUrl = `${window.location.origin}/top-lists/${categoryId}#${product.id}`
    
    if (navigator.share) {
      // Native sharing on mobile
      try {
        await navigator.share({
          title: `${product.name} - TOP AI Tool`,
          text: product.description,
          url: shareUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Copy to clipboard on desktop
      try {
        await navigator.clipboard.writeText(shareUrl)
        showToast('Link copied!', 'success')
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        showToast('Error copying link', 'error')
      }
    }
  }

  // Loading state
  if (loading) {
        return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </div>
    )
    }

  // Error state
  if (error || !topList) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-32">
              <div className="text-6xl mb-4">😞</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Top List Not Found</h1>
              <p className="text-gray-600 mb-6">The requested category doesn't exist or hasn't been published yet.</p>
              <Link
                href="/top-lists"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Browse All Categories
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 sm:gap-2 mb-4 sm:mb-6 text-xs sm:text-sm text-gray-600 overflow-x-auto">
            <Link href="/" className="hover:text-purple-600 whitespace-nowrap">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/top-lists" className="hover:text-purple-600 whitespace-nowrap">TOP Lists</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 whitespace-nowrap">{categoryStyle.name}</span>
          </div>

          {/* Header */}
          <div className={`${categoryStyle.gradient} rounded-xl sm:rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 border border-gray-200`}>
            <div className="flex items-start gap-4 sm:gap-6">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${categoryStyle.iconBg} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                {categoryIcon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight break-words" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
                    {topList.title}
                  </h1>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full self-start shadow-lg">
                    <TrophyFilledIcon className="w-4 h-4" />
                    <span className="text-sm font-bold">2025 Edition</span>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-gray-700 mb-4 leading-relaxed">
                  {topList.description}
                </p>
                <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FireIcon className="w-4 h-4 text-red-500" />
                    <span>Updated January 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    <span>Expert Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-4 h-4 text-blue-500" />
                    <span>{products.length} Tools Ranked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products List */}
          <div className="space-y-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  
                                    {/* Left section - screenshot, rank and stats */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-center gap-4 lg:gap-6 lg:w-48 flex-shrink-0">
                    {/* Screenshot */}
                    <div className="flex justify-center">
                      {product.screenshot_url ? (
                        <img
                          src={product.screenshot_url}
                          alt={`${product.name} screenshot`}
                          className="w-32 h-20 sm:w-40 sm:h-24 lg:w-44 lg:h-28 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform border border-gray-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-32 h-20 sm:w-40 sm:h-24 lg:w-44 lg:h-28 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-lg border border-gray-200">
                          <span className="text-gray-400 text-sm font-medium">Screenshot</span>
                        </div>
                      )}
                    </div>

                    {/* Rank badge */}
                    <div className={`w-16 h-16 rounded-full ${categoryStyle.iconBg} flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-105 transition-transform`}>
                      {index + 1}.
                    </div>

                    {/* Quick stats */}
                    <div className="hidden lg:flex flex-col items-center text-center space-y-3">
                      {product.effective_balance && product.effective_balance > 0 && (
                        <div className="flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
                          <CheckIcon className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Premium</span>
                        </div>
                      )}
                      {product.pricingInfo && (
                        <span className="text-sm font-semibold text-purple-600 bg-purple-50 px-4 py-2 rounded-full">
                          {typeof product.pricingInfo === 'object' ? 'Freemium' : product.pricingInfo}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right section - main content */}
                  <div className="flex-1 min-w-0">
                    {/* Header with title and action buttons */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-purple-600 transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          {product.effective_balance && product.effective_balance > 0 && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100">
                              FEATURED
                            </span>
                          )}
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">Verified</span>
                            </div>
                            
                            {/* Product Tags */}
                            {product.tags && product.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200">
                                {tag}
                              </span>
                            ))}
                            
                            {/* Freemium Tag */}
                            {(product.pricingInfo || product.hasTrial) && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200">
                                Freemium
                              </span>
                            )}
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleFavorite(product.id)}
                          className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          {favorites.has(product.id) ? (
                            <BookmarkFilledIcon className="w-6 h-6 text-purple-600" />
                          ) : (
                            <BookmarkIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </button>
                        <button 
                          onClick={() => handleShare(product)}
                          className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <ShareIcon className="w-6 h-6 text-gray-400" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                      {product.description}
                    </p>



                    {/* Pros and Cons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                          <CheckIcon className="w-5 h-5 text-green-600" />
                          Pros
                        </h4>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Advanced AI-powered features</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>User-friendly interface</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Excellent performance and reliability</span>
                            </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                          <span className="w-5 h-5 text-red-600 text-center font-bold">×</span>
                          Cons
                        </h4>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Premium features require subscription</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Learning curve for beginners</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>Limited free tier options</span>
                            </li>
                        </ul>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <a
                        href={product.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-semibold flex items-center justify-center gap-3 text-lg group-hover:from-purple-700 group-hover:to-pink-700"
                      >
                        Visit Website
                        <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No products message */}
          {products.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <div className="text-6xl mb-4">🛠️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h3>
              <p className="text-gray-600 mb-6">
                We're working hard to populate this category with the best AI tools.
              </p>
              <Link
                href="/top-lists"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Explore Other Categories
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* More coming soon */}
          {products.length > 0 && products.length < 20 && (
            <div className="mt-12 text-center p-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">More Tools Coming Soon!</h3>
              <p className="text-gray-600 mb-6">
                We're constantly updating our lists with the latest AI tools. {20 - products.length} more tools will be added to reach the complete TOP 20.
            </p>
            <Link
              href="/top-lists"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
                Explore Other Categories
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* SEO Content Section */}
        <div className="mt-16 space-y-12">
          {/* About Category Section */}
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              About {categoryStyle.name} AI Tools
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                {getCategoryDescription(categoryId)}
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our curated list of the top 20 {categoryStyle.name.toLowerCase()} AI tools has been carefully selected based on features, user reviews, performance, and innovation. Each tool has been evaluated by our experts to ensure you get the best options available in 2025.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {getCategoryFAQ(categoryId).map((faq, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How to Choose the Right {categoryStyle.name} Tool
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Factors to Consider:</h3>
                <ul className="space-y-2 text-gray-700">
                  {getCategoryTips(categoryId).factors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Getting Started:</h3>
                <ul className="space-y-2 text-gray-700">
                  {getCategoryTips(categoryId).gettingStarted.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* All TOP 20 Categories */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Browse All TOP 20 Categories
            </h2>
            <p className="text-gray-600 mb-8">
              Discover the best AI tools across all categories. Each list is carefully curated and regularly updated with the latest tools.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {getAllCategories().filter(cat => cat.slug !== categoryId).map((category) => (
                <Link
                  key={category.slug}
                  href={`/top-lists/${category.slug}`}
                  className="p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group text-center"
                >
                  <div className="mb-2 text-gray-600 group-hover:text-blue-600 transition-colors flex justify-center">
                    {category.icon}
                  </div>
                  <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm leading-tight">
                    {category.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    TOP 20
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>

    {/* Sign Up Modal */}
    {showSignUpModal && (
      <Modal isOpen={showSignUpModal} onClose={() => setShowSignUpModal(false)} title="Sign Up Required">
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Create an account to save your favorite AI tools and access personalized recommendations.
          </p>
          <RegisterForm />
        </div>
      </Modal>
    )}
  </>
  )
} 