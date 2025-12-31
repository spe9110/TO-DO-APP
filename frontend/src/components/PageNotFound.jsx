import React from 'react'
import { Link } from 'react-router-dom'

const PageNotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-6">
      <div className="text-center max-w-md">
        {/* Big 404 */}
        <h1 className="text-8xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">
          404
        </h1>

        {/* Message */}
        <h2 className="mt-4 text-2xl font-semibold">
          Page Not Found
        </h2>
        <p className="mt-3 text-gray-400">
          Sorry, the page you’re looking for doesn’t exist or has been moved.
        </p>

        {/* Divider */}
        <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-gray-600 to-transparent" />

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          {/* If using react-router */}
          
          <Link
            to="/"
            className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition font-medium"
          >
            Go Home
          </Link>
         

          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 rounded-lg border border-gray-600 hover:border-gray-400 transition font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default PageNotFound
