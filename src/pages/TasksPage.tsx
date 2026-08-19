import { useEffect, useState } from "react";

import DashboardLayout from "../components/layout/DashboardLayout";
import TaskForm from "../components/TaskForm";

import { firestore } from "../firebase/firebase";

import { auth } from "../firebase/firebase";

import {
  collection,
  onSnapshot,
  query,
  where,
  updateDoc,
  doc
} from "firebase/firestore";
import { motion } from "framer-motion";
import type { Role, Task, Worker } from "../types/models";

interface TasksPageProps {
  role: Role | null;
}

function TasksPage({ role }: TasksPageProps) {

  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const [workers, setWorkers] = useState<Worker[]>([]);

  const user = auth.currentUser;

  //managers get a worker list so they can assign tasks from here
  useEffect(() => {

    if (role !== "manager") return;

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
    });

    return () => unsubscribe();

  }, [role]);

  useEffect(() => {

    if (!user) return;

    const tasksRef = collection(
      firestore,
      "tasks"
    );

    let q;

    // manager sees all tasks
    if (role === "manager") {

      q = query(tasksRef);

    } else {

      // worker only sees their tasks
      q = query(
        tasksRef,
        where("assignedTo", "==", user.uid)
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {

        const taskList: Task[] = [];

        snapshot.forEach((doc) => {

          taskList.push({
            id: doc.id,
            ...(doc.data() as Omit<Task, "id">)
          });

        });

        setTasks(taskList);
      }
    );

    return () => unsubscribe();

  }, [user, role]);

  //Task completion checker
  const handleCompleteTask = async (taskId: string) => {
    try {
      const taskRef = doc(
        firestore,
        "tasks",
        taskId
      );

      await updateDoc(taskRef, {
        status: "completed"
      });
    } catch (error) {
      console.log(error);
    }
  }

  //for clearing tasks
  const handleClearTask = async (taskId: string) => {
    try {
      const taskRef = doc(
        firestore,
        "tasks",
        taskId
      );

      await updateDoc(taskRef, {
        clearedByWorker: true
      });
    } catch (error) {
      console.log(error)
    }
  }

  //hide tasks the worker has cleared, then split by status
  const visibleTasks = tasks.filter((task) => !task.clearedByWorker);
  const activeTasks = visibleTasks.filter((task) => task.status !== "completed");
  const completedTasks = visibleTasks.filter((task) => task.status === "completed");

  const displayedTasks = activeTab === "active" ? activeTasks : completedTasks;

  return (
    <DashboardLayout title="Tasks">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold">
          All Tasks
        </h2>

        {role === "manager" && <TaskForm workers={workers} />}

        {/* TABS */}
        <div className="flex gap-2 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 font-medium border-b-2 transition cursor-pointer ${
              activeTab === "active"
                ? "border-[#ff9f0a] text-white"
                : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            Active ({activeTasks.length})
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 font-medium border-b-2 transition cursor-pointer ${
              activeTab === "completed"
                ? "border-[#ff9f0a] text-white"
                : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            Completed ({completedTasks.length})
          </button>
        </div>

        {displayedTasks.length === 0 ? (
          <p>
            {activeTab === "active"
              ? "No active tasks"
              : "No completed tasks"}
          </p>
        ) : (
          displayedTasks.map((task) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              key={task.id}
              className="bg-[#1c1c1e] p-5 rounded-2xl shadow-sm border border-gray-800 overflow-hidden w-full"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 min-w-0">

                <div className="flex-1 min-w-0">

                  <h3 className="text-xl font-semibold wrap-break-word">
                    {task.title}
                  </h3>

                  <p className="text-gray-500 mt-1 break-all">
                    {task.description}
                  </p>

                  <div className="mt-4 space-y-1">
                    <p className="text-sm">
                      Assigned To:{" "}

                      <span className="font-medium">
                        {task.assignedToName}
                      </span>
                    </p>

                    <p>
                      Status:{" "}

                      <span
                        className={
                          task.status === "completed"
                            ? "text-green-600 font-medium"
                            : "text-yellow-600 font-medium"
                        }
                      >
                        {task.status}
                      </span>
                    </p>

                  </div>

                </div>

                {role === "worker" && (
                  <>
                    {task.status !== "completed" && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="bg-black text-white px-4 py-2 rounded-xl w-full md:w-auto cursor-pointer"
                      >
                        Complete
                      </button>
                    )}

                    {task.status === "completed" && (
                      <button
                        onClick={() => handleClearTask(task.id)}
                        className="cursor-pointer bg-[#ff9f0a] px-4 py-2 rounded-xl w-full md:w-auto"
                      >
                        Clear
                      </button>
                    )}
                  </>
                )}

              </div>
            </motion.div>
          ))
        )}
      </div>

    </DashboardLayout>
  )
}

export default TasksPage;
