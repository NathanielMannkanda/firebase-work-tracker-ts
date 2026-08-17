import { useEffect, useState } from "react";

import DashboardLayout from "../components/layout/DashboardLayout";

import { firestore } from "../firebase/firebase";

import {
  collection,
  onSnapshot
} from "firebase/firestore";
import { motion } from "framer-motion";
import type { WorkSession } from "../types/models";

interface WorkerStat {
  userId: string;
  userName: string | null;
  totalMilliseconds: number;
  active: boolean;
  totalTime: string;
}

function SessionsPage() {
  const [workerStats, setWorkerStats] = useState<WorkerStat[]>([]);

  useEffect(() => {
    const sessionsRef = collection(
      firestore,
      "workSessions"
    );

    const unsubscribe = onSnapshot(
      sessionsRef,
      (snapshot) => {
        const sessions: WorkSession[] = [];

        snapshot.forEach((doc) => {

          sessions.push({
            id: doc.id,
            ...(doc.data() as Omit<WorkSession, "id">)
          });
        });
        // eslint-disable-next-line
        calculateWorkerHours(sessions);
      }
    );

    return () => unsubscribe();
  }, []);

  const calculateWorkerHours = (sessions: WorkSession[]) => {
    //today's date
    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const workerMap: Record<string, Omit<WorkerStat, "totalTime">> = {};

    sessions.forEach((session) => {
      if (!session) return;

      //firestore timestamp =>>> JS date
      const clockInDate = new Date(session.clockIn.seconds * 1000);

      //ignore old sessions
      if (clockInDate < startOfDay) return

      //initialize worker
      if (!workerMap[session.userId]) {
        workerMap[session.userId] = {
          userId: session.userId,
          userName: session.userName,
          totalMilliseconds: 0,
          active: false
        };
      }

      let endTime;

      //if active sessions still running
      if (session.status === "active") {
        endTime = Date.now();

        workerMap[session.userId].active = true;
      } else {
        endTime = session.clockOut
          ? session.clockOut.seconds * 1000
          : Date.now();
      }

      const startTime = clockInDate.getTime();

      const duration = endTime - startTime

      workerMap[session.userId]
        .totalMilliseconds += duration
    });

    const formattedWorkers = Object.values(workerMap)
      .map((worker) => {
        const totalSeconds = Math.floor(
          worker.totalMilliseconds / 1000
        );

        const hours = Math.floor(
          totalSeconds / 3600
        )

        const minutes = Math.floor(
          (totalSeconds % 3600) / 60
        );

        return {
          ...worker,
          totalTime: `${hours}h ${minutes}m`
        };
      });

    setWorkerStats(formattedWorkers);
  };
  return (

    <DashboardLayout title="Sessions">

      <div className="space-y-4">

        <h2 className="text-3xl font-bold">
          Worker Sessions
        </h2>

        {workerStats.length === 0 ? (

          <p>No worker sessions today</p>

        ) : (

          workerStats.map((worker) => (

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              key={worker.userId}
              className="
                bg-[#1c1c1e] p-5 rounded-2xl shadow-sm border flex justify-between items-center border-gray-800
              "
            >

              <div>

                <h3 className="text-xl font-semibold">
                  {worker.userName}
                </h3>

                <p className="text-gray-500 mt-1">
                  Total Today:
                  {" "}
                  {worker.totalTime}
                </p>

              </div>

              <div>

                {worker.active ? (

                  <span className="text-green-600 font-medium">
                    Active
                  </span>

                ) : (

                  <span className="text-gray-500 font-medium">
                    Offline
                  </span>

                )}

              </div>

            </motion.div>
          ))
        )}

      </div>

    </DashboardLayout>
  );
}

export default SessionsPage;
