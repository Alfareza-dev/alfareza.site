"use client";

import { useTransition, useState, useRef } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    setErrorMsg(null);
    setFieldErrors({});
    
    startTransition(async () => {
      try {
        const result = await submitContactForm(null, formData);
        if (result.success) {
          setSuccess(true);
          formRef.current?.reset();
        } else {
          setFieldErrors(result.errors || {});
          setErrorMsg(result.error || "An error occurred");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "An unexpected network error occurred.");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center p-8 text-center border border-white/10 rounded-2xl bg-white/[0.02]"
          >
            <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-white">Message Sent!</h3>
            <p className="text-muted-foreground mb-6">
              Thank you for reaching out. I'll get back to you as soon as possible.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            action={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4 p-6 sm:p-8 border border-white/10 rounded-2xl bg-white/[0.02]"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="full_name" className="text-sm font-medium text-foreground">
                  Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  placeholder="Your name"
                  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:bg-white/10 transition-colors"
                  disabled={isPending}
                />
                {fieldErrors.full_name && (
                  <p className="text-xs text-red-500">{fieldErrors.full_name[0]}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="yourmail@example.com"
                  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:bg-white/10 transition-colors"
                  disabled={isPending}
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500">{fieldErrors.email[0]}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-foreground">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  placeholder="Inquiry regarding..."
                  className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:bg-white/10 transition-colors"
                  disabled={isPending}
                />
                {fieldErrors.subject && (
                  <p className="text-xs text-red-500">{fieldErrors.subject[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium text-foreground">
                  Message
                </label>
                <textarea
                  id="content"
                  name="content"
                  placeholder="How can I help you?"
                  className="flex min-h-[120px] w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 focus-visible:bg-white/10 transition-colors resize-none"
                  disabled={isPending}
                />
                {fieldErrors.content && (
                  <p className="text-xs text-red-500">{fieldErrors.content[0]}</p>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 mt-2 text-sm text-red-400 bg-red-950/50 border border-red-900/50 rounded-md">
                {errorMsg}
              </div>
            )}

            {/* Honeypot Trap for Bots */}
            <input 
              type="text" 
              name="website_url_verification" 
              className="hidden" 
              tabIndex={-1} 
              autoComplete="off" 
            />

            <button
              type="submit"
              disabled={isPending}
              className="group relative flex items-center justify-center gap-2 mt-4 h-11 w-full rounded-md bg-purple-600 text-sm font-medium text-white transition-all hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
