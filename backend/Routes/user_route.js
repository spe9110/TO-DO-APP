import express from "express";
import { getAllUsers, getCurrentUser, getSingleUser, updateProfile, deleteAccount } from "../Controllers/user_controller.js";
import { userAuth } from "../Middlewares/authenticate.js";
import { authForRoles } from "../Middlewares/authorize.js";

const router = express.Router();

// @desc Get all users
// @route GET /api/v1/users
// @access Private
router.get("/", userAuth, authForRoles("admin"), getAllUsers);

// @desc Get current logged-in user
// @route GET /api/v1/users/current
// @access Private
router.get("/current", userAuth, getCurrentUser);

// @desc Get single user by ID
// @route GET /api/v1/users/:id
// @access Private
router.get("/:id", userAuth, authForRoles(["user", "admin"]), getSingleUser);

// @desc Update user profile
// @route PUT /api/V1/users/update/:id
// @access Private
router.put("/update/:id", userAuth, authForRoles(["user", "admin"]), updateProfile);

// @desc Delete user account
// @route DELETE /api/users/:id
// @access Private
router.delete("/delete/:id", userAuth, authForRoles(["user", "admin"]), deleteAccount);

export default router;  
