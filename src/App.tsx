import './App.css'


import { useEffect, useState } from 'react';
import { useAuthState} from 'react-firebase-hooks/auth';
import { auth, firestore } from './firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import SignIn from './components/SignIn';
import WorkerPage from './pages/WorkerPage';
import RoleSelect from './components/RoleSelect'
import ManagerPage from './pages/ManagerPage';
import ProtectedRoute from './routes/ProtectedRoute';
import TasksPage from './pages/TasksPage';
import SessionsPage from './pages/SessionsPage';
import LoadingSpinner from './components/LoadingSpinner';
import type { Role, UserDoc } from './types/models';

function App() {

  const [user, authLoading] = useAuthState(auth);

  const [role, setRole] = useState<Role | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);
  //tracks whether the user has confirmed a role for this login session
  const [roleConfirmed, setRoleConfirmed] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {

      if (!user) {
        setRole(null);
        setRoleConfirmed(false);
        setLoadingRole(false);
        return;
      } try {
        //refers to user doc
        const userRef = doc(firestore, "users", user.uid);

        //fetch doc
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()){
          //get role field
          setRole((userSnap.data() as UserDoc).role);
        }
      } catch (error){
        console.log(error)
      }

      //always re-prompt for a role on login
      setRoleConfirmed(false);
      setLoadingRole(false);
    };

    fetchRole();

  }, [user]);

  if(authLoading){
    return <LoadingSpinner />;
  }

  //if user isnt signed in
  if (!user) {
    return <SignIn />;
  }

  //load database
  if (loadingRole) {
    return (
      <div className='min-h-screen bg-[#000000] flex items-center justify-center'>
        <div className='flex  flex-col items-center gap-4'>
          <div className='w-12 h-12 border-4 border-gray-700 border-t-[#ff9f0a] rounded-full animate-spin'>
            <p className='text-gray-400'>
              Loading WorkTracker...
            </p>
          </div>

        </div>
      </div>
    )
  }

  //always confirm the role on login
  if (!roleConfirmed) {
    return (
      <RoleSelect
        user={user}
        onRoleConfirmed={(confirmedRole) => {
          setRole(confirmedRole);
          setRoleConfirmed(true);
        }}
      />
    );
  }

  return(
    <BrowserRouter>
      <Routes>

        {/*Login*/}
        <Route
          path="/"
          element={
            !user
            ? <SignIn />
            : <Navigate to={`/${role}`} />
          }
        />

        {/*Worker*/}
        <Route
          path="/worker"
          element={
            <ProtectedRoute
              user={user}
              role={role}
              allowedRole="worker">
              <WorkerPage />
            </ProtectedRoute>
          }
        />

        {/*Manager*/}
        <Route
          path="/manager"
          element={
            <ProtectedRoute
              user={user}
              role={role}
              allowedRole="manager">
              <ManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute
              user={user}
              role={role}
            >
              <TasksPage role={role} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sessions"
          element={
            <ProtectedRoute
              user={user}
              role={role}
            >
              <SessionsPage />
            </ProtectedRoute>
          }
        />
      </Routes>

    </BrowserRouter>
  )
}



export default App
