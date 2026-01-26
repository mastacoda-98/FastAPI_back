"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // TODO: Add API call to fetch courses
        // const response = await api.get(`/courses?search=${query}`);
        // setCourses(response.data);
        setCourses([]);
      } catch (error) {
        console.error("Error fetching courses:", error);
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
          <p className="text-center text-gray-600">Loading courses...</p>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`}>
                <Card className="bg-white border-2 border-orange-400 hover:shadow-lg transition cursor-pointer">
                  <CardHeader className="bg-orange-400 text-white">
                    <CardTitle>{course.title}</CardTitle>
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
