"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

function CoursesContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await api.get("/courses?skip=0&limit=100");
        const allCourses = response.data;

        if (query.trim()) {
          const filtered = allCourses.filter((course) => {
            const title = course.title || "";
            const description = course.description || "";
            const searchLower = query.toLowerCase();
            return (
              title.toLowerCase().includes(searchLower) ||
              description.toLowerCase().includes(searchLower)
            );
          });
          setCourses(filtered);
        } else {
          setCourses(allCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [query]);

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-black">Courses</h1>
          <Link href="/courses/create" className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded">
            + Create Course
          </Link>
        </div>
        {query && (
          <p className="text-gray-600 mb-6">
            Search results for: <span className="font-semibold">{query}</span>
          </p>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Loading courses...</p>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="bg-white border-2 border-orange-400 hover:shadow-xl hover:border-orange-500 transition-all duration-300 cursor-pointer h-full overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl truncate">
                        {course.title || "Course"}
                      </CardTitle>
                      <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {course.title
                            ? course.title.charAt(0).toUpperCase()
                            : "C"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="text-gray-600 text-sm line-clamp-3">
                      {course.description || "No description"}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Instructor
                        </p>
                        <p className="text-black font-semibold">
                          {course.instructor_id ? `ID: ${course.instructor_id}` : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-orange-600 font-semibold hover:text-orange-700">
                        View Course →
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-6">
              {query ? "No courses found" : "No courses available yet"}
            </p>
            <Link href="/courses/create" className="inline-block bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded">
              Create First Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-stone-50 py-8">Loading...</div>}
    >
      <CoursesContent />
    </Suspense>
  );
}
