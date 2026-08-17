import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import ProfileCard from "../ProfileCard";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

function DashboardLayout({ children, title}: DashboardLayoutProps){

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.log(error);
    }
  };

  return(
    <div className="min-h-screen flex bg-[#111111] text-white">

      {/*Mobile overlay*/}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
        />
      )}

      {/*Sidebar*/}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#1c1c1e] border-r border-gray-800 shadow-sm transform transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            WorkTracker
          </h1>

          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white cursor-pointer text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <ProfileCard />

        <nav className="p-4 space-y-2">

          <Link
            to="/worker"
            onClick={() => setSidebarOpen(false)}
            className="block w-full text-left p-3 rounded-xl hover:bg-[#ff9f0a] hover:text-black transition"
          >
            Dashboard
          </Link>

          <Link
            to="/sessions"
            onClick={() => setSidebarOpen(false)}
            className="block w-full text-left p-3 rounded-xl hover:bg-[#ff9f0a] hover:text-black transition"
          >
            Sessions
          </Link>

          <Link
            to="/tasks"
            onClick={() => setSidebarOpen(false)}
            className="block w-full text-left p-3 rounded-xl hover:bg-[#ff9f0a] hover:text-black transition"
          >
            Tasks
          </Link>

        </nav>

        {/*Logout*/}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full bg-[#ff9500] hover:opacity-90 text-white py-3 rounded-xl font-medium cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/*Main */}
      <main className="flex-1 min-w-0">

        {/*TopBar*/}
        <header className="bg-[#1c1c1e] border-gray-800 border-b px-4 md:px-8 py-4 shadow-sm flex items-center gap-4">

          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-2xl text-gray-400 hover:text-white cursor-pointer leading-none"
          >
            ☰
          </button>

          <h2 className="text-xl md:text-2xl font-semibold truncate">
            {title}
          </h2>
        </header>

        {/*Page Content*/}
        <div className="p-4 md:p-8">
          {children}
        </div>

      </main>

    </div>
  );
}

export default DashboardLayout;
