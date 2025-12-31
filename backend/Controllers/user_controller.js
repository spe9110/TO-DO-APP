import User from "../Models/user.model.js";
import cache from "../Config/cache.js";
import logger from "../Config/logging.js";


//@route   GET /api/v1/users
//@desc    Get all users with caching
//@access  PRIVATE
export const getAllUsers = async (req, res, next) => {
  try {
    const cacheKey = "all_users"; // unique string key for caching this data

    // ✅ 1. Check if data exists in cache
    if (cache.has(cacheKey)) {
      logger.info("Users retrieved from cache", {
        requestedBy: req.user?.id || "anonymous",
      });

      const cachedData = cache.get(cacheKey);

      return res.status(200).json({
        message: "Users fetched successfully (from cache)",
        count: cachedData.count,
        data: cachedData.data,
      });
    }

    // ✅ 2. Fetch data from the database if not cached excluding admin
    const users = await User.find({ role: { $ne: "admin" } }).select("-password");

    if (!users || users.length === 0) {
      logger.warn("No users found in database", {
        requestedBy: req.user?.id || "anonymous",
      });
      return next({ status: 404, message: "No users found" });
    }

    const usersTotal = await User.countDocuments();

    const result = {
      count: usersTotal,
      data: users,
    };

    // ✅ 3. Cache the result
    cache.set(cacheKey, result);

    logger.info("Users fetched from DB and cached successfully", {
      count: users.length,
      requestedBy: req.user?.id || "anonymous",
    });

    // ✅ 4. Return response
    res.status(200).json({
      message: "Users fetched successfully (from DB)",
      ...result,
    });
  } catch (error) {
    logger.error("Error fetching users", { error });
    next({ status: 500, error });
  }
};


// @route  GET api/users/current
// @desc  Return current user with caching
// @access  Private
export const getCurrentUser = async (req, res, next) => {
  try {
    // Ensure authentication middleware has attached req.user
    if (!req.user) {
      logger.warn("Unauthorized attempt to access current user");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const cacheKey = `current_user_${req.user.id}`; // unique cache key for each user

    // ✅ 1. Check cache first
    if (cache.has(cacheKey)) {
      logger.info("Current user retrieved from cache", { userId: req.user.id });

      const cachedUser = cache.get(cacheKey);
      return res.status(200).json({ message: "User fetched successfully", source: "cache", user });
    }

    // ✅ 2. Fetch fresh user data
    // If req.user is from JWT, it’s already populated. But let’s re-fetch from DB for latest data.
    const userDb = await User.findById(req.user?.id).select("-password");

    if (!userDb) {
      logger.warn("User not found", { userId: req.user.id });
      return next({ status: 404, message: "User not found" });
    }

    const user = {
        id: userDb._id,
        firstName: userDb.firstName,
        lastName: userDb.lastName,
        email: userDb.email,
        role: userDb.role,
        isAccountVerified: userDb.isAccountVerified,
    };

    // ✅ 3. Cache the user data for quick retrieval next time
    cache.set(cacheKey, user, 60);

    logger.info("Current user fetched from DB and cached", { userId: req.user.id });

    // ✅ 4. Return response
    res.status(200).json({success: true, message: "User fetched successfully", source: "db", user });
  } catch (error) {
    logger.error("Error fetching current user", { error });
    next({ status: 500, message: "Server error", error });
  }
};

// @route  GET api/v1/user/:id
// @desc   Return user by id (with caching)
// @access Private
export const getSingleUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    logger.info("Fetching single user", {
      requestedId: id,
      requestedBy: req.user?.id || "anonymous",
    });

    const cacheKey = `user_${id}`; // ✅ cleaner cache key

    // ✅ 1. Check cache first
    if (cache.has(cacheKey)) {
      const cachedUser = cache.get(cacheKey);

      logger.info("User retrieved from cache", { userId: id });

      return res.status(200).json({
        message: "User fetched successfully (from cache)",
        user: cachedUser,
      });
    }

    // ✅ 2. Fetch from DB if not in cache
    const user = await User.findById(id).select("-password");

    if (!user) {
      logger.warn("User not found", { id });
      return next({ status: 404, message: "User not found" });
    }

    logger.info("User fetched successfully (from DB)", { id });

    // ✅ 3. Store in cache (for faster future requests)
    cache.set(cacheKey, user, 600); // 600 sec = 10 min TTL (optional but recommended)

    return res.status(200).json({
      message: "User fetched successfully (from DB)",
      user,
    });
  } catch (error) {
    logger.error("Error fetching user by ID", { error, id: req.params.id });
    next({ status: 500, message: "Internal Server Error" });
  }
};

// @desc Update user profile
// @route PUT /api/users/:id
// @access Private
export const updateProfile = async (req, res, next) => {
    try {
        const { id } = req.params;
        logger.info(`UPDATE_ACCOUNT request received for user ID: ${id}`);

        const { firstName, lastName } = req.body;

        // Ensure user is updating their own account
        if (id !== req.user.id) {
            logger.warn(`Unauthorized update attempt by user ${req.user.id} on user ${id}`);
            return next({ status: 403, message: "Unauthorized" });
        }

        const user = await User.findById(id);
        if (!user) {
            logger.warn(`No user found with ID: ${id}`);
            return next({ status: 404, message: "No user found" });
        }

        // Only update allowed fields
        const updates = {};
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );
        // Remove sensitive fields before sending
        const { password, verifyOtp, resetOtp, ...safeUser } =
            updatedUser.toObject();

        return res.status(200).json({
            message: "User updated successfully",
            data: safeUser,
        });
    } catch (error) {
        logger.error(`Error updating user account: ${error.message}`);
        return next({
            status: 500,
            message: error.message,
        });
    }
};



// @desc This API is used to delete a user profile
// endpoint app.delete() 
// access PRIVATE
export const deleteAccount = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info(`DELETE_ACCOUNT request received for user ID: ${id}`);

    // Check if user is admin OR deleting their own account
    const isAdmin = req.user.role === "admin";
    const isOwner = req.user.id === id;

    if (!isAdmin && !isOwner) {
      logger.warn(`Unauthorized delete attempt by user ${req.user.id} on user ${id}`);
      return next({ status: 403, message: "Unauthorized" });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      logger.warn(`No user found with ID: ${id}`);
      return next({ status: 404, message: "No user found" });
    }

    logger.info(`User with ID: ${id} deleted successfully`);
    return res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    logger.error(`Error deleting user ID ${req.params.id}: ${error.message}`);
    return next({ status: 500, message: error.message });
  }
};
