import { Metadata } from "next";
import { ScriptFormClient } from "./ScriptFormClient";

export const metadata: Metadata = {
  title: "Add Script | Admin CMS | ATL Vibes & Views",
  description: "Create a new filming script.",
  robots: { index: false, follow: false },
};

export default function NewScriptPage() {
  return <ScriptFormClient />;
}
