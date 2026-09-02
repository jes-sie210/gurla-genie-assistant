import { useCallback, useEffect, useState } from "react";

export type Priority = "High" | "Medium" | "Low";

export type Task = {
  id: string;
  title: string;
  deadline: string;
  durationMinutes: number;
  priority: Priority;
  notes: string;
  done: boolean;
};

const STORAGE_KEY = "gurla-genie-tasks";

const SEED: Task[] = [
  {
    id: "seed-1",
    title: "Finish Q3 client report",
    deadline: "",
    durationMinutes: 90,
    priority: "High",
    notes: "Needs the updated revenue numbers",
    done: false,
  },
  {
    id: "seed-2",
    title: "Prep for Thursday leadership meeting",
    deadline: "",
    durationMinutes: 45,
    priority: "Medium",
    notes: "Three talking points + one ask",
    done: false,
  },
  {
    id: "seed-3",
    title: "Tidy inbox and reply to recruiter",
    deadline: "",
    durationMinutes: 30,
    priority: "Low",
    notes: "",
    done: false,
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(SEED);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setTasks(JSON.parse(raw) as Task[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      /* ignore */
    }
  }, [tasks, hydrated]);

  const addTask = useCallback((task: Omit<Task, "id" | "done">) => {
    setTasks((prev) => [
      ...prev,
      { ...task, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, done: false },
    ]);
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  return { tasks, hydrated, addTask, removeTask, toggleTask, setTasks };
}
