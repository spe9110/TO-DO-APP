import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBan } from "react-icons/fa6";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-700 gap-6">
      <h1 className="text-4xl font-bold flex justify-between items-center gap-2">
        <FaBan />
        <span>Unauthorized</span>
        </h1>
      <p className="text-lg text-center">
        You do not have permission to view this page or your session is not authorized.
      </p>

      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          onClick={() => navigate("/")}
        >
          Go to Home
        </button>
        <button
          className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;