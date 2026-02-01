"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "react-toastify";

export default function CreateCourse() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isLoggedIn) {
      fetchUserRole();
    }
  }, [mounted, isLoggedIn]);

  const fetchUserRole = async () => {
    try {
      const response = await api.get("/dashboard");
      setUserRole(response.data.role);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user role:", err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a course title");
      return;
    }

    setCreating(true);
    try {
      const response = await api.post("/courses/create", {
        title: title.trim(),
        description: description.trim(),
      });

      toast.success("Course created successfully!");
      router.push(`/courses/${response.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error creating course");
    } finally {
      setCreating(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Create Course</h1>
          <p className="text-gray-600 mb-6 text-lg">
            Please login to create a course
          </p>
          <Link
            href="/auth/login"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (userRole !== "teacher") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6 text-lg">
            Only teachers can create courses
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link
          href="/dashboard"
          className="text-orange-600 hover:text-orange-700 font-semibold mb-6 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-orange-400">
          <h1 className="text-4xl font-bold mb-2 text-black">
            Create New Course
          </h1>
          <p className="text-gray-600 mb-8">
            Fill in the details below to create a new course
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-black font-semibold mb-2"
              >
                Course Title *
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter course title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-600 text-black"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-black font-semibold mb-2"
              >
                Course Description
              </label>
              <textarea
                id="description"
                placeholder="Enter course description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="5"
                className="w-full px-4 py-3 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-600 text-black"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400 border-2 border-orange-600"
              >
                {creating ? "Creating..." : "Create Course"}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition text-center border-2 border-gray-400"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
