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
    <nav className="fixed top-0 left-0 right-0 bg-orange-400 text-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-6">
        <Link
          href="/"
          className="text-2xl font-bold hover:text-stone-50 transition"
        >
          EduSphere
        </Link>

        <SearchBar />

        <div className="space-x-3">
          {mounted && isLoggedIn ? (
            <button
              onClick={() => {
                logout();
                router.push("/auth/login");
              }}
              className="hover:bg-orange-500 px-4 py-2 rounded-lg inline-block font-semibold transition duration-200"
            >
              Sign Out
            </button>
          ) : mounted ? (
            <>
              <Link
                href="/auth/login"
                className="hover:bg-orange-500 px-4 py-2 rounded-lg inline-block font-semibold transition duration-200"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="hover:bg-orange-500 px-4 py-2 rounded-lg inline-block font-semibold transition duration-200"
              >
                Sign Up
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
