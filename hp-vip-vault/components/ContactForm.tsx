"use client";

import { useActionState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBanner } from "@/components/ui/error-banner";
import { submitContactForm, type ContactFormState } from "@/app/contact/actions";

const initialState: ContactFormState = { status: "idle" };

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

  return (
    <form
      action={formAction}
      className="relative bg-[#1a1a1a] border border-gray-800 p-10 rounded-[2.5rem] shadow-2xl space-y-6"
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-[9px] text-gray-400 uppercase font-black tracking-widest ml-1">Name</label>
          <Input
            name="name"
            type="text"
            required
            placeholder="IDENTIFY YOURSELF"
            className="bg-black border-gray-800 rounded-2xl px-6 py-4 h-auto text-xs font-bold tracking-widest uppercase focus-visible:border-orange-500 focus-visible:ring-0 placeholder:text-gray-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-gray-400 uppercase font-black tracking-widest ml-1">Email</label>
          <Input
            name="email"
            type="email"
            required
            placeholder="EMAIL@VAULT.COM"
            className="bg-black border-gray-800 rounded-2xl px-6 py-4 h-auto text-xs font-bold tracking-widest uppercase focus-visible:border-orange-500 focus-visible:ring-0 placeholder:text-gray-600"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-gray-400 uppercase font-black tracking-widest ml-1">Inquiry</label>
          <textarea
            name="message"
            rows={4}
            required
            placeholder="ENTER YOUR MESSAGE..."
            className="w-full bg-black border border-gray-800 rounded-2xl px-6 py-4 text-xs font-bold tracking-widest uppercase outline-none focus:border-orange-500 transition-all resize-none placeholder:text-gray-600"
          />
        </div>
      </div>

      {state.status === "success" && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl">
          <CheckCircle2 size={14} />
          <span>Transmission received — we&apos;ll be in touch.</span>
        </div>
      )}
      {state.status === "error" && <ErrorBanner message={state.message} />}

      <Button
        type="submit"
        variant="vault"
        disabled={isPending}
        className="w-full py-5 rounded-2xl gap-3 text-[11px] hover:bg-white shadow-[0_0_40px_rgba(249,115,22,0.2)] disabled:opacity-50"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {isPending ? "Transmitting..." : "Send"}
      </Button>
    </form>
  );
}
