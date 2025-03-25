import Homepage from './pages/home/HomePage';
import LoginPage from './pages/auth/login/LoginPage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import Sidebar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import { Navigate } from 'react-router-dom';

import {Toaster} from 'react-hot-toast';
import {Route, Routes} from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import LoadingSpinner from './components/common/LoadingSpinner';


function App() {

  const {data:authUser, isLoading} = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {

        const res = await fetch ("/api/auth/me");
        const data = await res.json();
        if(data.error) return null; //fix for logout not working, because invalidateQueries returns not expected value if user is not auuthorized so our ? checks wont recognize it;
        if(!res.ok) throw new Error (data.error || "Somethign went wrong");
        console.log("atuhUser is here : " , data);
        return data;

      } catch (error) {
        throw new Error(error);
      }
    },
    retry:false,
  })
 
  if(isLoading) {
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size= 'lg' />
      </div>
    )
  }
 
  return (
    <>
    <div className='flex max-w-6xl mx-auto'>
     {authUser && <Sidebar /> }  {/* COMMON COMPONENT, because it is not wrapped with ROUTES */}
      <Routes>
        <Route path="/" element={ authUser ?   <Homepage/> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage/> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage/> : <Navigate to="/" />} />
        <Route path='/notifications' element={ authUser ?  <NotificationPage /> : <Navigate to="/login" />} /> 
        <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} /> 
      </Routes>
      {authUser && <RightPanel />}
      <Toaster />
    </div>
 
    </>
  )
}

export default App
