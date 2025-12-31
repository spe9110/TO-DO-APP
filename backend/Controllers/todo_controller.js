import Todo from "../Models/todo.model.js";
import logger from "../Config/logging.js";
import { todoCreationSchema, updateTodoSchema } from "../Validation/todoValidation.js";

// @desc    Get all todos by user
// @route   GET /api/v1/todos
// @access  PRIVATE
export const getAllTodos = async (req, res, next) => {
  try {
    // 1. Authentication check
    if (!req.user?.id) {
      logger.warn("Unauthorized request to get all todos", {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return next({
        status: 401,
        message: "Unauthorized",
      });
    }

    // 2. Pagination results (must be set by middleware)
    if (!res.paginatedResults) {
      return next({
        status: 500,
        message: "Pagination results not found",
      });
    }

    return res.status(200).json({
      source: "database",
      ...res.paginatedResults,
    });
  } catch (error) {
    logger.error("ERROR_GET_ALL_TODOS", {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });

    return next({
      status: 500,
      message: "Failed to fetch todos",
    });
  }
};


// @desc    Get todo by id
// @route   GET /api/v1/todos/:id
// @access  PRIVATE
export const getTodoById = async (req, res, next) => {
  try {
    // 1. Verify authentication
    if (!req.user?.id) {
      logger.warn("Unauthorized request to get todo by ID", {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return next({
        status: 401,
        message: "Unauthorized",
      });
    }

    const { id } = req.params;

    // 2. Fetch from DB
    const todo = await Todo.findOne({
      _id: id,
      userId: req.user.id,
    });

    if (!todo) {
      logger.warn("Todo not found", {
        todoId: id,
        userId: req.user.id,
      });

      return next({
        status: 404,
        message: "Todo not found",
      });
    }

    logger.info("Todo fetched successfully (from DB)", {
      todoId: id,
      userId: req.user.id,
    });

    return res.status(200).json({
      message: "Todo fetched successfully",
      source: "database",
      todo,
    });
  } catch (error) {
    logger.error("ERROR_GET_TODO_BY_ID", {
      message: error.message,
      stack: error.stack,
      todoId: req.params?.id,
      userId: req.user?.id,
    });

    return next({
      status: 500,
      message: "Internal server error",
    });
  }
};


// @desc    Create a new todo
// @route   POST /api/v1/todos
// @access  PRIVATE
export const createTodo = async (req, res, next) => {
  try {
    // 1. Verify authentication
    if (!req.user || !req.user.id) {
      logger.warn("Unauthorized createTodo attempt");
      return next({ status: 401, message: "Unauthorized" });
    }

    logger.info("CREATE_TODO request received", {
      userId: req.user.id,
    });

    // --------------------- VALIDATION ---------------------
    const { error } = todoCreationSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      logger.warn("Todo validation failed", {
        details: error.details,
      });
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    // --------------------- NORMALIZE DATA ---------------------
    const title = req.body.title.trim();

    // --------------------- CHECK DUPLICATE ---------------------
    const existingTodo = await Todo.findOne({
      userId: req.user.id,
      title,
    });

    if (existingTodo) {
      logger.warn("Duplicate todo detected", {
        userId: req.user.id,
        title,
      });
      return res.status(400).json({
        message: "Todo with this title already exists",
      });
    }

    // --------------------- CALCULATE ORDER ---------------------
    const lastTodo = await Todo.findOne({ userId: req.user.id })
      .sort({ order: -1 })
      .select("order");

    // const nextOrder = lastTodo ? lastTodo.order + 1 : 0;
    // we add a guard in case corrupted data exists
    const nextOrder =
  lastTodo && Number.isFinite(lastTodo.order)
    ? lastTodo.order + 1
    : 0;

    // --------------------- CREATE ---------------------
    const newTodo = await Todo.create({
      userId: req.user.id,
      title,
      completed: false,
      order: nextOrder,
    });

    logger.info("Todo created successfully", {
      todoId: newTodo._id,
      userId: req.user.id,
      order: newTodo.order,
    });

    return res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: newTodo,
    });

  } catch (error) {
    logger.error("ERROR_CREATE_TODO", {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });

    return next({
      status: 500,
      message: "Internal server error",
    });
  }
};

// @desc    Update a todo
// @route   PUT /api/v1/todos/update/:id
// @access  PRIVATE
export const updateTodo = async (req, res, next) => {
    try {
        // 1. Verify authentication
        if (!req.user || !req.user.id) {
            logger.warn("Unauthorized to update todo", { requestedBy: "anonymous" });
            return next({ status: 401, message: "Unauthorized" });
        }

        // 2. Validate request body
        const { error } = updateTodoSchema.validate(req.body, { abortEarly: false });
        if (error) {
            logger.warn("Todo update validation failed", { errors: error.details, requestedBy: req.user.id });
            return next({ status: 400, message: "Validation Error", errors: error.details });
        }

        const { id } = req.params;
        const { title, completed } = req.body;

        // Allowed updates
        const updates = {};
        if (typeof title === "string") {
            updates.title = title.trim();
        }

        if (completed !== undefined) {
            if (typeof completed !== "boolean") {
                return next({ status: 400, message: "Completed must be boolean" });
            }
            updates.completed = completed;
        }

        // ✔️ $set updates only specified fields
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            { $set: updates },
            { new: true }
        );

        if (!updatedTodo) {
            logger.warn(`Todo not found for update: ${id}`);
            return next({ status: 404, message: "Todo not found" });
        }

        logger.info("Todo updated successfully", { todoId: id, updatedBy: req.user.id });

        return res.status(200).json({
          success: true,
          message: "Todo updated successfully",
          data: updatedTodo
        });

    } catch (error) {
        logger.error(`Error updating todo: ${error.message}`);
        return next({ status: 500, message: "Internal server error" });
    }
};

// @desc    Delete a todo
// @route   DELETE /api/v1/todos/delete/:id
// @access  PRIVATE
export const deleteTodo = async (req, res, next) => {
    try {
        // 1. Verify authentication
        if (!req.user || !req.user.id) {
            logger.warn("Unauthorized delete attempt");
            return next({ status: 401, message: "Unauthorized" });
        }

        const { id } = req.params;

        // Fetch todo first to check ownership
        const todo = await Todo.findById(id);
        if (!todo || todo.length === 0) {
            logger.warn(`Todo not found: ${id}`);
            return next({ status: 404, message: "Todo not found" });
        }

        // Only owner or admin can delete
        const isOwner = todo.userId.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            logger.warn(`User ${req.user.id} unauthorized to delete todo ${id}`);
            return res.status(403).json({ message: "Forbidden" });
        }

        await Todo.findByIdAndDelete({ _id: id, user:req.user.id });

        logger.info(`Todo ID ${id} deleted successfully`, { deletedBy: req.user.id });

        return res.status(200).json({ message: "Todo deleted successfully" });

    } catch (error) {
        logger.error(`Error deleting todo: ${error.message}`);
        return next({ status: 500, message: "Internal server error" });
    }
};

// @desc    Delete completed todos (user: own, admin: all)
// @route   DELETE /api/v1/todos/delete/completed
// @access  PRIVATE
export const deleteManyTodo = async (req, res, next) => {
  try {
    // 1. Auth check
    if (!req.user?.id) {
      logger.warn("Unauthorized attempt to delete completed todos");
      return next({ status: 401, message: "Unauthorized" });
    }

    const { id: userId, role } = req.user;
    const isAdmin = role === "admin";

    // 2. Authorization + scope
    const filter = isAdmin
      ? { completed: true }                 // admin → all completed todos
      : { completed: true, userId };         // user → own completed todos

    // 3. Delete
    const result = await Todo.deleteMany(filter);

    if (result.deletedCount === 0) {
      logger.info("No completed todos found to delete", {
        userId,
        role
      });

      return res.status(404).json({
        message: "No completed todos found"
      });
    }

    // 4. Success log
    logger.info("Completed todos deleted successfully", {
      deletedCount: result.deletedCount,
      deletedBy: userId,
      role
    });

    return res.status(200).json({
      message: "Completed todos deleted successfully",
      deletedCount: result.deletedCount
    });

  } catch (error) {
    logger.error("Error deleting completed todos", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id
    });

    return next({ status: 500, message: "Internal server error" });
  }
};

// @desc reorder todo for persist in the frontend after refresh
// @route PATCH /api/v1/todos/reorder
// @access PRIVATE
export const reorderTodo = async (req, res, next) => {
  try {
    // 1️⃣ Auth guard
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { order } = req.body;

    // 2️⃣ Validation
    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must be a non-empty array",
      });
    }

    // 3️⃣ Prepare bulk operations
    const bulkOps = order.map((item) => ({
      updateOne: {
        filter: {
          _id: item._id,
          userId: req.user.id, // 🔒 security check
        },
        update: {
          $set: { order: item.order },
        },
      },
    }));

    // 4️⃣ Execute reorder
    await Todo.bulkWrite(bulkOps);

    return res.status(200).json({
      success: true,
      message: "Todos reordered successfully",
    });

  } catch (error) {
    logger.error("ERROR_REORDER_TODOS", {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });

    return next({
      status: 500,
      message: "Internal server error",
    });
  }
};
