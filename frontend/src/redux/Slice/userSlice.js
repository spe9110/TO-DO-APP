import { apiSlice } from "./apiSlice";

const USERS_URL = '/api/v1';

export const userSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        register : builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/auth/users/register`,
                method: "POST",
                body: data
            }),
            invalidatesTags: ["Users"],
        }),
        login : builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/auth/users/login`,
                method: "POST",
                body: data
            }),
            invalidatesTags: ["Users"],
        }),
        logout : builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/auth/users/logout`,
                method: "POST",
                body: data
            }),
            invalidatesTags: ["Users"],
        }),
        fetchCurrentUser: builder.query({
            query: () => ({
                url: `${USERS_URL}/users/current?ts=${Date.now()}`,
                method: "GET",
            }),
            providesTags: ["Users"],
        }),
        sendResetPassword : builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/auth/users/send-reset-password`,
                method: 'POST',
                body: data,
            }),
        }),
        ResetPassword : builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/auth/users/reset-password`,
                method: 'POST',
                body: data,
            }),
        }),
    })
});

export const { useRegisterMutation, useLoginMutation, useLogoutMutation, useFetchCurrentUserQuery, useSendResetPasswordMutation, useResetPasswordMutation } = userSlice;