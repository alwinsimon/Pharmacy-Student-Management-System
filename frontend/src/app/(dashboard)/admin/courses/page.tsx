'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CourseManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('all');
  
  // Fetch courses list
  const { data: courses = [], isLoading, refetch } = useQuery({
    queryKey: ['courses', searchTerm, status],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (status !== 'all') params.append('status', status);
        
        const response = await apiClient.get(`/courses?${params.toString()}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching courses:', error);
        return [];
      }
    },
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };
  
  const handleStatusChange = async (courseId: string, active: boolean) => {
    try {
      await apiClient.patch(`/courses/${courseId}`, { active });
      toast.success(`Course ${active ? 'activated' : 'deactivated'} successfully`);
      refetch();
    } catch (error) {
      console.error('Error updating course status:', error);
      toast.error('Failed to update course status');
    }
  };
  
  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        await apiClient.delete(`/courses/${courseId}`);
        toast.success('Course deleted successfully');
        refetch();
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      }
    }
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Course Management</h1>
          <Link href="/admin/courses/create">
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Course
            </Button>
          </Link>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses by name or code..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="w-full md:w-48">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <Button type="submit" variant="primary">
              Search
            </Button>
          </form>
        </div>
        
        {/* Courses Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Credits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instructor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">Loading courses...</td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">No courses found</td>
                  </tr>
                ) : (
                  courses.map((course: any) => (
                    <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">{course.name}</div>
                            <div className="text-sm text-gray-500">{course.description?.substring(0, 30)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{course.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{course.credits}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{course.instructor?.name || 'Unassigned'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${course.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : course.status === 'upcoming'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                              : course.status === 'completed'
                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <Link href={`/admin/courses/${course.id}`} className="text-blue-600 hover:text-blue-900">
                          <span className="sr-only">Edit</span>
                          <Edit className="h-5 w-5 inline" />
                        </Link>
                        
                        <button 
                          onClick={() => handleStatusChange(course.id, course.status === 'active' ? false : true)} 
                          className={course.status === 'active' ? "text-orange-600 hover:text-orange-900" : "text-green-600 hover:text-green-900"}
                        >
                          <span className="sr-only">{course.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                          <Clock className="h-5 w-5 inline" />
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteCourse(course.id)} 
                          className="text-red-600 hover:text-red-900"
                        >
                          <span className="sr-only">Delete</span>
                          <Trash className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 