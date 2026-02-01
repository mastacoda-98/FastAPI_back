"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await api.get("/courses");
        const allCourses = response.data;

        if (query.trim()) {
          const lowerQuery = query.toLowerCase();
          const filtered = allCourses.filter((course) =>
            course.title.toLowerCase().includes(lowerQuery),
          );
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
        <h1 className="text-4xl font-bold text-black mb-2">Courses</h1>
        {query && (
          <p className="text-gray-600 mb-6">
            Search results for: <span className="font-semibold">{query}</span>
          </p>
        )}

        {loading ? (
          <p className="text-center text-gray-600 py-12">Loading courses...</p>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="bg-white border-2 border-orange-400 hover:shadow-xl hover:border-orange-500 transition-all duration-300 cursor-pointer h-full overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg truncate">
                        {course.title}
                      </CardTitle>
                      <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {course.creator?.profile_name
                            ? course.creator.profile_name
                                .charAt(0)
                                .toUpperCase()
                            : "T"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6 space-y-4">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {course.description || "No description available"}
                    </p>

                    {course.creator && (
                      <div className="flex items-center gap-3 pt-2">
                        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                        <div className="text-sm">
                          <p className="text-gray-500 text-xs">Instructor</p>
                          <p className="text-gray-900 font-medium truncate">
                            {course.creator.profile_name || "Unknown"}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold text-orange-600">
                          {course.enrolled_students_count || 0}
                        </span>{" "}
                        students enrolled
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">
              {query
                ? "No courses found matching your search"
                : "No courses available yet"}
            </p>
            {query && (
              <p className="text-sm text-gray-500">
                Try searching with different keywords
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
