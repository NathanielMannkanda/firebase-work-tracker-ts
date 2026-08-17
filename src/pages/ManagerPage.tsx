import { useEffect, useState } from "react";
import { firestore } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot
 } from "firebase/firestore";
 import DashboardLayout from "../components/layout/DashboardLayout";
 import { motion } from "framer-motion";
 import type { Worker, WorkSession } from "../types/models";

 function ManagerPage() {

  const [activeWorkers, setActiveWorkers] = useState<WorkSession[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  // realtimelistner useEffect
  useEffect(() => {
    const sessionsRef = collection(
      firestore,
      "workSessions"
    );

    const q = query(
      sessionsRef,
      where("status", "==", "active")
    );

    //realtime listener

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const workers: WorkSession[] = [];

      snapshot.forEach((doc) => {
        workers.push({
          id: doc.id,
          ...(doc.data() as Omit<WorkSession, "id">)
        });
      });

      setActiveWorkers(workers);
    });

    //cleanup listner
    return () => unsubscribe();

  },[]);

  //worker useEffect
  useEffect(() => {
    const fetchWorkers = async() => {
      const usersRef = collection(
        firestore,
        "users"
      );

      const q = query(
        usersRef,
        where("role", "==", "worker")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const workerList: Worker[] = [];

        snapshot.forEach((doc) => {

          workerList.push({
            id: doc.id,
            ...(doc.data() as Omit<Worker, "id">)
          });
        });

        setWorkers(workerList);
        setLoadingWorkers(false);
      });

      return unsubscribe;
    };

    fetchWorkers();
  }, []);

  return (
    <DashboardLayout title="Manager Dashboard">

    <div className="space-y-8">

      {/* ALL WORKERS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        <h2 className="text-2xl font-bold mb-4">
          All Workers
        </h2>

        {workers.length === 0 ? (
          loadingWorkers ? (
            <div>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[#1c1c1e] p-9 rounded-2xl border border-gray-800 animate-pulse"
                >
                  <div className="h-5 bg-gray-700 rounded w-40 mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-26"></div>
                </div>
              ))}
            </div>
          ) : (
            <p>No workers found</p>
          )
        ) : (

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {workers.map((worker) => (

              <div
                key={worker.id}
                className="bg-[#1c1c1e] p-6 rounded-2xl shadow-sm border border-gray-800"
              >

                <h3 className="text-lg font-semibold">
                  {worker.name}
                </h3>

                <p className="text-gray-500 break-all">
                  {worker.email}
                </p>

                <p className="mt-2 text-sm">
                  Role: {worker.role}
                </p>

              </div>
            ))}

          </motion.div>

        )}

      </motion.div>

      {/* ACTIVE WORKERS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >

        <h2 className="text-2xl font-bold mb-4">
          Currently Working
        </h2>

        {activeWorkers.length === 0 ? (

          <p>No workers clocked in</p>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {activeWorkers.map((worker) => (

              <div
                key={worker.id}
                className="bg-[#1c1c1e] p-6 rounded-2xl shadow-sm border border-gray-800 hover:shadow-md transition"
              >

                <h3 className="text-lg font-semibold">
                  {worker.userName}
                </h3>

                <p className="text-green-600 font-medium">
                  {worker.status}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  Clocked In:
                  {" "}
                  {new Date(
                    worker.clockIn.seconds * 1000
                  ).toLocaleTimeString()}
                </p>

              </div>
            ))}

          </div>

        )}

      </motion.div>

    </div>

  </DashboardLayout>
  );
 }

 export default ManagerPage;
