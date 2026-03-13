"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { GridSkeleton } from "@/components/ui/LoadingSkeleton";
import { CourseCard } from "@/components/CourseCard";
import { BookOpen } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-toastify";

export default function Dashboard() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});

  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardData();
    }
  }, [isLoggedIn]);

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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-50 py-8 px-4 pt-24">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
            <p className="text-gray-600 mb-6 text-lg">
              Please login to view your dashboard
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
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
          <GridSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (currentUser?.role === "student") {
    return (
      <div className="min-h-screen bg-stone-50 py-8 pt-24">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Student Dashboard</h1>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <div className="bg-orange-100 text-orange-700 font-semibold py-2 px-4 rounded-lg">
                {enrolledCourses.length} Enrolled
              </div>
            </div>

            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course, index) => (
                  <CourseCard
                    key={`enrolled-${course.course_id}-${index}`}
                    course={course}
                    variant="dashboard"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No courses yet"
                description="Start learning by browsing available courses"
                actionText="Browse Courses"
                actionHref="/courses"
                icon={BookOpen}
              />
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Pending Enrollments</h2>
              <div className="bg-yellow-100 text-yellow-700 font-semibold py-2 px-4 rounded-lg">
                {pendingEnrollments.length} Pending
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
              {pendingEnrollments.length > 0 ? (
                <div className="space-y-3">
                  {pendingEnrollments.map((enrollment, index) => (
                    <div
                      key={`pending-${enrollment.course_id}-${index}`}
                      className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 hover:border-yellow-400 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-lg text-black mb-1">
                            {enrollment.course_title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Requested on{" "}
                            {new Date(
                              enrollment.requested_at,
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-yellow-700 text-xs font-semibold mt-1">
                            Status: Awaiting Approval
                          </p>
                        </div>
                        <Link
                          href={`/courses/${enrollment.course_id}`}
                          className="text-orange-600 hover:text-orange-700 font-semibold transition"
                        >
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">
                  No pending enrollment requests. Keep learning!
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
      <div className="min-h-screen bg-stone-50 py-8 pt-24">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Teacher Dashboard</h1>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">My Courses</h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  {currentUser.courses_created?.length || 0} courses
                </div>
                <Link href="/courses/create">
                  <Button>+ Create Course</Button>
                </Link>
              </div>
            </div>

            {currentUser.courses_created &&
            currentUser.courses_created.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentUser.courses_created.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    variant="dashboard"
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No courses yet"
                description="Create your first course to get started"
                actionText="Create Course"
                actionHref="/courses/create"
                icon={BookOpen}
              />
            )}
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
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() =>
                            handleApproveEnrollment(request.enrollment_id)
                          }
                          disabled={approving[request.enrollment_id]}
                        >
                          {approving[request.enrollment_id]
                            ? "Processing..."
                            : "Approve"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleRejectEnrollment(request.enrollment_id)
                          }
                          disabled={approving[request.enrollment_id]}
                        >
                          {approving[request.enrollment_id]
                            ? "Processing..."
                            : "Reject"}
                        </Button>
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
