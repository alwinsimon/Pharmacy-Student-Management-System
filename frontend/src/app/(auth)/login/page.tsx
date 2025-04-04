'use client';

import { LoginForm } from '@/components/forms/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Left side - Branding/Image */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-blue-600 text-white hidden md:flex">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            Pharmacy Student Management System
          </h1>
          <p className="text-xl mb-8">
            Streamlining the management of pharmacy education
          </p>
          <div className="relative w-full h-80">
            {/* You can add an image here */}
            <div className="absolute inset-0 bg-white/20 rounded-lg" />
          </div>
        </div>
      </div>
      
      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 md:hidden">
            <h1 className="text-2xl font-bold">
              Pharmacy Student Management System
            </h1>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
} 