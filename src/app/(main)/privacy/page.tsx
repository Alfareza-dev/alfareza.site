import { ShieldCheck, Database, Lock, EyeOff } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy and Data Handling for Alfareza's personal site.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-16 font-sans">
      <div className="max-w-3xl mx-auto px-6 space-y-12">
        <header className="space-y-4">
          <Link href="/" className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
            &larr; Back to Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground">
            Clear, transparent data practices with a focus on your security.
          </p>
        </header>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0c0c0c] backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3 mb-6">
              <EyeOff className="w-6 h-6 text-teal-500" />
              Zero Third-Party Sharing
            </h2>
            <p>
              I respect your privacy. This website operates on a strict zero third-party data sharing policy. 
              I do not sell, trade, or otherwise transfer any of your personally identifiable information or browsing data to outside parties. 
              There are no ad trackers, no third-party marketing scripts, and no cross-site analytics tools installed on this platform.
            </p>
          </section>

          <section className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0c0c0c] backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-teal-500" />
              Security Logging & IP Tracking
            </h2>
            <p className="mb-4">
              To maintain the integrity and security of the administrative systems on this site, critical security events are monitored. 
              If an unauthorized entity attempts to guess passwords, breach the admin dashboard, or exploit the platform, their actions are recorded.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>
                <strong className="text-gray-300">IP Addresses:</strong> Are logged exclusively to block malicious actors and monitor site traffic health.
              </li>
              <li>
                <strong className="text-gray-300">Failed Logins:</strong> Trigger automated security alerts and potential IP bans to prevent brute-force attacks.
              </li>
              <li>
                <strong className="text-gray-300">User Agents:</strong> Are stored to distinguish between human visitors, bots, and potential automated attacks.
              </li>
            </ul>
          </section>

          <section className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0c0c0c] backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3 mb-6">
              <Database className="w-6 h-6 text-teal-500" />
              Data Persistence (Supabase)
            </h2>
            <p>
              This website uses <strong className="text-white">Supabase</strong> for backend architecture and database management. 
              All data (including security logs and essential site traffic metrics) is stored securely within Supabase infrastructure, protected by strict Row Level Security (RLS) policies. 
              Direct database read/write access is physically restricted exclusively to the site owner via Service Role keys.
            </p>
          </section>

          <section className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#0c0c0c] backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-teal-500" />
              Your Rights
            </h2>
            <p>
              As a visitor, you have the right to browse this personal portfolio securely. If you have any concerns regarding how your connection data is handled, 
              please feel free to reach out via the Contact form. I am committed to absolute transparency regarding the technical operations of this platform.
            </p>
          </section>

          <div className="text-sm text-center text-muted-foreground pt-8 border-t border-white/10">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
}
