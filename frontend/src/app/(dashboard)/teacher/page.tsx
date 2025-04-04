'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiClient } from '@/lib/api/client';
import { Users, BookOpen, Calendar, FileText, QrCode } from 'lucide-react';
import { QRCodeGenerator } from '@/components/shared/QRCodeGenerator';

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect if not teacher
  useEffect(() => {
    if (status === 'authenticated' && 
        session?.user?.role !== 'TEACHER' && 
        session?.user?.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [session, status, router]);
  
  // Fetch dashboard data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['teacher-dashboard-stats'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/dashboard/teacher/stats');
        return response.data;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          totalStudents: 0,
          totalCourses: 0,
          upcomingClasses: [],
          recentAssignments: [],
        };
      }
    },
    enabled: status === 'authenticated',
  });
  
  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="My Students" 
            value={stats?.totalStudents || 0} 
            icon={<Users className="h-8 w-8 text-blue-500" />} 
            description="Students in your courses"
          />
          <StatCard 
            title="My Courses" 
            value={stats?.totalCourses || 0} 
            icon={<BookOpen className="h-8 w-8 text-purple-500" />} 
            description="Courses you're teaching"
          />
          <StatCard 
            title="Today's Classes" 
            value={stats?.todayClasses || 0} 
            icon={<Calendar className="h-8 w-8 text-green-500" />} 
            description="Classes scheduled today"
          />
          <StatCard 
            title="Pending Assignments" 
            value={stats?.pendingAssignments || 0} 
            icon={<FileText className="h-8 w-8 text-yellow-500" />} 
            description="Assignments to grade"
          />
        </div>
        
        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Classes */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" /> Upcoming Classes
              </h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View Schedule
              </button>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-8">Loading...</div>
              ) : stats?.upcomingClasses?.length ? (
                <div className="space-y-4">
                  {stats.upcomingClasses.map((classItem: any) => (
                    <div 
                      key={classItem.id} 
                      className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{classItem.courseName}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(classItem.startTime).toLocaleTimeString()} - {new Date(classItem.endTime).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Room: {classItem.room}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Students: {classItem.studentCount}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No upcoming classes
                </div>
              )}
            </div>
          </div>
          
          {/* Attendance QR Code */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold flex items-center">
                <QrCode className="h-5 w-5 mr-2" /> Attendance QR Code
              </h2>
            </div>
            <div className="p-6">
              <QRCodeGenerator type="attendance" />
            </div>
          </div>
        </div>
        
        {/* Recent Assignments */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center">
              <FileText className="h-5 w-5 mr-2" /> Recent Assignments
            </h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View All Assignments
            </button>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">Loading...</div>
            ) : stats?.recentAssignments?.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assignment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submissions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {stats.recentAssignments.map((assignment: any) => (
                      <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{assignment.courseName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{assignment.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(assignment.dueDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{assignment.submissionCount}/{assignment.totalStudents}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${assignment.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                            {assignment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent assignments
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
}

function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        {icon}
      </div>
      <div className="flex flex-col">
        <p className="text-3xl font-bold">{value}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
} 