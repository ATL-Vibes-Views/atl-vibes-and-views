"use client";

import { useState } from "react";
import {
  submitHubSpotForm,
  getHubSpotCookie,
} from "@/lib/hubspot";

/* ============================================================
   PartnerContactForm — Native HubSpot form for /partner/contact
   Replaces the embedded HubSpot script with a native form
   that submits via the Forms API.
   ============================================================ */

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

const INITIAL: FormData = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  company: "",
  message: "",
};

export function PartnerContactForm() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const result = await submitHubSpotForm({
      formId: process.env.NEXT_PUBLIC_HUBSPOT_PARTNER_FORM_ID!,
      fields: [
        { objectTypeId: "0-1", name: "firstname", value: form.firstname },
        { objectTypeId: "0-1", name: "lastname", value: form.lastname },
        { objectTypeId: "0-1", name: "email", value: form.email },
        { objectTypeId: "0-1", name: "phone", value: form.phone },
        { objectTypeId: "0-1", name: "company", value: form.company },
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
          We&rsquo;ve received your message and will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-black mb-1">
            First Name *
          </label>
          <input
            type="text"
            required
            value={form.firstname}
            onChange={update("firstname")}
            className="w-full bg-transparent border-b border-black px-0 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#c1121f]/30 focus:border-[#c1121f] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-black mb-1">
            Last Name *
          </label>
          <input
            type="text"
            required
            value={form.lastname}
            onChange={update("lastname")}
            className="w-full bg-transparent border-b border-black px-0 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#c1121f]/30 focus:border-[#c1121f] transition-colors"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1">
          Email *
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={update("email")}
          className="w-full bg-transparent border-b border-black px-0 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#c1121f]/30 focus:border-[#c1121f] transition-colors"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1">
          Phone
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={update("phone")}
          className="w-full bg-transparent border-b border-black px-0 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#c1121f]/30 focus:border-[#c1121f] transition-colors"
        />
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1">
          Company / Brand
        </label>
        <input
          type="text"
          value={form.company}
          onChange={update("company")}
          className="w-full bg-transparent border-b border-black px-0 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#c1121f]/30 focus:border-[#c1121f] transition-colors"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-semibold text-black mb-1">
          Message *
        </label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={update("message")}
          className="w-full bg-transparent border-b border-black px-0 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#c1121f]/30 focus:border-[#c1121f] transition-colors resize-none"
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
        className="border border-[#c1121f] text-[#c1121f] px-10 py-3.5 text-xs font-bold uppercase tracking-[0.15em] hover:bg-black hover:text-[#fee198] hover:border-[#fee198] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Sending\u2026" : "Send Message"}
      </button>
    </form>
  );
}
