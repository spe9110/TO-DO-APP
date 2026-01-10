import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom"

const Home = lazy(() => import("./pages/Home"));
const Signin = lazy(() => import("./pages/Signin"));
const Signup = lazy(() => import("./pages/Signup"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const Layout = lazy(() => import("./components/Layout"));
const PrivateRoute = lazy(() => import("./components/PrivateRoute"));
const ErrorBoundary = lazy(() => import("./components/ErrorBoundary"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PageNotFound = lazy(() => import("./components/PageNotFound"));
const Loader = lazy(() => import("./components/Loader"));

import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { CookiesBanner } from "./components/CookieConsent" 


function App() {

  return (
    <Suspense fallback={<Loader />}>
      <ErrorBoundary >
        <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick theme="colored" />
        {/* Here where to add the cookies banner */}
        <CookiesBanner />
        <Routes>
          {/* Public Routes */}
          <Route path="signin" element={<Signin />} />
          <Route path="signup" element={<Signup />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="*" element={<PageNotFound />} />
            </Route>
          </Route>
        </Routes>
      </ErrorBoundary>      
    </Suspense>
  )
}

export default App

// npm install --save gh-pages
// Sans Suspense = écran blanc garanti