'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiClient } from '@/lib/api/client';
import { BarChart2, Users, BookOpen, Bell, QrCode } from 'lucide-react';
import { QRCodeGenerator } from '@/components/shared/QRCodeGenerator';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect if not admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [session, status, router]);
  
  // Fetch dashboard data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/dashboard/admin/stats');
        return response.data;
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          totalUsers: 0,
          totalStudents: 0,
          totalTeachers: 0,
          totalCourses: 0,
          recentNotifications: [],
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
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Users" 
            value={stats?.totalUsers || 0} 
            icon={<Users className="h-8 w-8 text-blue-500" />} 
            description="Registered users in the system"
          />
          <StatCard 
            title="Students" 
            value={stats?.totalStudents || 0} 
            icon={<Users className="h-8 w-8 text-green-500" />} 
            description="Currently enrolled students"
          />
          <StatCard 
            title="Teachers" 
            value={stats?.totalTeachers || 0} 
            icon={<Users className="h-8 w-8 text-purple-500" />} 
            description="Active teaching staff"
          />
          <StatCard 
            title="Courses" 
            value={stats?.totalCourses || 0} 
            icon={<BookOpen className="h-8 w-8 text-yellow-500" />} 
            description="Available courses"
          />
        </div>
        
        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Notifications */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold flex items-center">
                <Bell className="h-5 w-5 mr-2" /> Recent Notifications
              </h2>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View All
              </button>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-8">Loading...</div>
              ) : stats?.recentNotifications?.length ? (
                <div className="space-y-4">
                  {stats.recentNotifications.map((notification: any) => (
                    <div 
                      key={notification.id} 
                      className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{notification.title}</h3>
                        <span className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No recent notifications
                </div>
              )}
            </div>
          </div>
          
          {/* QR Code Generator */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold flex items-center">
                <QrCode className="h-5 w-5 mr-2" /> QR Code
              </h2>
            </div>
            <div className="p-6">
              <QRCodeGenerator />
            </div>
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