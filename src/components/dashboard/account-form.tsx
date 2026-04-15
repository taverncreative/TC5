"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfile } from "@/app/(dashboard)/dashboard/account/actions";
import type { Profile } from "@/lib/types/database";

interface AccountFormProps {
  profile: Profile;
}

export function AccountForm({ profile }: AccountFormProps) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [partnerName1, setPartnerName1] = useState(profile.partner_name_1 || "");
  const [partnerName2, setPartnerName2] = useState(profile.partner_name_2 || "");
  const [weddingDate, setWeddingDate] = useState(profile.wedding_date || "");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const result = await updateProfile({
      id: profile.id,
      full_name: fullName || null,
      phone: phone || null,
      partner_name_1: partnerName1 || null,
      partner_name_2: partnerName2 || null,
      wedding_date: weddingDate || null,
    });

    setSaving(false);

    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Personal Details */}
      <Card>
        <h2 className="text-sm font-semibold text-[var(--tc-black)] mb-4">
          Personal Details
        </h2>
        <div className="space-y-4">
          <Input
            id="full_name"
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
          <div>
            <label className="block text-sm font-medium text-[var(--tc-gray-700)] mb-1.5">
              Email
            </label>
            <p className="text-sm text-[var(--tc-gray-500)]">{profile.email}</p>
            <p className="text-xs text-[var(--tc-gray-400)] mt-0.5">
              Email cannot be changed
            </p>
          </div>
          <Input
            id="phone"
            label="Phone (optional)"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07700 900000"
          />
        </div>
      </Card>

      {/* Wedding Details */}
      <Card>
        <h2 className="text-sm font-semibold text-[var(--tc-black)] mb-4">
          Wedding Details
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="partner1"
              label="Partner 1"
              value={partnerName1}
              onChange={(e) => setPartnerName1(e.target.value)}
              placeholder="e.g. Oliver"
            />
            <Input
              id="partner2"
              label="Partner 2"
              value={partnerName2}
              onChange={(e) => setPartnerName2(e.target.value)}
              placeholder="e.g. Amelia"
            />
          </div>
          <Input
            id="wedding_date"
            label="Wedding Date"
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
          />
        </div>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" loading={saving}>
          Save Changes
        </Button>
        {saved && (
          <span className="text-sm text-[var(--tc-sage)]">Saved successfully</span>
        )}
        {error && (
          <span className="text-sm text-red-600">{error}</span>
        )}
      </div>
    </form>
  );
}
