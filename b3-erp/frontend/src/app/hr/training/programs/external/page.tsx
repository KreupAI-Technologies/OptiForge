'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, DollarSign, Search, CheckCircle, Book, AlertCircle } from 'lucide-react';
import { HrPagesService } from '@/services/hr-pages.service';

interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  status: 'Approved' | 'Pending';
  cost: string;
}

interface ExternalCourse {
  id: string;
  title: string;
  provider: string;
  duration: string;
  price: string;
}

export default function ExternalTrainingPage() {
  const vendors: Vendor[] = [
    { id: '1', name: 'Coursera for Business', category: 'Online Learning', rating: 4.8, status: 'Approved', cost: '$5,000/yr' },
    { id: '2', name: 'Udemy Business', category: 'Technical Skills', rating: 4.6, status: 'Approved', cost: '$3,500/yr' },
    { id: '3', name: 'Global Leadership Inst.', category: 'Leadership', rating: 4.9, status: 'Approved', cost: '$2,000/workshop' },
    { id: '4', name: 'CodeAcademy', category: 'Coding', rating: 4.5, status: 'Pending', cost: '$2,000/yr' },
  ];

  const [courses, setCourses] = useState<ExternalCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const raw = (await HrPagesService.trainingPrograms()) as any[];
        const mapped: ExternalCourse[] = (Array.isArray(raw) ? raw : []).map((r) => ({
          id: String(r.id ?? ''),
          title: r.title ?? '',
          provider: r.provider ?? '',
          duration: r.duration ?? '',
          price: r.price ?? '',
        }));
        if (!cancelled) setCourses(mapped);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load courses');
          setCourses([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-6 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ExternalLink className="h-8 w-8 text-purple-600" />
            External Training
          </h1>
          <p className="text-gray-500 mt-1">Manage external vendors and training budget.</p>
        </div>
        <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
          <div className="p-2 bg-green-100 rounded-full">
            <DollarSign className="h-5 w-5 text-green-700" />
          </div>
          <div>
            <p className="text-xs text-green-600 font-medium">Budget Utilized</p>
            <p className="text-lg font-bold text-green-800">$12,450 / $50,000</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Approved Vendors */}
        <div className="lg:col-span-2 space-y-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Training Providers</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium pl-4">Provider</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Rating</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Cost Model</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendors.map(vendor => (
                    <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 pl-4 font-medium text-gray-900">{vendor.name}</td>
                      <td className="py-4 text-gray-600 text-sm">{vendor.category}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-900">{vendor.rating}</span>
                          <span className="text-yellow-400">★</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${vendor.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="py-4 text-sm text-gray-600">{vendor.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Featured Courses */}
        <div className="space-y-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Book className="h-5 w-5 text-gray-400" />
              Popular Courses
            </h3>
            <div className="space-y-2">
              {courses.map(course => (
                <div key={course.id} className="p-4 border border-gray-100 rounded-lg hover:border-purple-200 hover:shadow-sm transition-all bg-gray-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      {course.provider}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{course.price}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{course.title}</h4>
                  <p className="text-sm text-gray-500 mb-3">{course.duration}</p>
                  <button className="w-full py-2 text-sm text-purple-700 font-medium bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                    <ExternalLink className="h-3 w-3" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
              Browse All Courses →
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-3 rounded-xl text-white">
            <h3 className="font-semibold text-lg mb-2">Propose New Vendor</h3>
            <p className="text-purple-100 text-sm mb-2">
              Need a specific training provider not listed here? Submit a request for approval.
            </p>
            <button className="px-4 py-2 bg-white text-purple-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
