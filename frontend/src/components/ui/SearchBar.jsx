"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("users");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchType === "users") {
        router.push(`/users?q=${encodeURIComponent(searchQuery)}`);
      } else if (searchType === "courses") {
        router.push(`/courses?q=${encodeURIComponent(searchQuery)}`);
      }
      setSearchQuery("");
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center gap-2 flex-1 max-w-2xl"
    >
      <Select value={searchType} onValueChange={setSearchType}>
        <SelectTrigger className="w-32 bg-white text-orange-600 font-semibold hover:bg-orange-50 cursor-pointer transition-all duration-200 border border-orange-200 shadow-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="bg-white text-orange-600 shadow-lg"
        >
          <SelectItem value="users" className="cursor-pointer">
            Users
          </SelectItem>
          <SelectItem value="courses" className="cursor-pointer">
            Courses
          </SelectItem>
        </SelectContent>
      </Select>

      <input
        type="text"
        placeholder="Search users or courses..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 px-4 py-2 rounded-lg text-black border border-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500 transition-all duration-200 cursor-text bg-white/95 hover:bg-white"
      />

      <button
        type="submit"
        className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 active:scale-95 border border-white transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
      >
        Search
      </button>
    </form>
  );
}
