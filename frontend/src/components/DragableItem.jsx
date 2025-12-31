import { HiOutlineX } from "react-icons/hi";
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateTodo } from "../API/api";
import { useTheme } from "../context/DarkModeContext";


export const SortableTodoItem = ({ todo, onDelete, userId, onDragStart, onDragOver, onDrop, onDragEnd }) => {
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  /* What this code means - Same todos - Same order - Same pages - Only completed changes */ 
  const { mutate: updateTodoMutation } = useMutation({
    mutationKey: ['update-todo'],
    mutationFn: ({ id, completed }) => updateTodo(id, { completed }),

    onSuccess: (_data, variables) => {
      const { id, completed } = variables;

      queryClient.setQueryData(['todos', userId], (oldData) => {
        if (!oldData) return oldData;

        const updatedPages = oldData.pages.map((page) => ({
          ...page,
          data: page.data.map((t) =>
            t._id === id ? { ...t, completed } : t
          ),
        }));

        return {
          ...oldData,
          pages: updatedPages,
        };
      });
    },
  });


  const handleOnChecked = () => {
    updateTodoMutation({
      id: todo._id,
      completed: !todo.completed,
    });
  };

  return (
    <li 
      draggable
      onDragStart={onDragStart}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className="flex justify-between items-center px-4 py-2 border-b border-slate-700 cursor-grab" key={todo._id}>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={todo.completed}  // Controlled checkbox
          onChange={handleOnChecked}
        />
        
        <div
          className={`
            w-6 h-6 rounded-full 
            border border-slate-400 
            flex items-center justify-center
            bg-slate-900 text-transparent
            peer-checked:bg-blue-500
            peer-checked:text-white
            peer-checked:border-slate-800
           ${isDark ? 'bg-slate-900' : 'bg-white border-slate-300 peer-checked:border-slate-400'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="peer-checked:block"
          >
            <path
              fill="currentColor"
              d="M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59L21 7Z"
            />
          </svg>
        </div>
        
        <p
          className={`
            text-slate-200 transition
            peer-checked:line-through
            peer-checked:text-slate-500 ${isDark ? 'text-slate-200' : 'text-slate-950'}`}
          
        >
          {todo.title}
        </p>
      </label>
    
      <HiOutlineX onClick={() => onDelete(todo._id)} className="text-slate-500 hover:text-red-500 cursor-pointer" />
    </li>
  );
};
