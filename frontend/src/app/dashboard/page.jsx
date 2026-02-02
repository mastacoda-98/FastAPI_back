"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "react-toastify";

export default function Dashboard() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isLoggedIn) {
      fetchDashboardData();
    }
  }, [mounted, isLoggedIn]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard");
      setCurrentUser(response.data);

      setEnrolledCourses(response.data.enrolled_courses || []);
      setPendingEnrollments(response.data.pending_requests || []);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      toast.error(err.response?.data?.detail || "Failed to load dashboard");
      // If 401, redirect to login
      if (err.response?.status === 401) {
        setTimeout(() => router.push("/auth/login"), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEnrollment = async (enrollmentId) => {
    setApproving((prev) => ({ ...prev, [enrollmentId]: true }));
    try {
      await api.patch(`/courses/enrollment/${enrollmentId}/approve`, {
        approved: true,
      });
      toast.success("Enrollment approved!");
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error approving enrollment");
    } finally {
      setApproving((prev) => ({ ...prev, [enrollmentId]: false }));
    }
  };

  const handleRejectEnrollment = async (enrollmentId) => {
    setApproving((prev) => ({ ...prev, [enrollmentId]: true }));
    try {
      await api.patch(`/courses/enrollment/${enrollmentId}/approve`, {
        approved: false,
        rejected_reason: "Rejected by teacher",
      });
      toast.success("Enrollment rejected!");
      fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error rejecting enrollment");
    } finally {
      setApproving((prev) => ({ ...prev, [enrollmentId]: false }));
    }
  };

  if (!mounted) {
    return null;
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
          <p className="text-gray-600 mb-6 text-lg">
            Please login to view your dashboard
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
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-center text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (currentUser?.role === "student") {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Student Dashboard</h1>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <div className="bg-orange-100 text-orange-700 font-semibold py-2 px-4 rounded-lg">
                {enrolledCourses.length} Enrolled
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.course_id}`}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition border-2 border-gray-200 p-4"
                  >
                    <h3 className="font-bold text-lg text-black mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {course.description}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-lg p-8 text-center text-gray-600">
                  <p>You havent enrolled in any courses yet</p>
                  <Link
                    href="/courses"
                    className="text-orange-600 hover:text-orange-700 font-semibold mt-2 inline-block"
                  >
                    Browse Courses →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Pending Enrollments</h2>
              <div className="bg-yellow-100 text-yellow-700 font-semibold py-2 px-4 rounded-lg">
                {pendingEnrollments.length} Pending
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-8">
              {pendingEnrollments.length > 0 ? (
                <div className="space-y-3">
                  {pendingEnrollments.map((enrollment) => (
                    <Link
                      key={enrollment.course_id}
                      href={`/courses/${enrollment.course_id}`}
                      className="block bg-stone-50 rounded-lg hover:bg-stone-100 transition border-2 border-yellow-200 p-4"
                    >
                      <h3 className="font-bold text-lg text-black mb-1">
                        {enrollment.course_title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Requested on{" "}
                        {new Date(enrollment.requested_at).toLocaleDateString()}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center">
                  No pending enrollment requests
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser?.role === "teacher") {
    return (
      <div className="min-h-screen bg-stone-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Teacher Dashboard</h1>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg">
                  {currentUser.courses_created?.length || 0} Created
                </div>
                <Link
                  href="/courses/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  + Create Course
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentUser.courses_created &&
              currentUser.courses_created.length > 0 ? (
                currentUser.courses_created.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.id}`}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition border-2 border-blue-200 p-4"
                  >
                    <h3 className="font-bold text-lg text-black mb-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {course.description}
                    </p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{course.total_students || 0} Students</span>
                      <span>{course.sections_count || 0} Sections</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-lg p-8 text-center text-gray-600">
                  <p>You havent created any courses yet</p>
                  <Link
                    href="/courses/create"
                    className="text-blue-600 hover:text-blue-700 font-semibold mt-2 inline-block"
                  >
                    Create New Course →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                Pending Enrollment Requests
              </h2>
              <div className="bg-orange-100 text-orange-700 font-semibold py-2 px-4 rounded-lg">
                {currentUser.total_pending_requests || 0} Pending
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-8">
              {currentUser.pending_enrollments &&
              currentUser.pending_enrollments.length > 0 ? (
                <div className="space-y-3">
                  {currentUser.pending_enrollments.map((request) => (
                    <div
                      key={request.enrollment_id}
                      className="flex items-center justify-between bg-stone-50 rounded-lg border-2 border-orange-200 p-4"
                    >
                      <div>
                        <Link
                          href={`/profile/${request.student_id}`}
                          className="font-bold text-blue-600 hover:text-blue-700 hover:underline mb-1 inline-block"
                        >
                          {request.student_name}
                        </Link>
                        <p className="text-gray-600 text-sm">
                          Requested for: {request.course_title}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(request.requested_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleApproveEnrollment(request.enrollment_id)
                          }
                          disabled={approving[request.enrollment_id]}
                          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition disabled:bg-gray-400"
                        >
                          {approving[request.enrollment_id]
                            ? "Processing..."
                            : "Approve"}
                        </button>
                        <button
                          onClick={() =>
                            handleRejectEnrollment(request.enrollment_id)
                          }
                          disabled={approving[request.enrollment_id]}
                          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition disabled:bg-gray-400"
                        >
                          {approving[request.enrollment_id]
                            ? "Processing..."
                            : "Reject"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center">
                  No pending enrollment requests
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="flex justify-between items-center p-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
      </div>
    </div>
  );
}
