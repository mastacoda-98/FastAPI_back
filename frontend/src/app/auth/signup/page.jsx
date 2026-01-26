"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function SignUp() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = {
        email,
        role,
        password,
        first_name: firstName,
        last_name: lastName,
        bio,
      };

      await api.post("/users", user);
      toast.success("User created! Redirecting to login...");
      setTimeout(() => router.push("/auth/login"), 1000);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-stone-50 border-2 border-orange-400">
          <CardHeader className="bg-orange-400 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Already Logged In</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-black mb-6">
              You are already logged in!
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-orange-400 text-white px-6 py-2 rounded font-bold hover:bg-orange-500"
            >
              Go to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-stone-50 border-2 border-orange-400">
        <CardHeader className="bg-orange-400 text-white rounded-t-lg">
          <CardTitle className="text-2xl">Sign Up</CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
            />

            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
            />

            <textarea
              placeholder="Bio (optional)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
              rows="3"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-400 text-white py-2 rounded font-bold hover:bg-orange-500 disabled:bg-gray-400 border-2 border-black"
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>
        </CardContent>

        <CardFooter className="border-t-2 border-black pt-6">
          <p className="text-center w-full text-black">
            Have account?{" "}
            <Link
              href="/auth/login"
              className="text-orange-600 font-bold hover:underline"
            >
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
