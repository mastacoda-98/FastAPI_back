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
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await api.get("/courses");
        setCourses(response.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredCourses(courses);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = courses.filter(
        (course) =>
          course.title.toLowerCase().includes(lowerQuery) ||
          (course.description && course.description.toLowerCase().includes(lowerQuery)) ||
          (course.creator?.profile_name && course.creator.profile_name.toLowerCase().includes(lowerQuery))
      );
      setFilteredCourses(filtered);
    }
  }, [query, courses]);

  const getTeacherInitials = (name) => {
    if (!name) return "T";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-black mb-2">Courses</h1>
        {query && (
          <p className="text-gray-600 mb-6">
            Search results for: <span className="font-semibold">"{query}"</span>
          </p>
        )}

        {loading ? (
          <p className="text-center text-gray-600 py-12">Loading courses...</p>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`}>
                <Card className="bg-white border-2 border-orange-400 hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col">
                  <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white pb-4">
                    <CardTitle className="text-lg line-clamp-2">
                      {course.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-between py-4">
                    <div>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                        {course.description || "No description available"}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {course.creator && (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white font-semibold text-sm flex-shrink-0">
                            {getTeacherInitials(course.creator.profile_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-500">Instructor</p>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {course.creator.profile_name || "Unknown"}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between text-xs text-gray-600 pt-2 border-t border-gray-200">
                        <span>
                          <span className="font-semibold text-orange-600">
                            {course.enrolled_students_count || 0}
                          </span>{" "}
                          student{course.enrolled_students_count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-2">
              {query ? "No courses found matching your search" : "No courses available yet"}
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
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-black mb-3 text-sm">
                      {course.description}
                    </p>
                    <p className="text-black mb-2">
                      <span className="font-semibold">Instructor:</span>{" "}
                      {course.creator_name}
                    </p>
                    <p className="text-orange-600 font-semibold">
                      View Details →
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {query ? "No courses found" : "Start searching for courses"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
