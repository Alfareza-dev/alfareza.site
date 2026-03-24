"use client";

import { useState } from "react";
import { Settings, AlertTriangle } from "lucide-react";
import { toggleMaintenance } from "@/app/actions/settings";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function MaintenanceToggle({ initialStatus }: { initialStatus: boolean }) {
  const [isEnabled, setIsEnabled] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  function handleToggleClick() {
    setShowModal(true);
  }

//...
  async function handleConfirm() {
    setShowModal(false);
    setIsLoading(true);
    try {
      const res = await toggleMaintenance(!isEnabled);
      if (res.success) {
        setIsEnabled(!isEnabled);
        toast.success(`Maintenance mode ${!isEnabled ? "enabled" : "disabled"}`);
        router.refresh();
      } else {
        toast.error("Failed to toggle maintenance mode");
      }
    } catch (e) {
      toast.error("Error toggling maintenance mode");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="bg-[#161c2d] border border-white/10 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${isEnabled ? "bg-yellow-500/10 text-yellow-500" : "bg-brand-primary/10 text-brand-primary"}`}>
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">System Control</h3>
              <p className="text-sm text-muted-foreground">Maintenance Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isEnabled 
                ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" 
                : "text-brand-primary bg-brand-primary/10 border-brand-primary/20"
            }`}>
              {isEnabled ? "Active" : "Off"}
            </span>

            {/* Toggle Switch */}
            <button
              onClick={handleToggleClick}
              disabled={isLoading}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#161c2d] disabled:opacity-50 disabled:cursor-not-allowed ${
                isEnabled 
                  ? "bg-yellow-500/80 focus:ring-yellow-500/50" 
                  : "bg-white/20 focus:ring-brand-primary/50"
              }`}
              aria-label="Toggle maintenance mode"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  isEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {isEnabled && (
          <div className="mt-4 flex items-center gap-2 text-xs text-yellow-400/80 bg-yellow-500/5 border border-yellow-500/10 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Public access is currently restricted. Only admin routes are accessible.
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#161c2d]/70 backdrop-blur-sm p-4">
          <div className="bg-[#161c2d] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-yellow-500/10 text-yellow-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Confirm Action</h3>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed">
              Are you sure you want to {isEnabled ? "disable" : "enable"} Maintenance Mode? 
              {!isEnabled 
                ? " This will restrict public access to the site. Only admin and auth routes will remain accessible."
                : " This will restore public access to the site."
              }
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-colors ${
                  isEnabled
                    ? "bg-brand-primary/20 border border-brand-primary/30 text-brand-primary hover:bg-brand-primary/30"
                    : "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30"
                }`}
              >
                {isEnabled ? "Disable Maintenance" : "Enable Maintenance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
