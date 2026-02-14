"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { PortalTopbar } from "@/components/portal/PortalTopbar";
import { FormGroup } from "@/components/portal/FormGroup";
import { FormInput } from "@/components/portal/FormInput";
import { FormTextarea } from "@/components/portal/FormTextarea";
import { ToggleSwitch } from "@/components/portal/ToggleSwitch";

interface UserData {
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export default function SettingsClient({ user }: { user: UserData }) {
  const [notifications, setNotifications] = useState({
    newReview: true,
    storyMention: true,
    weeklySummary: false,
    billingChanges: true,
  });

  const handleSaveAccount = () => {
    console.log("Save account settings clicked");
  };

  const handleUpdatePassword = () => {
    console.log("Update password clicked");
  };

  const handleDeleteAccount = () => {
    console.log("Delete account clicked");
  };

  return (
    <>
      <PortalTopbar title="Settings" />
      <div className="p-8 max-[899px]:pt-16 max-w-[640px]">
        {/* Account Information */}
        <h2 className="font-display text-[22px] font-semibold text-black mb-4">Account Information</h2>
        <div className="bg-white border border-[#e5e5e5] p-6 mb-8">
          <FormGroup label="Display Name" htmlFor="display_name">
            <FormInput id="display_name" defaultValue={user.name} />
          </FormGroup>

          <FormGroup label="Email" htmlFor="email" hint="Contact support to change your email address.">
            <FormInput
              id="email"
              type="email"
              defaultValue={user.email}
              readOnly
              className="bg-[#f5f5f5] cursor-not-allowed"
            />
          </FormGroup>

          <FormGroup label="Phone" htmlFor="phone">
            <FormInput id="phone" type="tel" defaultValue={user.phone ?? ""} placeholder="(404) 555-0000" />
          </FormGroup>

          <FormGroup label="Avatar URL" htmlFor="avatar_url">
            <FormInput id="avatar_url" type="url" defaultValue={user.avatar_url ?? ""} placeholder="https://..." />
          </FormGroup>

          <FormGroup label="Bio" htmlFor="bio">
            <FormTextarea id="bio" defaultValue={user.bio ?? ""} placeholder="Tell us about yourself..." />
          </FormGroup>

          <button
            type="button"
            onClick={handleSaveAccount}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#fee198] text-[#1a1a1a] hover:bg-[#e6c46d] transition-colors"
          >
            Save Changes
          </button>
        </div>

        {/* Change Password */}
        <h2 className="font-display text-[22px] font-semibold text-black mb-4">Change Password</h2>
        <div className="bg-white border border-[#e5e5e5] p-6 mb-8">
          <FormGroup label="Current Password" htmlFor="current_password">
            <FormInput id="current_password" type="password" disabled className="bg-[#f5f5f5] cursor-not-allowed" />
          </FormGroup>

          <FormGroup label="New Password" htmlFor="new_password">
            <FormInput id="new_password" type="password" disabled className="bg-[#f5f5f5] cursor-not-allowed" />
          </FormGroup>

          <FormGroup label="Confirm New Password" htmlFor="confirm_password">
            <FormInput id="confirm_password" type="password" disabled className="bg-[#f5f5f5] cursor-not-allowed" />
          </FormGroup>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-[#e5e5e5] text-[#6b7280] cursor-not-allowed"
            >
              Update Password
            </button>
            <span className="text-[12px] text-[#6b7280]">Available after authentication is configured</span>
          </div>
        </div>

        {/* Notification Preferences */}
        <h2 className="font-display text-[22px] font-semibold text-black mb-4">Notification Preferences</h2>
        <div className="bg-white border border-[#e5e5e5] p-6 mb-8 space-y-4">
          <ToggleSwitch
            checked={notifications.newReview}
            onChange={(v) => setNotifications((prev) => ({ ...prev, newReview: v }))}
            label="Email me when I get a new review"
          />
          <ToggleSwitch
            checked={notifications.storyMention}
            onChange={(v) => setNotifications((prev) => ({ ...prev, storyMention: v }))}
            label="Email me when my business is mentioned in a story"
          />
          <ToggleSwitch
            checked={notifications.weeklySummary}
            onChange={(v) => setNotifications((prev) => ({ ...prev, weeklySummary: v }))}
            label="Email me weekly analytics summary"
          />
          <ToggleSwitch
            checked={notifications.billingChanges}
            onChange={(v) => setNotifications((prev) => ({ ...prev, billingChanges: v }))}
            label="Email me about tier/billing changes"
          />
        </div>

        {/* Danger Zone */}
        <h2 className="font-display text-[22px] font-semibold text-black mb-4">Danger Zone</h2>
        <div className="border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-[#c1121f] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-body text-[#374151]">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="mt-3 text-[#c1121f] text-sm font-semibold hover:underline"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
