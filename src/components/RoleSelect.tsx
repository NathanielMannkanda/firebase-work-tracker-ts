import { useState } from "react";
import type { User } from "firebase/auth";
import { firestore } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import type { Role } from "../types/models";

interface RoleSelectProps {
  user: User;
  onRoleConfirmed: (role: Role) => void;
}

function RoleSelect({ user, onRoleConfirmed }: RoleSelectProps) {
  //role awaiting confirmation in the modal
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);

  const confirmRole = async () => {
    if (!pendingRole) return;

    setSaving(true);
    try{
      //reference to user doc
      const userRef = doc(firestore,"users", user.uid);

      //saves data to firestore
      await setDoc(userRef, {
        role: pendingRole,
        email: user.email,
        name: user.displayName,
        createdAt: new Date()
      }, { merge: true });

      //update app state instantly
      onRoleConfirmed(pendingRole);
    }catch(error){
      console.log(error)
    }
    setSaving(false);
    setPendingRole(null);
  }

  return(
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl bg-[#1c1c1e] border border-gray-800 rounded-3xl p-6 md:p-10 shadow-2xl text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">
          Work Tracker
        </h1>

        <h2 className="text-gray-400 mb-2">
          Select your role
        </h2>

        <div className="space-y-4 mb-3">
          <button
            onClick={() => setPendingRole("worker")}
            className="w-full bg-[#2c2d2e] border border-gray-700 rounded-2xl p-6 text-left hover:border-[#ff9500] hover:scale-[1.02] transition cursor-pointer"
          >
            <h2 className="text-xl font-semibold text-white">
              Worker
            </h2>

            <p className="text-gray-400 mt-2">
              Clock in, track work hours and complete assigned tasks
            </p>
          </button>
        </div>

        <div className="space-y-4">
          <button
            className="w-full bg-[#2c2d2e] border border-gray-700 rounded-2xl p-6 text-left hover:border-[#ff9500] hover:scale-[1.02] transition cursor-pointer"
            onClick={() => setPendingRole("manager")}
          >
            <h2
              className="text-xl font-semibold text-white"
            >
              Manager
            </h2>

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
