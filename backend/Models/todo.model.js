import mongoose from "mongoose";
import { Schema } from "mongoose";

const todoSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        default: 0,
        min: 0,
    },
    completed: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

// ✅ Composite index (must be BEFORE model creation)
todoSchema.index({ userId: 1, order: 1 });

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
