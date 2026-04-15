"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [partnerName1, setPartnerName1] = useState("");
  const [partnerName2, setPartnerName2] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    // Sign up with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          partner_name_1: partnerName1,
          partner_name_2: partnerName2,
          wedding_date: weddingDate || null,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // If auto-confirmed (dev mode), update profile with wedding data
    if (data.user) {
      await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          partner_name_1: partnerName1 || null,
          partner_name_2: partnerName2 || null,
          wedding_date: weddingDate || null,
        })
        .eq("id", data.user.id);

      // If session exists (auto-confirmed), go straight to dashboard
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <Card padding="lg">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
            Check your email
          </h1>
          <p className="mt-3 text-sm text-[var(--tc-gray-500)] leading-relaxed">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>.
            Please check your inbox to verify your account.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-[var(--tc-black)] hover:underline"
          >
            Back to login
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="text-center mb-6">
        <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
          {step === 1 ? "Create your account" : "Tell us about your wedding"}
        </h1>
        <p className="mt-1 text-sm text-[var(--tc-gray-500)]">
          {step === 1
            ? "Save designs, track orders, and plan your stationery"
            : "We'll personalise your experience"}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`h-1.5 w-12 rounded-full ${step >= 1 ? "bg-[var(--tc-sage)]" : "bg-[var(--tc-gray-200)]"}`} />
        <div className={`h-1.5 w-12 rounded-full ${step >= 2 ? "bg-[var(--tc-sage)]" : "bg-[var(--tc-gray-200)]"}`} />
      </div>

      {step === 1 ? (
        <form onSubmit={handleStep1} className="space-y-4">
          <Input
            id="full_name"
            label="Your Name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            required
          />
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
            required
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="partner1"
            label="Partner 1 Name"
            type="text"
            value={partnerName1}
            onChange={(e) => setPartnerName1(e.target.value)}
            placeholder="e.g. Oliver"
          />
          <Input
            id="partner2"
            label="Partner 2 Name"
            type="text"
            value={partnerName2}
            onChange={(e) => setPartnerName2(e.target.value)}
            placeholder="e.g. Amelia"
          />
          <Input
            id="wedding_date"
            label="Wedding Date"
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
          />

          <p className="text-xs text-[var(--tc-gray-400)] text-center">
            All fields optional — you can add these later
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Create Account
            </Button>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[var(--tc-gray-500)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--tc-black)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}
