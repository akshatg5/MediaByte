"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  LogOutIcon,
  MenuIcon,
  LayoutDashboardIcon,
  Share2Icon,
  UploadIcon,
  Fullscreen,
  SquareMousePointer,
  VideoIcon,
  HomeIcon
} from "lucide-react";

const sidebarItems = [
  {
    href: "/home",
    icon: HomeIcon,
    label: "Home Page",
    description: "All services",
  },
  {
    href: "/videos",
    icon: VideoIcon,
    label: "Videos",
    description: "All Videos",
  },
  {
    href: "/cropper",
    icon: Share2Icon,
    label: "Cropper",
    description: "Customize your photos!",
  },
  {
    href: "/video",
    icon: UploadIcon,
    label: "Video Upload",
    description: "Upload videos,compress them!",
  },
  {
    href: "/generate-ui",
    icon: SquareMousePointer,
    label: "UI Generator(Beta)",
    description: "Enter prompt,generate UI!",
  }
];

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div
        className={`fixed inset-y-0 left-0 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-200 ease-in-out bg-white shadow-lg lg:translate-x-0 lg:static lg:shadow-none w-64 z-50`}
      >
        <div className="flex items-center justify-center py-4 border-b border-gray-200">
          <Fullscreen className="w-10 h-10 text-blue-600" />
          <p className="text-blue-600 font-bold text-2xl">MediaByte</p>
        </div>
        <ul className="flex flex-col p-4 space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-4 px-4 py-2 rounded-md transition-colors duration-200 ${
                  pathname === item.href
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-6 h-6" />
                <div className="flex flex-col">
                  <span>{item.label}</span>
                  <p className="text-xs">{item.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {user ? (
          <div className="p-4 mt-auto border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors duration-200"
            >
              <LogOutIcon className="mr-2 h-5 w-5" />
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Link
              href="/sign-in"
              className="mr-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="w-full bg-white shadow-md">
          <div className="flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
            <div className="flex items-center">
              <button
                className="lg:hidden text-gray-700 hover:text-gray-900"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <MenuIcon className="w-6 h-6" />
              </button>
              <Link href="/" onClick={handleLogoClick} className="ml-4">
                <div className="text-2xl font-bold text-blue-600 cursor-pointer">
                  {pathname.split("/").join("").toUpperCase()}
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={user.imageUrl}
                      alt={user.username || user.emailAddresses[0].emailAddress}
                    />
                  </div>
                  <span className="text-sm text-gray-700 truncate max-w-xs lg:max-w-md">
                    {user.username || user.emailAddresses[0].emailAddress}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-gray-900"
                  >
                    <LogOutIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-grow overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
