import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Bell, LogOut, Menu, Moon, Sun, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { NotificationCenter } from '../shared/NotificationCenter';

export function Header() {
  const { data: session } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center md:hidden">
        <Button 
          variant="ghost" 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="hidden md:flex md:items-center md:gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Pharmacy Student Management System
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <NotificationCenter />

        <div className="relative">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2"
            aria-label="User menu"
          >
            <User className="h-5 w-5" />
            <span className="hidden md:inline">{session?.user?.name || 'User'}</span>
          </Button>
          
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden">
            <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              Profile
            </Link>
            <button 
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 