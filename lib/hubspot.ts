// lib/hubspot.ts — HubSpot Forms API submission utility

export interface HubSpotFormField {
  objectTypeId: string; // "0-1" for contacts
  name: string; // HubSpot field internal name
  value: string;
}

export interface HubSpotSubmissionOptions {
  formId: string;
  fields: HubSpotFormField[];
  context?: {
    hutk?: string; // HubSpot tracking cookie value
    pageUri?: string; // Current page URL
    pageName?: string; // Current page title
  };
  legalConsentOptions?: {
    consent: {
      consentToProcess: boolean;
      text: string;
    };
  };
}

export interface HubSpotSubmissionResult {
  success: boolean;
  message?: string;
  errors?: Array<{ message: string; errorType: string }>;
}

/**
 * Get the HubSpot tracking cookie (hutk) value from the browser.
 * This ties the form submission to the visitor's browsing history.
 */
export function getHubSpotCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/hubspotutk=([^;]+)/);
  return match ? match[1] : undefined;
}

/**
 * Submit a form to HubSpot's Forms API.
 *
 * @example
 * const result = await submitHubSpotForm({
 *   formId: process.env.NEXT_PUBLIC_HUBSPOT_PARTNER_FORM_ID!,
 *   fields: [
 *     { objectTypeId: "0-1", name: "email", value: "hello@example.com" },
 *     { objectTypeId: "0-1", name: "firstname", value: "Jane" },
 *   ],
 *   context: {
 *     hutk: getHubSpotCookie(),
 *     pageUri: window.location.href,
 *     pageName: document.title,
 *   }
 * });
 */
export async function submitHubSpotForm(
  options: HubSpotSubmissionOptions
): Promise<HubSpotSubmissionResult> {
  const portalId = process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID;

  if (!portalId) {
    console.error("HubSpot portal ID not configured");
    return { success: false, message: "HubSpot not configured" };
  }

  const url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${options.formId}`;

  const payload: Record<string, unknown> = {
    fields: options.fields,
    context: {
      hutk:
        options.context?.hutk || getHubSpotCookie(),
      pageUri:
        options.context?.pageUri ||
        (typeof window !== "undefined" ? window.location.href : ""),
      pageName:
        options.context?.pageName ||
        (typeof document !== "undefined" ? document.title : ""),
    },
  };

  if (options.legalConsentOptions) {
    payload.legalConsentOptions = options.legalConsentOptions;
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return { success: true, message: "Form submitted successfully" };
    }

    const errorData = await response.json().catch(() => null);
    return {
      success: false,
      message:
        errorData?.message || `Submission failed (${response.status})`,
      errors: errorData?.errors || [],
    };
  } catch (error) {
    console.error("HubSpot form submission error:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Network error",
    };
  }
}
