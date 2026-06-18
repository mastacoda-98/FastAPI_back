"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { ChevronLeft, BookOpen, Users, FileText, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [owner, setOwner] = useState(false);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        const [courseResponse, userResponse] = await Promise.all([
          api.get(`/courses/${courseId}`),
          isLoggedIn ? api.get(`/auth/me`) : Promise.resolve(null),
        ]);
        setCourse(courseResponse.data);
        if (userResponse) {
          setCurrentUser(userResponse.data);
        }
        if (
          userResponse &&
          userResponse.data.role === "teacher" &&
          userResponse.data.id === courseResponse.data.user_id
        ) {
          setOwner(true);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching course detail:", err);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId, isLoggedIn]);

  const handleEnroll = async () => {
    if (!isLoggedIn || !currentUser) {
      router.push("/auth/login");
      return;
    }

    try {
      setEnrolling(true);
      await api.post(`/courses/course/${courseId}/request-enrollment`);
      alert("Enrollment request submitted successfully!");
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data);
    } catch (err) {
      console.error("Error enrolling in course:", err);
      alert(err.response?.data?.detail || "Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

  const handleDeleteCourse = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      const response = await api.delete(`/courses/${courseId}/delete`);

      if (response.data === true) {
        toast.success("Course deleted successfully!");
        router.push("/dashboard");
        return;
      }

      toast.error("Could not delete this course");
    } catch (err) {
      console.error("Error deleting course:", err);
      toast.error(err.response?.data?.detail || "Failed to delete course");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-8 pt-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-stone-50 py-8 pt-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-6">
              {error || "Course not found"}
            </p>
            <Link href="/courses">
              <Button>Back to Courses</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 pt-24">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-6 transition"
        >
          <ChevronLeft size={20} />
          Back to Courses
        </Link>

        {/* Course Header */}
        <Card className="bg-white border border-gray-200 overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-4xl mb-2">{course.title}</CardTitle>
                <p className="text-orange-100">
                  {course.creator?.profile_name ||
                    `Instructor ID: ${course.user_id}`}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                {owner && (
                  <button
                    type="button"
                    onClick={handleDeleteCourse}
                    disabled={deleting}
                    title="Delete course"
                    aria-label="Delete course"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-sm backdrop-blur-sm transition hover:border-white/60 hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/80 focus:ring-offset-2 focus:ring-offset-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2
                      size={18}
                      className={deleting ? "animate-pulse" : ""}
                    />
                    <span className="sr-only">
                      {deleting ? "Deleting course" : "Delete course"}
                    </span>
                  </button>
                )}
                <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {course.title.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-black mb-2">
                About this Course
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {course.description || "No description available"}
              </p>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={18} className="text-orange-600" />
                  <span className="text-sm text-gray-600">Students</span>
                </div>
                <p className="text-2xl font-bold text-black">
                  {course.total_students || 0}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen size={18} className="text-orange-600" />
                  <span className="text-sm text-gray-600">Sections</span>
                </div>
                <p className="text-2xl font-bold text-black">
                  {course.sections?.length || 0}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={18} className="text-orange-600" />
                  <span className="text-sm text-gray-600">Assignments</span>
                </div>
                <p className="text-2xl font-bold text-black">
                  {course.assignments?.length || 0}
                </p>
              </div>
            </div>

            {/* Enrollment Status & Action */}
            {currentUser && currentUser.id !== course.user_id ? (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between">
                <div>
                  {course.is_enrolled ? (
                    <div>
                      <p className="text-sm text-gray-600">You are enrolled</p>
                      <p className="text-green-600 font-semibold capitalize">
                        Status: {course.enrollment_status || "Active"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600">Not enrolled yet</p>
                  )}
                </div>
                {!course.is_enrolled && (
                  <Button onClick={handleEnroll} disabled={enrolling}>
                    {enrolling ? "Enrolling..." : "Request Enrollment"}
                  </Button>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Sections */}
        {course.sections && course.sections.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-black mb-4">
              Course Content
            </h2>
            <div className="space-y-4">
              {course.sections.map((section, idx) => (
                <Card
                  key={section.id}
                  className="bg-white border border-gray-200 hover:border-orange-400 hover:shadow-md transition"
                >
                  <CardHeader className="bg-gray-50 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
                        {idx + 1}
                      </div>
                      <CardTitle className="text-lg text-black">
                        {section.title}
                      </CardTitle>
                      <span className="ml-auto text-sm text-gray-600">
                        {section.contents?.length || 0} items
                      </span>
                    </div>
                  </CardHeader>
                  {section.contents && section.contents.length > 0 && (
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {section.contents.map((content) => (
                          <li
                            key={content.id}
                            className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition"
                          >
                            <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">
                                {content.title}
                              </p>
                              {content.description && (
                                <p className="text-sm text-gray-600">
                                  {content.description}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Assignments */}
        {course.assignments && course.assignments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-black mb-4">Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {course.assignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="bg-white border border-gray-200"
                >
                  <CardHeader className="border-b">
                    <CardTitle className="text-lg text-black">
                      {assignment.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    {assignment.description && (
                      <p className="text-gray-600 text-sm">
                        {assignment.description}
                      </p>
                    )}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Max Score: {assignment.max_score || "N/A"}</span>
                      {assignment.due_date && (
                        <span>
                          Due:{" "}
                          {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty States */}
        {(!course.sections || course.sections.length === 0) &&
          (!course.assignments || course.assignments.length === 0) && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600 text-lg">
                No content available yet for this course
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
