import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { BarChart, BookOpen, Calendar, Users, Settings, FileText, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: BarChart },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/qrcodes', label: 'QR Codes', icon: QrCode },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const teacherLinks = [
  { href: '/teacher', label: 'Dashboard', icon: BarChart },
  { href: '/teacher/students', label: 'Students', icon: Users },
  { href: '/teacher/courses', label: 'Courses', icon: BookOpen },
  { href: '/teacher/assignments', label: 'Assignments', icon: FileText },
  { href: '/teacher/schedule', label: 'Schedule', icon: Calendar },
];

const studentLinks = [
  { href: '/student', label: 'Dashboard', icon: BarChart },
  { href: '/student/courses', label: 'My Courses', icon: BookOpen },
  { href: '/student/assignments', label: 'Assignments', icon: FileText },
  { href: '/student/schedule', label: 'Schedule', icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const userRole = session?.user?.role || 'STUDENT';
  
  let links = studentLinks;
  if (userRole === 'ADMIN') {
    links = adminLinks;
  } else if (userRole === 'TEACHER') {
    links = teacherLinks;
  }

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white py-6 px-4 overflow-y-auto hidden md:block">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-center">PSMS</h2>
      </div>
      
      <nav className="space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm rounded-lg transition-colors',
                isActive 
                  ? 'bg-blue-700 text-white' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <link.icon className="h-5 w-5 mr-3" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-4 left-0 w-full px-4">
        <div className="border-t border-gray-700 pt-4 mt-4 text-xs text-gray-500 text-center">
          <p>{new Date().getFullYear()} © PSMS</p>
        </div>
      </div>
    </div>
  );
} 