import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Role } from "../types/models";

interface RoleSelectProps {
  baseRole: Role | null;
  onRoleConfirmed: (role: Role) => void | Promise<void>;
}

function RoleSelect({ baseRole, onRoleConfirmed }: RoleSelectProps) {
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [deniedMessage, setDeniedMessage] = useState("");

  const canSelect = (targetRole: Role) => {
    //first time user onceoff option
    if(baseRole === null){
      return (
        targetRole === Role.Worker ||
        targetRole === Role.Manager
      );
    }

    //SuperUser options
    if(baseRole === Role.SuperUser) {
      return (
        targetRole === Role.Worker || 
        targetRole === Role.Manager
      );
    }

    return targetRole === baseRole;
  };

  const handleSelect = (targetRole: Role) => {
    if (!canSelect(targetRole)) {
      setDeniedMessage(
        `You don't have permission to sign in as ${targetRole}. Your account is registered as ${baseRole}.`
      );
      setTimeout(() => setDeniedMessage(""), 3000);
      return;
    }
    setDeniedMessage("");
    setPendingRole(targetRole);
  };

  const confirmRole = async () => {
    if (!pendingRole) return;

    setSaving(true);

    try{
      await onRoleConfirmed(pendingRole);
      setPendingRole(null);
    } catch (error) {
      console.error("Failed to confirm role:", error)
    }
    setSaving(false)
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-[#1c1c1e] border border-gray-800 rounded-3xl p-6 md:p-10 shadow-2xl text-center mb-10"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Work Tracker</h1>
        <h2 className="text-gray-400 mb-2">Select your role</h2>

        {deniedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm"
          >
            {deniedMessage}
          </motion.div>
        )}

        <div className="space-y-4 mb-3">
          <button
            onClick={() => handleSelect(Role.Worker)}
            disabled={!canSelect(Role.Worker || saving)}
            className={`w-full border rounded-2xl p-6 text-left transition ${
              canSelect(Role.Worker)
                ? "bg-[#2c2d2e] border-gray-700 hover:border-[#ff9500] hover:scale-[1.02] cursor-pointer"
                : "bg-[#242425] border-gray-800 opacity-40 cursor-not-allowed"
            }`}
          >
            <h2 className="text-xl font-semibold text-white">Worker</h2>
            <p className="text-gray-400 mt-2">
              Clock in, track work hours and complete assigned tasks
            </p>
          </button>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleSelect(Role.Manager)}
            disabled={!canSelect(Role.Manager) || saving}
            className={`w-full border rounded-2xl p-6 text-left transition ${
              canSelect(Role.Manager)
                ? "bg-[#2c2d2e] border-gray-700 hover:border-[#ff9500] hover:scale-[1.02] cursor-pointer"
                : "bg-[#242425] border-gray-800 opacity-40 cursor-not-allowed"
            }`}
          >
            <h2 className="text-xl font-semibold text-white">Manager</h2>
            <p className="text-gray-400 mt-2">
              Assign tasks, monitor activity, and manage workers
            </p>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {pendingRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-[#1c1c1e] border border-gray-800 rounded-3xl p-6 shadow-2xl text-center"
            >
              <h3 className="text-xl font-semibold text-white mb-2">
                Are you sure you'd like to continue as a {pendingRole}?
              </h3>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setPendingRole(null)}
                  disabled={saving}
                  className="flex-1 bg-[#2c2d2e] border border-gray-700 rounded-2xl py-3 text-white hover:border-gray-500 transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRole}
                  disabled={saving}
                  className="flex-1 bg-[#ff9f0a] rounded-2xl py-3 text-black font-semibold hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RoleSelect;