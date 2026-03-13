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

export default function Login() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();
  const [email, setEmail] = useState("");
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
      toast.success("Logged in! Redirecting to dashboard...");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Error logging in");
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-50 py-8 px-4 pt-24">
        <div className="flex items-center justify-center">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 pt-24">
      <div className="flex items-center justify-center">
        <Card className="w-full max-w-md bg-white border border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardTitle className="text-3xl font-bold">Login</CardTitle>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="border-t border-gray-200 pt-6 pb-6">
            <p className="text-center w-full text-gray-700">
              No account?{" "}
              <Link
                href="/auth/signup"
                className="text-orange-600 font-semibold hover:text-orange-700 hover:underline transition-colors duration-200"
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
