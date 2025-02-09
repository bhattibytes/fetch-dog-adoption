import React from 'react';
import Image from 'next/image';
import { NavBar } from './NavBar';
import logo from '../assets/fetch.png';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-white shadow">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={logo}
                alt="Fetch Dog Adoption"
                width={150}
                height={50}
                className="object-contain"
                unoptimized
              />
              <div className="h-6 w-px bg-gray-200 mx-2" /> {/* Vertical divider */}
              <h1 className="text-xl font-semibold text-gray-900">Dog Adoption Services</h1>
            </div>
          </nav>
        </header>
        <NavBar />
        {title && (
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        <main className="space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}; 