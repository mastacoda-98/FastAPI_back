"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CourseCard({ course, variant = "list" }) {
  const courseId = course.id || course.course_id;
  const isListVariant = variant === "list";

  return (
    <Link href={`/courses/${courseId}`}>
      <Card className="bg-white border border-gray-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 cursor-pointer h-full overflow-hidden">
        {isListVariant ? (
          <>
            <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg truncate">
                  {course.title || "Course"}
                </CardTitle>
                <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {course.title?.charAt(0).toUpperCase() || "C"}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-gray-600 text-sm line-clamp-2">
                {course.description || "No description"}
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>{course.total_students || 0} Students</span>
                <span>{course.sections_count || 0} Sections</span>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-bold text-lg text-black">{course.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">
              {course.description || "No description"}
            </p>
            <div className="flex justify-between text-xs text-gray-600">
              <span>{course.total_students || 0} Students</span>
              <span>{course.sections_count || 0} Sections</span>
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
