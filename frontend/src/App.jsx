import { Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Signin from "./pages/Signin"
import Signup from "./pages/Signup"
import Unauthorized from "./pages/Unauthorized"
import Layout from "./components/Layout"
import PrivateRoute from "./components/PrivateRoute"
import ErrorBoundary from "./components/ErrorBoundary"
import ResetPassword from "./pages/ResetPassword"
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import PageNotFound from "./components/PageNotFound"
import { CookiesBanner } from "./components/CookieConsent"

function App() {

  return (
    <div>
      <ErrorBoundary >
        <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick theme="colored" />
        {/* Here where to add the cookies banner */}
        <CookiesBanner />
        <Routes>
          {/* Public Routes */}
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="*" element={<PageNotFound />} />
            </Route>
          </Route>
        </Routes>
      </ErrorBoundary>      
    </div>
  )
}

export default App