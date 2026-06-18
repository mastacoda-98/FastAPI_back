"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { GridSkeleton } from "@/components/ui/LoadingSkeleton";
import { CourseCard } from "@/components/CourseCard";
import { BookOpen } from "lucide-react";
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
        const response = await api.get("/courses", {
          params: {
            q: query.trim() || undefined,
            skip: 0,
            limit: 100,
          },
        });
        setCourses(response.data);
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
    <div className="min-h-screen bg-stone-50 py-8 pt-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-black">Courses</h1>
          <Link href="/courses/create">
            <Button>+ Create Course</Button>
          </Link>
        </div>
        {query && (
          <p className="text-gray-600 mb-6">
            Search results for: <span className="font-semibold">{query}</span>
          </p>
        )}

        {loading ? (
          <GridSkeleton count={6} />
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} variant="list" />
            ))}
          </div>
        ) : (
          <EmptyState
            title={query ? "No courses found" : "No courses available yet"}
            description={
              query
                ? "Try adjusting your search terms"
                : "Start learning by checking back later or creating a course"
            }
            actionText="Create Course"
            actionHref="/courses/create"
            icon={BookOpen}
          />
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 py-8 pt-24">
          <div className="max-w-7xl mx-auto px-4">
            <GridSkeleton count={6} />
          </div>
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}
