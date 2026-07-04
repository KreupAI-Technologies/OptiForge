'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, BookOpen, Video, MessageCircle, Search, FileText, Users, ShoppingCart, Package, Factory } from 'lucide-react';

const helpCategories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics of using OptiForge ERP',
    icon: HelpCircle,
    color: 'bg-blue-500',
    articles: 12,
    href: '/help/getting-started',
  },
  {
    id: 'crm',
    name: 'CRM Module',
    description: 'Customer relationship management help',
    icon: Users,
    color: 'bg-purple-500',
    articles: 18,
    href: '/help/crm',
  },
  {
    id: 'sales',
    name: 'Sales & Orders',
    description: 'Sales order processing and quotations',
    icon: ShoppingCart,
    color: 'bg-green-500',
    articles: 15,
    href: '/help/sales',
  },
  {
    id: 'production',
    name: 'Production',
    description: 'Manufacturing and work order management',
    icon: Factory,
    color: 'bg-red-500',
    articles: 22,
    href: '/help/production',
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Stock and warehouse management',
    icon: Package,
    color: 'bg-orange-500',
    articles: 16,
    href: '/help/inventory',
  },
];

const quickLinks = [
  { title: 'How to create a work order', href: '/help/articles/create-work-order', category: 'Production' },
  { title: 'Setting up BOQ templates', href: '/help/articles/boq-templates', category: 'Estimation' },
  { title: 'Managing customer interactions', href: '/help/articles/customer-interactions', category: 'CRM' },
  { title: 'Generating financial reports', href: '/help/articles/financial-reports', category: 'Reports' },
];

const faqs = [
  { q: 'How do I reset my password?', a: 'Go to Profile > Security and click "Change Password"' },
  { q: 'Can I export reports to Excel?', a: 'Yes, use the Export button on any report page' },
  { q: 'How do I track order status?', a: 'Navigate to Sales > Orders and use the tracking filters' },
  { q: 'Who do I contact for technical support?', a: 'Use the Support widget or email support@kreupai.com' },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-2">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">How can we help you?</h1>
          <p className="text-gray-600 text-lg mb-8">
            Search our knowledge base or browse by category
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles, guides, or tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-lg"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-12">
          <Link
            href="/documentation"
            className="bg-white rounded-lg shadow border border-gray-200 p-3 hover:shadow-lg transition-all text-center"
          >
            <BookOpen className="w-12 h-12 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Documentation</h3>
            <p className="text-sm text-gray-600">Complete system documentation and user guides</p>
          </Link>

          <Link
            href="/help"
            className="bg-white rounded-lg shadow border border-gray-200 p-3 hover:shadow-lg transition-all text-center"
          >
            <Video className="w-12 h-12 text-red-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Video Tutorials</h3>
            <p className="text-sm text-gray-600">Step-by-step video guides and walkthroughs</p>
          </Link>

          <Link
            href="/support/incidents"
            className="bg-white rounded-lg shadow border border-gray-200 p-3 hover:shadow-lg transition-all text-center"
          >
            <MessageCircle className="w-12 h-12 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
            <p className="text-sm text-gray-600">Get help from our support team</p>
          </Link>
        </div>

        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {helpCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  key={category.id}
                  href={category.href}
                  className="bg-white rounded-lg shadow border border-gray-200 p-3 hover:shadow-lg transition-all"
                >
                  <div className={`${category.color} w-12 h-12 rounded-lg flex items-center justify-center mb-2`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  <p className="text-sm text-blue-600 font-medium">{category.articles} articles</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Popular Articles</h2>
          <div className="bg-white rounded-lg shadow border border-gray-200 divide-y divide-gray-200">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-gray-900">{link.title}</h4>
                    <span className="text-sm text-gray-500">{link.category}</span>
                  </div>
                </div>
                <span className="text-blue-600">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-3">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-blue-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
          <p className="mb-3">Our support team is here to assist you</p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/support/incidents"
              className="px-3 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Create Support Ticket
            </Link>
            <a
              href="mailto:support@kreupai.com"
              className="px-3 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
