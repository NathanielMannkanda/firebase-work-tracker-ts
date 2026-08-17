import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { auth, firestore } from "../firebase/firebase";
import { motion } from "framer-motion";
import type { Timestamp } from "firebase/firestore";
import type { SessionStatus } from "../types/models";

import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

// clockIn/clockOut can briefly be a raw Date right after an optimistic
// clock-in/out, before the onSnapshot listener replaces it with the
// server's Timestamp.
interface ActiveSession {
  id: string;
  userId: string;
  userName: string | null;
  status: SessionStatus;
  clockIn: Timestamp | Date;
  clockOut: Timestamp | Date | null;
}

function WorkerPage() {

  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState("");

  const user = auth.currentUser;

  //check if worker is alr working/clocked in
  useEffect(() => {

    if (!user) return;

    const sessionsRef = collection(
      firestore,
      "workSessions"
    );

    const q = query(
      sessionsRef,
      where("userId", "==", user.uid),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {

      if (!snapshot.empty) {

        const sessionDoc = snapshot.docs[0];

        setActiveSession({
          id: sessionDoc.id,
          ...(sessionDoc.data() as Omit<ActiveSession, "id">)
        });

      } else {

        setActiveSession(null);
      }
    });

    return () => unsubscribe();

  }, [user]);

  //Clock in
  const handleClockIn = async () => {
    if (!user) return;

    try {
      const sessionData = {
        userId: user.uid,
        userName: user.displayName,
        status: "active" as const,
        clockIn: new Date(),
        clockOut: null
      };

      const sessionsRef = collection(
        firestore,
        "workSessions"
      );

      const q = query(
        sessionsRef,
        where("userId", "==", user.uid),
        where("status", "==", "active")
      );

      const existingSession = await getDocs(q);

      if (!existingSession.empty) {
        alert("You already have an active session.");
        return;
      }

      const docRef = await addDoc(
        collection(firestore, "workSessions"),
        sessionData
      );

      setActiveSession({
        id: docRef.id,
        ...sessionData
      });

    } catch (error) {
      console.log(error)
    }
  }

  //Clock out
  const handleClockOut = async () => {
    if (!activeSession) return;

    try {
      const sessionRef = doc(
        firestore,
        "workSessions",
        activeSession.id
      );

      await updateDoc(sessionRef, {
        status: "completed",
        clockOut: new Date()
      });

      setActiveSession(null);

    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {

    if (!activeSession?.clockIn) {
      // eslint-disable-next-line
      setElapsedTime(`${elapsedTime}`);
      return;
    }

    const updateTimer = () => {

      const clockInTime =
        activeSession.clockIn instanceof Date
          ? activeSession.clockIn.getTime()
          : activeSession.clockIn.seconds * 1000;

      const now = Date.now();

      const difference = now - clockInTime;

      const hours = Math.floor(
        difference / (1000 * 60 * 60)
      );

      const minutes = Math.floor(
        (difference % (1000 * 60 * 60))
        / (1000 * 60)
      );

      const seconds = Math.floor(
        (difference % (1000 * 60))
        / 1000
      );

      setElapsedTime(
        `${hours}h ${minutes}m ${seconds}s`
      );
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);

    // eslint-disable-next-line
  }, [activeSession]);

  return (
    <DashboardLayout title="Worker Dashboard">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* STATUS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#1c1c1e] p-6 rounded-2xl shadow-sm h-50">

          <h3 className="text-lg font-semibold mb-4">
            Work Status
          </h3>

          {!activeSession ? (

            <div>

              <p className="text-gray-500 mb-4">
                You are currently off duty
              </p>

              <button
                onClick={handleClockIn}
                className="bg-black text-white px-4 py-2 rounded-xl cursor-pointer"
              >
                Clock In
              </button>

            </div>

          ) : (

            <div>

              <p className="text-green-600 font-medium mb-4">
                Currently Working
              </p>

              <button
                onClick={handleClockOut}
                className="bg-red-500 text-white px-4 py-2 rounded-xl cursor-pointer"
              >
                Clock Out
              </button>

            </div>

          )}

        </motion.div>

        {/* HOURS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#1c1c1e] p-6 rounded-2xl shadow-sm h-50">

          <h3 className="text-lg font-semibold mb-2">
            Time Spent Working
          </h3>

          <p className="text-3xl font-bold">
            {elapsedTime}
          </p>

        </motion.div>

      </div>

    </DashboardLayout>
  );
}

export default WorkerPage
