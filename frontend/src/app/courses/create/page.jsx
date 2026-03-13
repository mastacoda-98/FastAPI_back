"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
      <div className="min-h-screen bg-stone-50 py-8 px-4 pt-24">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Create Course</h1>
            <p className="text-gray-600 mb-6 text-lg">
              Please login to create a course
            </p>
            <Link href="/auth/login">
              <Button size="lg">Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-8 pt-24">
        <div className="max-w-2xl mx-auto px-4">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (userRole !== "teacher") {
    return (
      <div className="min-h-screen bg-stone-50 py-8 px-4 pt-24">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6 text-lg">
              Only teachers can create courses
            </p>
            <Link href="/dashboard">
              <Button size="lg">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 pt-24">
      <div className="max-w-2xl mx-auto px-4">
        <Link
          href="/dashboard"
          className="text-orange-600 hover:text-orange-700 font-semibold mb-6 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <h1 className="text-4xl font-bold mb-2 text-black">
            Create New Course
          </h1>
          <p className="text-gray-600 mb-8">
            Fill in the details below to create a new course
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="title"
              type="text"
              label="Course Title *"
              placeholder="Enter course title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Course Description
              </label>
              <textarea
                id="description"
                placeholder="Enter course description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={creating} className="flex-1">
                {creating ? "Creating..." : "Create Course"}
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button variant="secondary" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
