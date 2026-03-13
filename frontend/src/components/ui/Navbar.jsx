"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center gap-6">
        <Link
          href="/"
          className="text-2xl font-bold hover:text-orange-100 active:scale-95 transition-all duration-200"
        >
          EduSphere
        </Link>

        <SearchBar />

        <div className="space-x-2 flex items-center">
          {mounted ? (
            isLoggedIn ? (
              <button
                onClick={() => {
                  logout();
                  router.push("/auth/login");
                }}
                className="hover:bg-orange-400 px-4 py-2 rounded-lg inline-block font-semibold transition-all duration-200 active:scale-95"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="hover:bg-orange-400 px-4 py-2 rounded-lg inline-block font-semibold transition-all duration-200 active:scale-95"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="hover:bg-orange-400 px-4 py-2 rounded-lg inline-block font-semibold transition-all duration-200 active:scale-95"
                >
                  Sign Up
                </Link>
              </>
            )
          ) : (
            <div className="w-20 h-8 bg-orange-400 rounded-lg animate-pulse" />
          )}
        </div>
      </div>
    </nav>
  );
}
