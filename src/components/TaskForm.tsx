import { useState, type FormEvent } from "react";

import {
  collection,
  addDoc,
  serverTimestamp
 } from "firebase/firestore";

import { firestore } from "../firebase/firebase";
import { motion } from "framer-motion";
import type { Worker } from "../types/models";

interface TaskFormProps {
  workers: Worker[];
}

function TaskForm({ workers }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");
  const [createTask, setCreatingTask]  = useState(false)

  //for popup
  const [showPopup, setShowPopup] = useState(false);
  const [assignedWorkerName, setAssignedWorkerName] = useState("");

  //error popup
  const [errorPopup, setErrorPopup] = useState("");

  //loading animations
  //const [creatingTask, setCreatingTask] = useState(false);

  const handleCreateTask = async (e: FormEvent<HTMLFormElement>) => {

    e.preventDefault();

    if (!selectedWorker){
      setErrorPopup("Please select a worker first");

      setTimeout(() => {
        setErrorPopup("");
      }, 3000);

      return;
    }

    const workData = workers.find(
      (worker) => worker.id === selectedWorker
    );

    if (!workData) return;

    try {
      setCreatingTask(true);

      await addDoc(
        collection(firestore, "tasks"),
        {
          title,
          description,
          assignedTo: selectedWorker,
          assignedToName: workData.name,
          status: "pending",
          clearedByWorker:false,
          createdAt: serverTimestamp()
        }
      );

      setAssignedWorkerName(workData.name);
      setShowPopup(true);

      setTimeout(() => {
        setShowPopup(false);
      }, 3000);

      setTitle("");
      setDescription("");
      setSelectedWorker("");

      setCreatingTask(false);

    }catch(error){
      setCreatingTask(false);
      console.log(error);
    }
  };

  return (
    <>
      {errorPopup && (
        <motion.div
          initial={{
            opacity: 0,
            x: 100
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          exit={{
            opacity: 0,
            x: 100
          }}
          transition={{
            duration: 0.3
          }}
          className="fixed top-6 right-4 left-4 md:left-auto md:right-6 max-w-md bg-red-500/10 border border-red-500 text-red-400 px-6 py-4 rounded-2xl shadow-2xl z-50"
        >
          {errorPopup}
        </motion.div>
      )}

      {/*Sucess popup */}
      {showPopup && (
        <motion.div
          initial={{
            opacity: 0,
            x: 100
          }}
          animate={{
            opacity: 1,
            x: 0
          }}
          exit={{
            opacity: 0,
            x: 100
          }}
          transition={{
            duration: 0.3
          }}
          className="fixed top-6 right-4 left-4 md:left-auto md:right-6 max-w-md bg-[#1c1c1c] text-white px-6 py-4 rounded-2xl z-50 animate-fade">
          Task assigned to{" "}
          <span className="font-bold">
            {assignedWorkerName}
          </span>
        </motion.div>
      )}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleCreateTask}
        className="bg-[#1c1c1e] p-6 rounded-2xl shadow-sm border border-gray-800 w-full max-w-300 text-white"
      >
        <h2 className="text-2xl font-bold mb-6">
          Create Task
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-800  rounded-xl p-3"
          />

          <textarea
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-800 rounded-xl p-3 h-28"
          />

          <select
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
            className="w-full rounded-xl p-3 border border-gray-800 bg-[#1c1c1e] text-white"
          >
            <option value="" className="bg-[#1c1c1e] text-white">
              Select Worker
            </option>

            {workers.map((worker) => (
              <option
                key={worker.id}
                value={worker.id}
                className="bg-[#1c1c1e] text-white"
                >
                {worker.name}
              </option>

            ))}

          </select>

          <button
            type="submit"
            disabled={createTask}
            className="bg-[#000000] text-white px-4 py-3 rounded-xl w-full hover:opacity-90 cursor-pointer disabled:opacity-90 disabled:cursor-not-allowed"
          >
            {createTask
              ? "Creating Task..."
              : "Create Task"
            }
          </button>

        </div>

      </motion.form>
    </>
  )
}

export default TaskForm;
