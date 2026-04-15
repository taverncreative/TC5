"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production, this would send via Resend or a form service
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Card padding="lg" className="text-center">
          <h1 className="font-heading text-2xl font-semibold text-[var(--tc-black)]">
            Message Sent
          </h1>
          <p className="mt-3 text-sm text-[var(--tc-gray-500)]">
            Thank you for getting in touch. We will reply within 24 hours.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-heading text-3xl font-semibold text-[var(--tc-black)]">
        Contact Us
      </h1>
      <p className="mt-2 text-sm text-[var(--tc-gray-500)]">
        Have a question about your order or need help choosing a design? We
        would love to hear from you.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input id="name" label="Name" type="text" required placeholder="Your name" />
        <Input id="email" label="Email" type="email" required placeholder="you@example.com" />
        <div className="space-y-1.5">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-[var(--tc-gray-700)]"
          >
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            required
            className="block w-full rounded-md border border-[var(--tc-gray-300)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tc-black)] focus:border-transparent resize-none"
            placeholder="How can we help?"
          />
        </div>
        <Button type="submit" className="w-full">
          Send Message
        </Button>
      </form>

      <div className="mt-12 text-sm text-[var(--tc-gray-500)] space-y-2">
        <p>
          <strong className="text-[var(--tc-black)]">Email:</strong>{" "}
          hello@taverncreative.co.uk
        </p>
        <p>
          <strong className="text-[var(--tc-black)]">Location:</strong> Kent, United Kingdom
        </p>
      </div>
    </div>
  );
}
