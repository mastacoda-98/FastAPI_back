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

export default function Login() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/token", formData);
      
      // Verify token is in response
      if (!response.data.access_token) {
        throw new Error("No token in response");
      }

      login(response.data.access_token);
      console.log("Login successful, token stored");

      toast.success("Logged in! Redirecting to dashboard...");
      // Give more time for state to update
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || "Error logging in");
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
          <CardTitle className="text-2xl">Login</CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-orange-600"
              required
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
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </CardContent>

        <CardFooter className="border-t-2 border-black pt-6">
          <p className="text-center w-full text-black">
            No account?{" "}
            <Link
              href="/auth/signup"
              className="text-orange-600 font-bold hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
