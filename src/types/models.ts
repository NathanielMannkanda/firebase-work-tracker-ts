import type { Timestamp } from "firebase/firestore";

export type Role = "worker" | "manager";

// Shapes below reflect documents as they come back from Firestore reads
// (`snap.data()`); writes go through the untyped `addDoc`/`setDoc`/`updateDoc`
// calls and aren't checked against these.

export interface UserDoc {
  name: string | null;
  email: string | null;
  role: Role | null;
  createdAt: Timestamp;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type TaskStatus = "pending" | "completed";

export interface TaskDoc {
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  status: TaskStatus;
  clearedByWorker: boolean;
  createdAt: Timestamp;
}

export interface Task extends TaskDoc {
  id: string;
}

export type SessionStatus = "active" | "completed";

export interface WorkSessionDoc {
  userId: string;
  userName: string | null;
  status: SessionStatus;
  clockIn: Timestamp;
  clockOut: Timestamp | null;
}

export interface WorkSession extends WorkSessionDoc {
  id: string;
}
