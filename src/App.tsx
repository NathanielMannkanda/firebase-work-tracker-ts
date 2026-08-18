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
import { Role, type UserDoc } from './types/models';

function App() {

  const [user, authLoading] = useAuthState(auth);

  const [registeredRole, setRegisteredRole] = useState<Role | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null)
  const [loadingRole, setLoadingRole] = useState(true);
  //tracks whether the user has confirmed a role for this login session
  const [roleConfirmed, setRoleConfirmed] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {

      if (!user) {
        setRegisteredRole(null);
        setActiveRole(null);
        setRoleConfirmed(false);
        setLoadingRole(false);
        return;
      } try {
        const userRef = doc(firestore, "users", user.uid);

        //fetch doc
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()){
          //get role field
          const userData = userSnap.data() as UserDoc;
          setRegisteredRole(userData.role);
        } else {
          setRegisteredRole(null);
        }
      } catch (error){
        console.log(error)
      }

      //always re-prompt for a role on login
      setActiveRole(null)
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
        baseRole={registeredRole}
        onRoleConfirmed={(confirmedRole) => {
          setActiveRole(confirmedRole);
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
            : <Navigate to={`/${activeRole}`} />
          }
        />

        {/*Worker*/}
        <Route
          path="/worker"
          element={
            <ProtectedRoute
              user={user}
              role={activeRole}
              allowedRole={Role.Worker}>

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
              role={activeRole}
              allowedRole={Role.Manager}>
              <ManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tasks"
          element={
            <ProtectedRoute
              user={user}
              role={activeRole}
            >
              <TasksPage role={activeRole} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sessions"
          element={
            <ProtectedRoute
              user={user}
              role={activeRole}
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
