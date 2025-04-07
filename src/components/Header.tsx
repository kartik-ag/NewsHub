'use client';

import { Fragment, useMemo } from 'react';
import { useSignOut, useUserData } from '@nhost/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useDarkMode } from '@/context/DarkModeContext';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const user = useUserData();
  const { signOut } = useSignOut();
  const router = useRouter();
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useDarkMode();
  
  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    router.push('/auth/login');
  };

  const navigation = useMemo(() => [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      current: pathname === '/dashboard' || (pathname.startsWith('/dashboard/') && pathname !== '/dashboard/saved')
    },
    { 
      name: 'Saved Articles', 
      href: '/dashboard/saved', 
      current: pathname === '/dashboard/saved'
    },
  ], [pathname]);

  return (
    <Disclosure as="nav" className={darkMode ? "bg-gray-800" : "bg-indigo-600"}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link href="/" className="text-white font-bold text-xl">
                    NewsHub
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? darkMode ? 'bg-gray-900 text-white' : 'bg-indigo-700 text-white'
                            : 'text-white hover:bg-opacity-75',
                          'rounded-md px-3 py-2 text-sm font-medium'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  {/* Dark mode toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="ml-3 p-1 rounded-full text-white hover:bg-opacity-75"
                  >
                    {darkMode ? 
                      <SunIcon className="h-6 w-6" aria-hidden="true" /> : 
                      <MoonIcon className="h-6 w-6" aria-hidden="true" />
                    }
                  </button>
                
                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className={`flex max-w-xs items-center rounded-full ${darkMode ? 'bg-gray-700' : 'bg-indigo-800'} text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 ${darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-indigo-600'}`}>
                        <span className="sr-only">Open user menu</span>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-indigo-500'}`}>
                          {user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className={`absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/dashboard/profile"
                              className={classNames(
                                active ? (darkMode ? 'bg-gray-600' : 'bg-gray-100') : '',
                                `block px-4 py-2 text-sm ${darkMode ? 'text-white' : 'text-gray-700'}`
                              )}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              href="/dashboard/settings"
                              className={classNames(
                                active ? (darkMode ? 'bg-gray-600' : 'bg-gray-100') : '',
                                `block px-4 py-2 text-sm ${darkMode ? 'text-white' : 'text-gray-700'}`
                              )}
                            >
                              Settings
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={classNames(
                                active ? (darkMode ? 'bg-gray-600' : 'bg-gray-100') : '',
                                `block w-full text-left px-4 py-2 text-sm ${darkMode ? 'text-white' : 'text-gray-700'}`
                              )}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className={`inline-flex items-center justify-center rounded-md p-2 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-indigo-200 hover:bg-indigo-500'} hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white`}>
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? darkMode ? 'bg-gray-900 text-white' : 'bg-indigo-700 text-white'
                      : 'text-white hover:bg-opacity-75',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {/* Mobile dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center w-full rounded-md px-3 py-2 text-base font-medium text-white hover:bg-opacity-75"
              >
                {darkMode ? (
                  <>
                    <SunIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <MoonIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    Dark Mode
                  </>
                )}
              </button>
            </div>
            <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-indigo-700'} pb-3 pt-4`}>
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-600' : 'bg-indigo-500'} text-white`}>
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user?.displayName || 'User'}</div>
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-indigo-300'}`}>{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <Disclosure.Button
                  as={Link}
                  href="/dashboard/profile"
                  className={`block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-opacity-75 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-indigo-500'}`}
                >
                  Your Profile
                </Disclosure.Button>
                <Disclosure.Button
                  as={Link}
                  href="/dashboard/settings"
                  className={`block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-opacity-75 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-indigo-500'}`}
                >
                  Settings
                </Disclosure.Button>
                <Disclosure.Button
                  as="button"
                  onClick={handleSignOut}
                  className={`block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-opacity-75 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-indigo-500'} w-full text-left`}
                >
                  Sign out
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 