'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiClient } from '@/lib/api/client';
import { BookOpen, Calendar, FileText, GraduationCap, TrendingUp } from 'lucide-react';
import { QRCodeScanner } from '@/components/shared/QRCodeScanner';

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect if not student
  useEffect(() => {
    if (status === 'authenticated' && 
        session?.user?.role !== 'STUDENT' && 
        session?.user?.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [session, status, router]);
  
  // Fetch dashboard data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['student-dashboard-stats'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/dashboard/student/stats');
        return response.data;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          totalCourses: 0,
          completedCourses: 0,
          upcomingClasses: [],
          pendingAssignments: [],
          attendance: { present: 0, absent: 0, total: 0 }
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
  
  const attendancePercentage = stats?.attendance?.total 
    ? Math.round((stats.attendance.present / stats.attendance.total) * 100) 
    : 0;
  
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="My Courses" 
            value={stats?.totalCourses || 0} 
            icon={<BookOpen className="h-8 w-8 text-blue-500" />} 
            description="Currently enrolled courses"
          />
          <StatCard 
            title="Completed" 
            value={stats?.completedCourses || 0} 
            icon={<GraduationCap className="h-8 w-8 text-green-500" />} 
            description="Successfully completed courses"
          />
          <StatCard 
            title="Today's Classes" 
            value={stats?.todayClasses || 0} 
            icon={<Calendar className="h-8 w-8 text-purple-500" />} 
            description="Classes scheduled today"
          />
          <StatCard 
            title="Attendance" 
            value={attendancePercentage} 
            icon={<TrendingUp className="h-8 w-8 text-yellow-500" />} 
            description={`${stats?.attendance?.present || 0}/${stats?.attendance?.total || 0} classes attended`}
            suffix="%"
          />
        </div>
        
        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Classes */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" /> Today's Schedule
              </h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View Full Schedule
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
                      <p className="text-sm text-gray-600 dark:text-gray-300">Teacher: {classItem.teacherName}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No classes scheduled for today
                </div>
              )}
            </div>
          </div>
          
          {/* QR Code Scanner */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" /> Attendance Scanner
              </h2>
            </div>
            <div className="p-6">
              <QRCodeScanner onScan={(result) => {
                // Handle the scan result (e.g., mark attendance)
                console.log("QR Code scanned:", result);
              }} />
            </div>
          </div>
        </div>
        
        {/* Pending Assignments */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center">
              <FileText className="h-5 w-5 mr-2" /> Pending Assignments
            </h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              View All Assignments
            </button>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">Loading...</div>
            ) : stats?.pendingAssignments?.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assignment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {stats.pendingAssignments.map((assignment: any) => (
                      <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{assignment.courseName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{assignment.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={new Date(assignment.dueDate) < new Date() ? 'text-red-500' : ''}>
                            {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${assignment.status === 'PENDING' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>
                            {assignment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400">
                          <button className="hover:underline">Submit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No pending assignments
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
  suffix?: string;
}

function StatCard({ title, value, icon, description, suffix = '' }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        {icon}
      </div>
      <div className="flex flex-col">
        <p className="text-3xl font-bold">{value}{suffix}</p>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
} 