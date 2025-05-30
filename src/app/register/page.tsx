"use client";
import { RegisterForm } from "@/components/register-form";
// import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
  const { status } = useAuth();

  // Show loading state while checking authentication
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-10 md:p-12 bg-white relative">
      {/* Login container */}
      <div className="relative inset-0 bg-white z-90">
        {/* Form title */}
        <RegisterForm />
      </div>
    </div>
  );
}
