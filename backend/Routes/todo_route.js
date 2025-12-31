import express from "express";
import { getAllTodos, getTodoById, createTodo, updateTodo, deleteTodo, deleteManyTodo, reorderTodo } from "../Controllers/todo_controller.js";
import { userAuth } from "../Middlewares/authenticate.js";
import { authForRoles } from "../Middlewares/authorize.js";
import { cursorPaginatedResults} from "../Middlewares/pagination.js";
import Todo from "../Models/todo.model.js";

const router = express.Router();

// @desc This route is used to get all todos list
// @endpoint GET api/v1/todos/all
// @access PRIVATE
router.get('/user/:id', userAuth, authForRoles(["user", "admin"]), cursorPaginatedResults(Todo), getAllTodos);

// @desc This route is used to get all todos list
// @endpoint GET api/v1/todos/all
// @access PRIVATE
router.get('/:id', userAuth, authForRoles(["user", "admin"]), getTodoById);

// @desc This route is used to get all todos list
// @endpoint GET api/v1/todos/all
// @access PRIVATE
router.post('/create', userAuth, authForRoles(["user", "admin"]), createTodo);


// @desc This route is used to get all todos list
// @endpoint GET api/v1/todos/all
// @access PRIVATE
router.patch('/update/:id', userAuth, authForRoles(["user", "admin"]), updateTodo);

// @desc reorder todo for persist in the frontend after refresh
// @route PATCH /api/v1/todos/reorder
// @access PRIVATE
router.patch('/reorder', userAuth, authForRoles(["user", "admin"]), reorderTodo)

// @desc This route is used to get all todos list
// @endpoint GET api/v1/todos/all
// @access PRIVATE
router.delete('/delete/:id', userAuth, authForRoles(["user", "admin"]), deleteTodo);


// @desc    Delete completed todos (user: own, admin: all)
// @route   DELETE /api/v1/todos/delete/completed
// @access  PRIVATE
router.delete('/delete/:id/clear-completed', userAuth, authForRoles(["user", "admin"]), deleteManyTodo);

export default router;