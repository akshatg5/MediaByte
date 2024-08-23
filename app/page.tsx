"use client";
import { Fullscreen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex bg-gradient-to-b from-white to-blue-50 min-h-screen flex-col items-center justify-between px-8 pt-5">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full flex justify-between items-center mb-5"
      >
        <div className="flex items-center">
          <div className="flex items-center justify-center border-gray-200">
            <Fullscreen className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold ml-2 text-blue-600">MediaByte</h1>
        </div>
        <div className="max-sm:flex max-sm:flex-col max-sm:mr-5">
          <Link
            href="/sign-in"
            className="mr-4 max-sm:mr-0 px-4 py-2 max-sm:my-1 max-sm:text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 max-sm:my-1 max-sm:text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-300 shadow-md hover:shadow-lg"
          >
            Sign Up
          </Link>
        </div>
      </motion.header>
      <hr className="border border-slate-300 my-2 w-full shadow-sm"></hr>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-center items-center mt-4 space-y-8 md:space-y-0 md:space-x-12"
      >
        <div className="flex flex-col justify-center items-center text-center">
          <h1 className="text-5xl font-bold text-blue-600 mb-4">MediaByte</h1>
          <h2 className="text-2xl font-bold mb-6 text-blue-800">
            Changing the way you deal with media
          </h2>
          <Link href={"/home"}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-blue-600 text-white rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg"
            >
              Get Started
            </motion.button>
          </Link>
        </div>
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Image
              src="/media-management.jpg"
              alt="Media Management"
              width={500}
              height={300}
              className="rounded-lg shadow-2xl"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-lg"
          >
            <p className="text-lg mb-2 text-blue-600 font-semibold">
              Powered by
            </p>
            <Image
              src="/cloudinary-logo.png"
              alt="Cloudinary Logo"
              width={150}
              height={50}
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full border-t border-gray-300 pt-8 mt-16 bg-white shadow-md"
      >
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-4">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="flex items-center justify-center py-4">
              <Fullscreen className="w-8 h-8 text-blue-600" />
              <p className="text-blue-600 font-bold text-xl ml-2">MediaByte</p>
            </div>
          </div>
          <div className="flex space-x-6">
            {["GitHub", "LinkedIn", "Other Projects","GitHub Repo"].map((item, index) => (
              <motion.a
                key={index}
                href={
                  [
                    "https://github.com/akshatg5",
                    "https://www.linkedin.com/in/akshat-girdhar-56a848206/",
                    "https://akshatgirdhar-portfolio.vercel.app/",
                    "https://github.com/akshatg5/MediaByte"
                  ][index]
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {item}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.footer>
    </main>
  );
}
