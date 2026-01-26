"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/user/${userId}`);
        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-8 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading profile...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              {error || "Profile not found"}
            </p>
            <Link
              href="/users"
              className="text-orange-600 font-semibold hover:underline"
            >
              ← Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const initials = user.profile_name
    ? user.profile_name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U";

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <Link
          href="/users"
          className="text-orange-600 font-semibold hover:text-orange-700 mb-8 inline-flex items-center gap-2 transition"
        >
          ← Back to Users
        </Link>

        {/* Header Card */}
        <Card className="bg-white border-0 shadow-2xl mb-8 overflow-hidden rounded-2xl">
          <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white py-12 px-8">
            <div className="flex items-end gap-8">
              <div className="w-28 h-28 rounded-full bg-white bg-opacity-25 flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-6xl font-bold">{initials}</span>
              </div>
              <div className="flex-1">
                <h1 className="text-5xl font-bold mb-2">{user.profile_name}</h1>
                <p className="text-orange-100 text-lg">
                  {user.role === "teacher" ? "👨‍🏫 Instructor" : "👨‍🎓 Student"}
                </p>
              </div>
            </div>
          </div>

          <CardContent className="pt-8">
            <div className="grid grid-cols-3 gap-6">
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                  Member Since
                </p>
                <p className="text-lg font-semibold text-black mt-2">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                  Role
                </p>
                <p className="text-lg font-semibold text-black mt-2 capitalize">
                  {user.role === "teacher" ? "Instructor" : "Learner"}
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                  Status
                </p>
                <p className="text-lg font-semibold text-black mt-2">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio Card */}
        <Card className="bg-white border-0 shadow-lg mb-8 rounded-2xl">
          <CardHeader className="pb-3 border-b-2 border-stone-100">
            <CardTitle className="text-orange-600 text-xl">About</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-black leading-relaxed text-lg">
              {user.bio || "No bio added yet"}
            </p>
          </CardContent>
        </Card>

        {/* Student Stats Card */}
        {user.role === "student" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg rounded-2xl">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 uppercase tracking-widest font-bold">
                      Enrolled Courses
                    </p>
                    <p className="text-5xl font-bold text-blue-700 mt-3">
                      {user.total_courses_enrolled || 0}
                    </p>
                  </div>
                  <div className="text-6xl opacity-20">📚</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg rounded-2xl">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 uppercase tracking-widest font-bold">
                      Completed Courses
                    </p>
                    <p className="text-5xl font-bold text-purple-700 mt-3">
                      {user.total_courses_completed || 0}
                    </p>
                  </div>
                  <div className="text-6xl opacity-20">✓</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Teacher Stats Card */}
        {user.role === "teacher" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-0 shadow-lg rounded-2xl">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 uppercase tracking-widest font-bold">
                      Courses Created
                    </p>
                    <p className="text-5xl font-bold text-amber-700 mt-3">
                      {user.courses_created?.length || 0}
                    </p>
                  </div>
                  <div className="text-6xl opacity-20">🎓</div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-0 shadow-lg rounded-2xl">
              <CardContent className="pt-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-pink-600 uppercase tracking-widest font-bold">
                      Total Students
                    </p>
                    <p className="text-5xl font-bold text-pink-700 mt-3">
                      {user.total_students_enrolled || 0}
                    </p>
                  </div>
                  <div className="text-6xl opacity-20">👥</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enrolled Courses for Students */}
        {user.role === "student" &&
          user.enrolled_courses &&
          user.enrolled_courses.length > 0 && (
            <Card className="bg-white border-0 shadow-lg rounded-2xl">
              <CardHeader className="pb-3 border-b-2 border-stone-100">
                <CardTitle className="text-orange-600 text-xl">
                  📖 Enrolled Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {user.enrolled_courses.map((course) => (
                    <div
                      key={course.course_id}
                      className="p-5 border-2 border-stone-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-black text-lg">
                            {course.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Instructor:{" "}
                            <span className="font-semibold">
                              {course.teacher_name}
                            </span>
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-600">
                              Progress
                            </span>
                            <span className="text-xs font-bold text-orange-600">
                              {course.completion_percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all"
                              style={{
                                width: `${course.completion_percentage}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Created Courses for Teachers */}
        {user.role === "teacher" &&
          user.courses_created &&
          user.courses_created.length > 0 && (
            <Card className="bg-white border-0 shadow-lg rounded-2xl">
              <CardHeader className="pb-3 border-b-2 border-stone-100">
                <CardTitle className="text-orange-600 text-xl">
                  🎯 Courses Created
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {user.courses_created.map((course) => (
                    <div
                      key={course.id}
                      className="p-5 border-2 border-stone-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition duration-300"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-black text-lg">
                            {course.title}
                          </h3>
                        </div>
                        {course.pending_requests > 0 && (
                          <span className="bg-orange-200 text-orange-800 px-4 py-1 rounded-full text-sm font-bold">
                            {course.pending_requests} pending
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-3 pt-3 border-t border-stone-200">
                        <span className="text-sm text-gray-600">
                          <span className="font-bold text-black">
                            {course.total_students}
                          </span>{" "}
                          Students Enrolled
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
