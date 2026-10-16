"use server";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

// NOTE: this does not persist submissions anywhere (no contact-messages
// table in Supabase, no email provider configured) — it only logs server-side
// and confirms receipt to the user. Wiring real persistence/notification
// needs a provisioned table or an email service (e.g. Resend) first.
export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !message) {
    return { status: "error", message: "All fields are required." };
  }

  console.log("Contact form submission:", { name, email, message });

  return { status: "success" };
}
