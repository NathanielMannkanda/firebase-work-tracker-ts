import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, firestore } from "../firebase/firebase";
import { motion, AnimatePresence } from "framer-motion";
import type { UserDoc } from "../types/models";

function ProfileCard() {

  const user = auth.currentUser;

  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");

  //editing state for the username field
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  //live doc listener so name updates everywhere instantly
  useEffect(() => {
    if (!user) return;

    const userRef = doc(firestore, "users", user.uid);

    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as UserDoc;
        setName(data.name || user.displayName || "");
        setEmail(data.email || user.email || "");
      }
    });

    return () => unsubscribe();
  }, [user]);

  const startEditing = () => {
    setNewName(name);
    setEditing(true);
  };

  const handleSaveUsername = async () => {
    if (!newName.trim() || !user) return;

    setSaving(true);
    try {
      const userRef = doc(firestore, "users", user.uid);

      await updateDoc(userRef, {
        name: newName.trim()
      });

      //keep the auth profile in sync too (used for sessions/task names)
      await updateProfile(user, {
        displayName: newName.trim()
      });

      setName(newName.trim());
      setEditing(false);
    } catch (error) {
      console.log(error);
    }
    setSaving(false);
  };

  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center gap-3">

        <div className="w-11 h-11 shrink-0 rounded-full bg-[#ff9f0a] flex items-center justify-center text-black font-bold text-lg">
          {name ? name.charAt(0).toUpperCase() : "?"}
        </div>

        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {editing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-2"
              >
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#2c2d2e] border border-gray-700 rounded-lg px-2 py-1 text-sm text-white outline-none"
                />

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveUsername}
                    disabled={saving}
                    className="text-xs bg-[#ff9f0a] text-black font-semibold px-3 py-1 rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>

                  <button
                    onClick={() => setEditing(false)}
                    disabled={saving}
                    className="text-xs bg-[#2c2d2e] border border-gray-700 px-3 py-1 rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">
                    {name || "Unnamed"}
                  </p>

                  <button
                    onClick={startEditing}
                    title="Edit username"
                    className="text-gray-500 hover:text-white cursor-pointer text-sm leading-none"
                  >
                    ✎
                  </button>
                </div>

                <p className="text-gray-500 text-xs truncate">
                  {email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

export default ProfileCard;
