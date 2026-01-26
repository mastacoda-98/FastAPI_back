"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

export default function UsersPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get("/users?skip=0&limit=100");
        const allUsers = response.data;

        if (query.trim()) {
          const filtered = allUsers.filter((user) => {
            const profileName = user.profile_name || "";
            const email = user.email || "";
            const searchLower = query.toLowerCase();
            return (
              profileName.toLowerCase().includes(searchLower) ||
              email.toLowerCase().includes(searchLower)
            );
          });
          setUsers(filtered);
        } else {
          setUsers(allUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [query]);

  return (
    <div className="min-h-screen bg-stone-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-black mb-2">Users</h1>
        {query && (
          <p className="text-gray-600 mb-6">
            Search results for: <span className="font-semibold">{query}</span>
          </p>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Loading users...</p>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Link key={user.id} href={`/profile/${user.id}`}>
                <Card className="bg-white border-2 border-orange-400 hover:shadow-xl hover:border-orange-500 transition-all duration-300 cursor-pointer h-full overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-orange-400 to-orange-500 text-white pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl truncate">
                        {user.profile_name || "User"}
                      </CardTitle>
                      <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {user.profile_name
                            ? user.profile_name.charAt(0).toUpperCase()
                            : "U"}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Role
                        </p>
                        <p className="text-black font-semibold capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs text-orange-600 font-semibold hover:text-orange-700">
                        View Profile →
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {query ? "No users found" : "Start searching for users"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
