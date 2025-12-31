import express from 'express';
import { 
    register, 
    login, 
    logout,
    sendOtpVerificationEmail,
    verifyEmail,
    passwordResetEmail,
    resetPassword
 } from '../Controllers/auth_controller.js';
import { userAuth } from '../Middlewares/authenticate.js';

const router = express.Router();

// @desc This route is used for user registration
// @endpoint router.post('/api/v1/auth/users/login', login);
// @access Public
router.post('/register', register);

// @desc This route is used for user login
// @endpoint router.post('/api/v1/auth/users/login', login);
// @access Public
router.post('/login', login);

// @desc This route is used for user logout
// @endpoint router.post('/api/v1/auth/users/logout', logout);
// @access Public
router.post('/logout', logout);

// @desc This route is used for sending OTP verification email
// @endpoint post('/api/v1/auth/send-otp-verify', sendOtpVerificationEmail);
// @access Private
router.post('/send-otp-verify', userAuth, sendOtpVerificationEmail)

// @desc This route is used for verifying OTP code
// @endpoint post('/api/v1/auth/verify-otp', verifyEmail);
// @access Private
router.post('/verify-otp', userAuth, verifyEmail);

// @desc This route is used for sending password reset email
// @endpoint router.post('/api/v1/auth/send-reset-password', PasswordResetEmail);
// @access Public
router.post('/send-reset-password', passwordResetEmail);

// @desc This route is used for resetting user password
// @endpoint router.post('/api/v1/auth/reset-password', resetPassword);
// @access Public
router.post('/reset-password', resetPassword);

export default router;