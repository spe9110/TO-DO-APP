import User from "../Models/user.model.js";
import { registerAccountSchema } from "../Validation/registerAccount.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { loginAccountSchema } from "../Validation/loginAccount.js";
// import { transporter } from "../Config/transporter.js";
// import { sendEmail } from "../Utils/resend.js";
import { emailQueue } from "../Utils/emailQueue.js";
import { loadTemplate } from "../Utils/template.js";
import logger from "../Config/logging.js";
// import { EMAIL_USER } from "../Config/keys.js";


// @desc Create new user
// @route POST /api/auth/register
// @access Public
export const register = async (req, res, next) => {
    try {
        logger.info("createAccount - start", { route: req.originalUrl, method: req.method, body: req.body });

        // step 1 - Validate the request body
        const { error } = registerAccountSchema.validate(req.body, { abortEarly: false });
        if (error) {
            logger.warn("createAccount - validation failed", { error: error.details[0].message });
            return res.status(400).json({ error: error.details[0].message})
        }
        // step 2 - Get data from request body
        const { firstName, lastName, email, password, confirm_password, role } = req.body;

        // step 3 - Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.warn("createAccount - user already exists", { email });
            return next(new Error('User already exists'));
        }
        // step 4 - Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // step 5 - Create a new user
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            role: role || 'user',
            password: hashedPassword
        })
        // await transporter.sendMail(mailOptions);

        // Send welcome email (background)
        emailQueue.add({
          to: newUser.email,
          firstName: newUser.firstName
        }).then(() => {
          logger.log("📩 Email job added to queue");
        }).catch(err => {
          logger.error("❌ Failed to add email job", err.message);
        });

        // step 6 - remove password from the response
        const newUserResponse = {
            _id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            role: newUser.role
        }

        logger.info("createAccount - user created successfully", { userId: newUser._id, email: newUser.email });
        // step 7 - return the response
        return res.status(201).json({ success: true, message: "User created successfully", user: newUserResponse });

    } catch (error) {
        logger.error("createAccount - error", { error: error.message });
        return next({ status: 500, success: false, message: error.message });
    }
}

// @desc Login user
// @route POST /api/auth/login
// @access Public
export const login = async (req, res, next) => {
    try {
        logger.info("login - start", {
            route: req.originalUrl,
            method: req.method,
            body: { ...req.body, password: "[REDACTED]" }, // never log passwords
        });

        // Validate input
        const { error } = loginAccountSchema.validate(req.body, { abortEarly: false });
        if (error) {
            logger.warn("login - validation failed", { error: error.details[0].message });
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            logger.warn("login - user not found", { email });
            return next(new Error("Invalid credentials"));
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn("login - wrong password", { email, userId: user._id });
            return next(new Error("Invalid credentials"));
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            logger.error("login - JWT_SECRET missing");
            return res.status(500).json({
                success: false,
                message: "JWT secret not configured",
            });
        }

        // Generate JWT
        const accessToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            secret,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        // FIXED: Correct variable name
        res.cookie("AccessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 3600000, // 1 hour
        });

        logger.info("login - success", {
            userId: user._id,
            email: user.email,
        });

        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            accessToken,
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        });

    } catch (error) {
        logger.error("login - error", { error: error.message });
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc Logout user
// @route POST /api/auth/logout
// @access Public
export const logout = async (req, res, next) => {
    try {
        logger.info("logout - start", {
            route: req.originalUrl,
            method: req.method,
            userId: req.user?.id || "unknown",
        });

        res.clearCookie("AccessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
        });

        logger.info("logout - success", {
            userId: req.user?.id || "unknown",
        });

        return res.status(200).json({ success: true, message: "User logged out successfully" });

    } catch (error) {
        logger.error("logout - error", { error: error.message });
        return next({ status: 500, success: false, message: error.message });
    }
};

// send verification OTP to the user's email and hash it before saving to the database
// @desc Send OTP verification email
// @route POST /api/auth/send-otp-verify
// @access Private
export const sendOtpVerificationEmail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    logger.info("sendOtpVerificationEmail - start", { userId });

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
        logger.warn("sendOtpVerificationEmail - user not found", { userId });
        return next({ status: 404, message: "User not found" });
    }

    if (user.isAccountVerified) {
        logger.warn("sendOtpVerificationEmail - account already verified", { userId });
        return next({ status: 400, message: "Account is already verified." });
    }

    // Generate and hash OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Hash OTP using bcrypt (auto-salt)
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save OTP and expiration
    user.verifyOtp = hashedOtp;
    user.verifyOtpExpireAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await user.save();

    logger.info("sendOtpVerificationEmail - OTP saved successfully", { userId, hashedOtp });
    
    const year = new Date().getFullYear();
    // Load template
    const otpTemplate = loadTemplate("otpVerify.html", {
      name: user.firstName + ' ' + user.lastName,
      email: user.email,
      otp: otp,
      year: year
    });

    // Send mail
    const mailOptions = {
      from: {
        name: "Spencer Wawaku",
        address: EMAIL_USER,
      },
      to: user.email,
      subject: "Verify your account - To Do App",
      html: otpTemplate,
    };

    await transporter.sendMail(mailOptions);

    // Email sending commented out, but can log intent
    logger.info("sendOtpVerificationEmail - OTP email ready to send", { userEmail: user.email });

    return res.status(200).json({ success: true, message: "Verification email sent successfully." });

  } catch (error) {
    console.error(error);
    return next({ status: 500, success: false, message: error.message });
  }
};

// ---------------------------
// Verify Email with OTP
// ---------------------------
export const verifyEmail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { otp } = req.body;

    logger.info("verifyEmail - start", { userId });

    // Validate input
    if (!otp) {
      logger.warn("verifyEmail - OTP missing", { userId });
      return next({ status: 400, message: "OTP is required." });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      logger.warn("verifyEmail - user not found", { userId });
      return next({ status: 404, message: "User not found" });
    }

    if (user.isAccountVerified) {
      logger.warn("verifyEmail - account already verified", { userId });
      return next({ status: 400, message: "Account already verified." });
    }

    // Check OTP existence
    if (!user.verifyOtp || !user.verifyOtpExpireAt) {
      logger.warn("verifyEmail - OTP missing", { userId });
      return next({ status: 400, message: "No OTP found. Please request a new one." });
    }

    // Check expiration
    if (user.verifyOtpExpireAt < Date.now()) {
      logger.warn("verifyEmail - OTP expired", { userId });
      return next({ status: 400, message: "OTP has expired. Please request a new one." });
    }

    // Compare OTP with hashed OTP
    const isValidOtp = await bcrypt.compare(otp, user.verifyOtp);
    if (!isValidOtp) {
      logger.warn("verifyEmail - invalid OTP", { userId });
      return next({ status: 400, message: "Invalid OTP." });
    }

    // Mark account as verified
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();
    logger.info("verifyEmail - account verified successfully", { userId });

    // Prepare user data
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isAccountVerified: user.isAccountVerified,
    };

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      userData,
    });

  } catch (error) {
    logger.error("verifyEmail - error", { error: error.message });
    return next({ status: 500, message: error.message });
  }
};

// ---------------------------
// Send Password Reset OTP
// ---------------------------
export const passwordResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    logger.info("PasswordResetEmail - start", { email });

    if (!email) {
      logger.warn("PasswordResetEmail - email not provided");
      return next({ status: 400, message: "Email is required." });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("PasswordResetEmail - user not found", { email });
      return next({ status: 404, message: "User not found." });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP (best practice: bcrypt.compare for validation later)
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Save hashed OTP and expiration
    user.resetOtp = hashedOtp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save();
    logger.info("PasswordResetEmail - OTP hashed & saved", { email });


    // Send email notification

    const year = new Date().getFullYear();

    // Load HTML template
    const resetTemplate = loadTemplate("resetPasswordOtp.html", {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      otp: otp,
      year: year,
    });

    const mailOptions = {
      from: {
        name: "Spencer Wawaku",
        address: EMAIL_USER,
      },
      to: user.email,
      subject: "Reset your password - To Do App",
      html: resetTemplate,
    };

    await transporter.sendMail(mailOptions);

    logger.info("PasswordResetEmail - OTP email sent", { email });

    return res.status(200).json({
      success: true,
      message: "A password reset OTP has been sent to your email.",
    });

  } catch (error) {
    logger.error("PasswordResetEmail - error", { error: error.message });
    return next({ status: 500, message: error.message });
  }
};

// ---------------------------
// Reset Password
// ---------------------------
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    logger.info("resetPassword - start", { email });

    if (!email || !otp || !newPassword) {
      logger.warn("resetPassword - missing parameters", { email });
      return next({
        status: 400,
        message: "Email, OTP, and new password are required.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("resetPassword - user not found", { email });
      return next({ status: 404, message: "User not found." });
    }

    // OTP missing
    if (!user.resetOtp || !user.resetOtpExpireAt) {
      logger.warn("resetPassword - OTP missing", { email });
      return next({ status: 400, message: "No OTP found. Please request a new one." });
    }

    // OTP expired
    if (user.resetOtpExpireAt < Date.now()) {
      logger.warn("resetPassword - OTP expired", { email });
      return next({ status: 400, message: "OTP has expired." });
    }

    // Compare hashed OTP
    const isValidOtp = await bcrypt.compare(otp, user.resetOtp);
    if (!isValidOtp) {
      logger.warn("resetPassword - invalid OTP", { email, otp });
      return next({ status: 400, message: "Invalid OTP." });
    }

    // Reset password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    logger.info("resetPassword - password reset successfully", { email });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });

  } catch (error) {
    logger.error("resetPassword - error", { error: error.message });
    next(error);
  }
};

