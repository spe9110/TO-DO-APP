import { configureStore } from "@reduxjs/toolkit";
import authReducer from './Slice/authSlice'
import { apiSlice } from "./Slice/apiSlice";

const store = configureStore({
    reducer: {
      auth: authReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true, // Enable Redux DevTools for debugging
});

export default store;