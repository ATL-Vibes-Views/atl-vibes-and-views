"use client";

import { useState } from "react";
import { submitHubSpotForm, getHubSpotCookie } from "@/lib/hubspot";

/* ============================================================
   GeneralContactForm — Native HubSpot form for /contact
   Uses NEXT_PUBLIC_HUBSPOT_CONTACT_FORM_ID (general, NOT partner)
   ============================================================ */

const SUBJECT_OPTIONS = [
  "General Inquiry",
  "Story Tip / News Tip",
  "Business Listing Support",
  "Press / Media Inquiry",
  "Technical Issue",
  "Other",
] as const;

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  subject_dropdown: string;
  message: string;
}

const INITIAL: FormData = {
  firstname: "",
  lastname: "",
  email: "",
  subject_dropdown: "",
  message: "",
};

export function GeneralContactForm() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update =
    (field: keyof FormData) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const result = await submitHubSpotForm({
      formId: process.env.NEXT_PUBLIC_HUBSPOT_CONTACT_FORM_ID!,
      fields: [
        { objectTypeId: "0-1", name: "firstname", value: form.firstname },
        { objectTypeId: "0-1", name: "lastname", value: form.lastname },
        { objectTypeId: "0-1", name: "email", value: form.email },
        {
          objectTypeId: "0-1",
          name: "subject_dropdown",
          value: form.subject_dropdown,
        },
        { objectTypeId: "0-1", name: "message", value: form.message },
      ],
      context: {
        hutk: getHubSpotCookie(),
        pageUri: window.location.href,
        pageName: document.title,
      },
    });

    if (result.success) {
      setStatus("success");
      setForm(INITIAL);
    } else {
      setStatus("error");
      setErrorMsg(result.message || "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="py-12 text-center">
        <h3 className="font-display text-2xl font-semibold text-black mb-3">
          Thank You!
        </h3>
        <p className="text-gray-mid text-sm">
          We&rsquo;ve received your message and will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-black mb-1.5">
            First Name
          </label>
          <input
            type="text"
            value={form.firstname}
            onChange={update("firstname")}
            className="w-full border border-gray-300 px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#c1121f] transition-colors"
            placeholder="First name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-black mb-1.5">
            Last Name
          </label>
          <input
            type="text"
            value={form.lastname}
            onChange={update("lastname")}
            className="w-full border border-gray-300 px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#c1121f] transition-colors"
            placeholder="Last name"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1.5">
          Email <span className="text-[#c1121f]">*</span>
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={update("email")}
          className="w-full border border-gray-300 px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#c1121f] transition-colors"
          placeholder="your@email.com"
        />
      </div>

      {/* Subject Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1.5">
          Subject <span className="text-[#c1121f]">*</span>
        </label>
        <select
          required
          value={form.subject_dropdown}
          onChange={update("subject_dropdown")}
          className="w-full border border-gray-300 px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#c1121f] transition-colors appearance-none"
        >
          <option value="" disabled>
            Select a topic
          </option>
          {SUBJECT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1.5">
          Message
        </label>
        <textarea
          rows={5}
          value={form.message}
          onChange={update("message")}
          className="w-full border border-gray-300 px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#c1121f] transition-colors resize-none"
          placeholder="How can we help?"
        />
      </div>

      {/* Error */}
      {status === "error" && (
        <p className="text-[#c1121f] text-sm">{errorMsg}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full bg-[#fee198] text-[#1a1a1a] font-semibold text-sm uppercase tracking-wide py-3.5 hover:bg-[#e6c46d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Sending\u2026" : "Send Message"}
      </button>
    </form>
  );
}
