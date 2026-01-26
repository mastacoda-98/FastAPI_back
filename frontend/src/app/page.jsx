import Link from "next/link";
import "./globals.css";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl text-orange-600 mb-4">EduSphere</h1>
        <p className="text-xl text-gray-600 mb-12 max-w-md mx-auto">
          A modern learning management system for students and teachers
        </p>

        <div className="flex gap-6 justify-center">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-orange-400 text-white font-bold rounded-lg hover:bg-orange-500 transition block"
          >
            Login
          </Link>

          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-orange-200 text-orange-700 font-bold rounded-lg hover:bg-orange-300 transition border-2 border-orange-400 block"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
