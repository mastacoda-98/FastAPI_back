"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Card className="w-full max-w-md bg-white border border-gray-200">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardTitle className="text-2xl">Already Logged In</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-black mb-6">
              You are already logged in!
            </p>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 pt-24">
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md bg-white border border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="firstName"
                  type="text"
                  label="First Name"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                />
                <Input
                  id="lastName"
                  type="text"
                  label="Last Name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Input
                id="email"
                type="email"
                label="Email Address"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />

              <div className="space-y-2">
                <label
                  htmlFor="role"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-100 cursor-pointer"
                  disabled={loading}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="bio"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Bio{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 disabled:bg-gray-100 resize-none"
                  rows="3"
                  disabled={loading}
                />
              </div>

              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-200 pt-6 pb-6">
            <p className="text-center w-full text-gray-700">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-colors duration-200"
              >
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
