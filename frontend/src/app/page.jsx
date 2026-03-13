"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import "./globals.css";

export default function Home() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard");
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-8 px-4 pt-32">
      <div className="flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-6">
            EduSphere
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-md mx-auto leading-relaxed">
            A modern learning management system for students and teachers
          </p>
          <p className="text-gray-600 text-sm md:text-base mb-12 max-w-md mx-auto">
            Connect, learn, and grow in an efficient educational environment
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg active:scale-95 transition-all duration-200 transform hover:-translate-y-1"
            >
              Login
            </Link>

            <Link
              href="/auth/signup"
              className="px-8 py-3.5 bg-white text-orange-600 font-semibold rounded-lg border-2 border-orange-500 hover:bg-orange-50 active:scale-95 transition-all duration-200 transform hover:-translate-y-1"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
