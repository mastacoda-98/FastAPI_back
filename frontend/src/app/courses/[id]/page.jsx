"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;
  const { isLoggedIn } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/courses/${courseId}`);
        setCourse(response.data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      if (isLoggedIn) {
        try {
          const response = await api.get("/auth/me");
          setCurrentUser(response.data);
        } catch (err) {
          console.error("Error fetching current user:", err);
        }
      }
    };

    if (courseId) {
      fetchCourse();
      fetchCurrentUser();
    }
  }, [courseId, isLoggedIn]);

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    try {
      setEnrolling(true);
      await api.post(`/courses/course/${courseId}/request-enrollment`);
      const response = await api.get(`/courses/${courseId}`);
      console.log("Course response after enrollment:", response.data);
      setCourse(response.data);
      alert("Enrollment request submitted successfully!");
    } catch (err) {
      console.error("Error enrolling:", err);
      console.error("Error response:", err.response?.data);
      alert(
        err.response?.data?.detail || "Failed to submit enrollment request",
      );
    } finally {
      setEnrolling(false);
    }
  };

  const getEnrollmentButton = () => {
    if (isLoggedIn && currentUser && currentUser.role === "teacher") {
      return null;
    }

    if (!isLoggedIn) {
      return (
        <button
          onClick={handleEnroll}
          className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-300"
        >
          Login to Enroll
        </button>
      );
    }

    if (course?.is_enrolled) {
      if (course?.enrollment_status === "approved") {
        return (
          <div className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white font-bold py-3 rounded-lg text-center">
            ✓ Approved
          </div>
        );
      } else if (course?.enrollment_status === "pending") {
        return (
          <div className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-bold py-3 rounded-lg text-center">
            ⏳ Pending Approval
          </div>
        );
      } else if (course?.enrollment_status === "rejected") {
        return (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="w-full bg-gradient-to-r from-red-400 to-red-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enrolling ? "Re-applying..." : "Re-apply"}
          </button>
        );
      }
    }

    return (
      <button
        onClick={handleEnroll}
        disabled={enrolling}
        className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {enrolling ? "Submitting..." : "Enroll Now"}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">{error || "Course not found"}</p>
            <Link
              href="/courses"
              className="text-orange-600 hover:text-orange-700"
            >
              Back to Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/courses"
          className="text-orange-600 hover:text-orange-700 mb-6 inline-block"
        >
          ← Back to Courses
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-orange-400">
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-8">
            <div className="flex justify-between items-start gap-6">
              <h1 className="text-4xl font-bold flex-1">{course.title}</h1>
              {course.creator && (
                <Link
                  href={`/profile/${course.creator.id}`}
                  className="hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center gap-3 bg-orange-300 bg-opacity-30 px-4 py-2 rounded-lg whitespace-nowrap">
                    <div className="w-10 h-10 rounded-full bg-white bg-opacity-30 flex items-center justify-center font-bold">
                      {course.creator.profile_name
                        ? course.creator.profile_name.charAt(0).toUpperCase()
                        : "T"}
                    </div>
                    <div>
                      <p className="text-xs opacity-75">Instructor</p>
                      <p className="font-semibold">
                        {course.creator.profile_name || course.creator.email}
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          </div>

          <div className="p-8 space-y-6">
            {course.description && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-2">
                  About this course
                </h2>
                <p className="text-gray-700">{course.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {course.enrolled_students_count || 0}
                </p>
                <p className="text-gray-600 text-sm">Students Enrolled</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {course.sections?.length || 0}
                </p>
                <p className="text-gray-600 text-sm">Sections</p>
              </div>
            </div>

            {course.sections && course.sections.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-4">
                  Course Content
                </h2>
                <div className="space-y-3">
                  {course.sections.map((section) => (
                    <div
                      key={section.id}
                      className="bg-stone-50 p-4 rounded-lg border border-gray-200"
                    >
                      <h3 className="font-semibold text-lg text-black mb-2">
                        {section.title}
                      </h3>
                      {section.contents && section.contents.length > 0 && (
                        <ul className="space-y-2 ml-4">
                          {section.contents.map((content) => (
                            <li
                              key={content.id}
                              className="text-gray-700 text-sm"
                            >
                              • {content.title}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {course.assignments && course.assignments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-black mb-4">
                  Assignments
                </h2>
                <div className="space-y-3">
                  {course.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-stone-50 p-4 rounded-lg border border-gray-200"
                    >
                      <h3 className="font-semibold text-black">
                        {assignment.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {assignment.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {getEnrollmentButton()}
          </div>
        </div>
      </div>
    </div>
  );
}
