import { User } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: User & {
      id: string;
      role: string;
      accessToken: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    accessToken: string;
  }
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  status: 'READ' | 'UNREAD' | 'ARCHIVED';
  createdAt: string;
  userId: string;
}

export interface QRCode {
  id: string;
  data: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'USED' | 'ARCHIVED';
  expiresAt: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  createdAt: string;
  updatedAt: string;
} 