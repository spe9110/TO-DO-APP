import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../Slice/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://to-do-app-kpx0.onrender.com",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.userData?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Wrapper to catch expired tokens
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result?.error?.status === 401) {
    console.warn("⚠️ Unauthorized: logging out user...");
    // Optional but recommended:
    api.dispatch(logout());
    // api.dispatch(apiSlice.util.resetApiState());

  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({}),
});
