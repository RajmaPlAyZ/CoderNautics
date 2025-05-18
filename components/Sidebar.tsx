"use client";
import {
    ChevronLeft,
    ChevronRight,
    Home,
    LogIn,
    LogOut,
    Shield,
    User,
    UserPlus,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './AuthProvider';

const menuItems = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
    show: () => true,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
    show: (user: any) => !!user,
  },
  {
    label: 'Admin Panel',
    href: '/admin',
    icon: Shield,
    show: (user: any, isAdmin: boolean) => isAdmin,
  },
];

function Tooltip({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="group relative flex items-center">
      {children}
      <span className="pointer-events-none absolute left-full ml-2 z-10 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {label}
      </span>
    </div>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.email === 'admin@example.com'; // Replace with your admin logic
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-gradient-to-b from-white via-gray-50 to-gray-100 border-r shadow-xl z-40 transition-all duration-200 flex flex-col ${collapsed ? 'w-20' : 'w-64'} rounded-r-3xl`}
      style={{ minHeight: '100vh' }}
    >
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 bg-white rounded-tr-3xl">
        <Link href="/" className="flex items-center gap-2 select-none">
          <span className="text-2xl font-extrabold tracking-tight font-sans">
            <span className="text-black">c</span>
            <span className="text-blue-600">odeQ</span>
            <span className="text-red-600">&amp;A</span>
          </span>
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-2 p-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-blue-100 border border-gray-200 transition-colors duration-150 shadow-sm text-blue-600 text-xl"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="w-7 h-7" /> : <ChevronLeft className="w-7 h-7" />}
        </button>
      </div>
      <div className="my-2 border-b border-gray-100 mx-4" />
      {/* Menu */}
      <nav className="flex-1 flex flex-col gap-1 mt-2">
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              item.show(user, isAdmin) && (
                <Tooltip key={item.href} label={collapsed ? item.label : ''}>
                  <Link
                    href={item.href}
                    className={`group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} py-3 px-2 mx-2 my-1 rounded-xl font-semibold transition-all duration-150 text-base ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 shadow font-bold'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <Icon className={`transition-all duration-200 ${collapsed ? 'w-7 h-7' : 'w-5 h-5'} ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </Tooltip>
              )
            );
          })}
        </div>
        <div className="flex-1" />
        <div className="flex flex-col gap-1 mb-2">
          {!user ? (
            <>
              <Tooltip label={collapsed ? 'Login' : ''}>
                <Link
                  href="/login"
                  className={`group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} py-3 px-2 mx-2 my-1 rounded-xl font-semibold transition-all duration-150 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600`}
                >
                  <LogIn className={`transition-all duration-200 ${collapsed ? 'w-7 h-7' : 'w-5 h-5'} text-gray-400 group-hover:text-blue-500`} />
                  {!collapsed && <span>Login</span>}
                </Link>
              </Tooltip>
              <Tooltip label={collapsed ? 'Sign Up' : ''}>
                <Link
                  href="/signup"
                  className={`group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} py-3 px-2 mx-2 my-1 rounded-xl font-semibold transition-all duration-150 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600`}
                >
                  <UserPlus className={`transition-all duration-200 ${collapsed ? 'w-7 h-7' : 'w-5 h-5'} text-gray-400 group-hover:text-blue-500`} />
                  {!collapsed && <span>Sign Up</span>}
                </Link>
              </Tooltip>
            </>
          ) : (
            <Tooltip label={collapsed ? 'Logout' : ''}>
              <button
                onClick={logout}
                className={`group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} py-3 px-2 mx-2 my-1 rounded-xl font-semibold transition-all duration-150 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600 text-left`}
              >
                <LogOut className={`transition-all duration-200 ${collapsed ? 'w-7 h-7' : 'w-5 h-5'} text-gray-400 group-hover:text-blue-500`} />
                {!collapsed && <span>Logout</span>}
              </button>
            </Tooltip>
          )}
        </div>
      </nav>
      <div className="my-2 border-t border-gray-100 mx-4" />
      {/* User avatar at the bottom */}
      {user && (
        <div className="flex items-center gap-2 p-4">
          <div className={`flex items-center justify-center ${collapsed ? 'w-12 h-12 text-xl' : 'w-14 h-14 text-2xl'} rounded-full bg-gradient-to-br from-blue-200 to-blue-400 text-blue-900 font-extrabold shadow transition-all duration-200`}>
            {user.email?.[0]?.toUpperCase()}
          </div>
          {!collapsed && <div className="text-sm text-gray-700 truncate font-semibold ml-2">{user.email}</div>}
        </div>
      )}
    </aside>
  );
} 