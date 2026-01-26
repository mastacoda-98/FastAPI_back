"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const handleSignout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="flex justify-between items-center p-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <button
          onClick={handleSignout}
          className="bg-red-600 text-white px-4 py-2 rounded font-bold hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
