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
      className="flex items-center gap-3 flex-1 max-w-2xl"
    >
      <Select value={searchType} onValueChange={setSearchType}>
        <SelectTrigger className="w-32 bg-white text-orange-400 font-semibold hover:bg-stone-50 cursor-pointer transition border-2 border-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="bg-white text-orange-400"
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
        className="flex-1 px-4 py-2 rounded-lg text-black border-2 border-white focus:outline-none focus:ring-2 focus:ring-stone-50 focus:border-transparent transition cursor-text"
      />

      <button
        type="submit"
        className="bg-white text-orange-400 px-6 py-2 rounded-lg font-bold hover:bg-stone-50 active:scale-95 border-2 border-white transition duration-200 shadow-md cursor-pointer"
      >
        Search
      </button>
    </form>
  );
}
