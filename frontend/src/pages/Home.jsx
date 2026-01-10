import { useState, useEffect, useRef, useMemo } from 'react'
import { FaPlus } from "react-icons/fa6";
import { useLogoutMutation } from '../redux/Slice/userSlice';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/Slice/authSlice';
import { FaSignOutAlt } from "react-icons/fa";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useInfiniteQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Loader from '../components/Loader';
import { fetchTodos, createTodo, deleteTodo, deleteManyTodo, reorderTodo } from '../API/api';
// import { useInView } from "react-intersection-observer";
import { SortableTodoItem } from '../components/DragableItem';
import Switch from '../components/Switch';
import lightBg from '../assets/bg-desktop-light.jpg'
import darkBg from '../assets/bg-desktop-dark.jpg';
import { useTheme } from '../context/DarkModeContext';
import { useSearchParams } from 'react-router-dom';
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai";


const validationSchema = yup.object({
  title: yup.string().min(3).max(30).required("Title is required"),
});
// Add this style tag in your component or create a separate CSS file
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .todo-item-enter {
    animation: fadeInUp 0.3s ease-out forwards;
  }

  .todo-item {
    transition: all 0.2s ease-in-out;
  }

  .smooth-scroll {
    scroll-behavior: smooth;
  }
`;

const Home = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const { userData } = useSelector((state) => state.auth);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [logoutUser] = useLogoutMutation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadMoreRef, setLoadMoreRef] = useState(null);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const todoFilter = searchParams.get("filter") || "all";
  console.log('Todo filter', todoFilter);

  const setFilter = (value) => {
    setSearchParams({ filter: value });
  };

  const isAuthReady = Boolean(userData?.id && userData?.accessToken);

  // Fetch data with useInfiniteQuery
  const { data: todos, status, error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage } = useInfiniteQuery({
    queryKey: ["todos", userData?.id],
    queryFn: ({ pageParam }) => fetchTodos({ pageParam, userId: userData?.id }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    // enabled: !!userData?.id,
    enabled: isAuthReady,
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 5000),
    refetchOnWindowFocus: false,
    // staleTime: 5 * 60 * 1000,
  });

  console.log('todo data from React query tanstack: ', todos);

  // Data map after fetching - render all pages
  const todosList = useMemo(() => {
    return todos?.pages?.flatMap(page => page.data) ?? [];
  }, [todos]);

  // Data filter by using filter()
  const filteredTodos = useMemo(() => {
    if (todoFilter === "active") {
      return todosList.filter(todo => !todo.completed);
    }
    if (todoFilter === "completed") {
      return todosList.filter(todo => todo.completed);
    }
    return todosList; // for all
  }, [todosList, todoFilter]);



  const listRef = useRef(null);
  // handle loadind data manually
  const handleContainerScroll = () => {
    if (!hasUserScrolled) {
      setHasUserScrolled(true);
      console.log('User has started scrolling');
    }

    // Manual intersection detection
    if (!loadMoreRef || !listRef.current || !hasNextPage || isFetchingNextPage) return;
    
    const container = listRef.current;
    const trigger = loadMoreRef;
    
    const containerRect = container.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    
    // Check if trigger is visible within container
    const isVisible = (
      triggerRect.top >= containerRect.top &&
      triggerRect.bottom <= containerRect.bottom + 200 // 200px threshold
    );
    
    if (isVisible && hasUserScrolled) {
      console.log('Loading next page...');
      fetchNextPage();
    }
  };

  // Handle creating a todo
  const { mutate: createTodoMutate } = useMutation({
    mutationKey: ["create-todo"],
    mutationFn: createTodo,
    onSuccess: (data) => {
      console.log("Todo created successfully:", data);
      queryClient.invalidateQueries({
        queryKey: ["todos", userData?.id],
        refetchType: "all"
      });
      reset(); // Reset the form after successful creation
    },
    onError: (err) => console.error("Create todo failed:", err),
  });

  const handleCreateTodo = (data) => {
    createTodoMutate({ title: data.title });
    console.log("Todo created with data:", data);
  };

  // Handle deleting a todo
  const { mutate: deleteTodoMutate } = useMutation({
    mutationKey: ["delete-todo"],
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todos", userData?.id],
        refetchType: "all"
      });
    },
    onError: (err) => {
      console.error("Delete todo failed:", err);
      toast.error("Impossible de supprimer la tâche.");
    }
  });

  const handleDeleteTodo = (id) => {
    if (!id) {
      console.error("Delete blocked: missing id");
      return;
    }
    deleteTodoMutate({ id });
    console.log('delete todo succesfully', id);
  };

  // Handle delete many todos
  const { mutate: deleteManyTodoMutate } = useMutation({
    mutationKey: ['delete-many'],
    mutationFn: deleteManyTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todos", userData?.id],
        refetchType: "all"
      });
    },
    onError: (err) => {
      console.error("Delete many todo failed:", err);
      toast.error("Cannot delete many completed todo.");
    }
  });

  const handleDeleteMany = (id) => {
    if (!id) {
      console.error("Delete blocked: missing id");
      return;
    }
    deleteManyTodoMutate({ id });
  };
// handle reorder
  const { mutate: reorderTodoMutation } = useMutation({
    mutationFn: reorderTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todos", userData?.id],
        refetchType: "all"
      });
    }  
  });


// Background image style for dark mode
  const styleBg = {
    backgroundImage: `url(${isDark ? darkBg : lightBg})`,
    backgroundColor: 'transparent',
    backgroundPosition: 'top',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'auto center',
    width: '100%',
    height: '300px',
  };

  // User info
  const firstName = userData?.firstName || '';
  const lastName = userData?.lastName || '';
  const email = userData?.email || '';
  const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase();
  console.log('current userData', userData);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logoutUser().unwrap();
      dispatch(logout());
      navigate("/signin");
      toast.success("Successfully logged out!");
    } catch (error) {
      console.error("Logout failed: ", error);
      toast.error("Logout failed. Please try again.");
    }
  };


  // handle drag and drop logic
  const onDragStart = (e, todoId) => {
    e.dataTransfer.setData("todoId", todoId);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add(
      "opacity-50",
      "border-b",
      "border-slate-700"
    );
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, targetTodoId) => {
    e.preventDefault();

    const draggedTodoId = e.dataTransfer.getData("todoId");
    if (!draggedTodoId || draggedTodoId === targetTodoId) return;

    queryClient.setQueryData(["todos", userData?.id], (old) => {
      if (!old) return old;

      const allTodos = old.pages.flatMap((p) => p.data);

      const fromIndex = allTodos.findIndex(t => t._id === draggedTodoId);
      const toIndex   = allTodos.findIndex(t => t._id === targetTodoId);

      if (fromIndex === -1 || toIndex === -1) return old;

      const reordered = [...allTodos];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      reorderTodoMutation({
        order: reordered.map((t, i) => ({ _id: t._id, order: i })),
      });

      return {
        ...old,
        pages: old.pages.map((page, i) =>
          i === 0
            ? { ...page, data: reordered.slice(0, page.data.length) }
            : page
        ),
      };
    });
  };

  const onDragEnd = (e) => {
    e.currentTarget.classList.remove("opacity-50");
  };

  if(status === "loading") return <Loader />;

  if(error) {
    return <div className="w-full min-h-screen flex justify-center items-center bg-gray-950 dark:bg-gray-50 dark:text-white">
      <p className="text-white text-2xl">{error.message}</p>
    </div>;
  }

  return (
    <>
      <style> {styles} </style>
      <div className="w-full min-h-screen flex flex-col justify-center items-center">
        <div className="w-full absolute inset-0 z-0" style={styleBg}></div>

        <div className="content w-full h-auto lg:w-1/2 lg:min-h-[550px] z-10 mt-6 px-[8px] sm:px-[24px] lg:px-[0px]">
          <div className="header flex justify-between items-center">
            <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-white">TO DO</h1>
            <div className="flex justify-center items-center gap-4">
              <Switch />
              <div className="user_id hidden lg:block relative group">
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-semibold cursor-pointer border border-slate-300 shadow-md">
                  {initials}
                </div>
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-xl p-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="flex flex-col">
                    <p className="text-gray-900 font-semibold text-xl">
                      {firstName} {lastName}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      {email}
                    </p>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 py-2 px-3 rounded-lg bg-red-400 text-white text-sm font-medium hover:bg-red-500 transition"
                    >
                      <FaSignOutAlt />
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
              <div className="mobile user_id lg:hidden">
                <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white text-2xl">
                  {mobileOpen ? <AiOutlineClose /> : <GiHamburgerMenu />}
                </button>
              </div>
            </div>
          </div>

          <div className={`to_do_form w-full h-12 mt-6 shadow-md rounded-md overflow-hidden
              ${isDark ? "bg-slate-900" : "bg-white"}
            `}>
            <form onSubmit={handleSubmit(handleCreateTodo)} className="w-full h-full flex flex-row justify-center items-center gap-0">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Type here and add to do"
                  className={`bg-transparent text-current w-full h-full ring-0 outline-0 focus:outline-none focus:ring-0 px-[24px] placeholder:text-slate-700 ${isDark ? "caret-white" : "caret-black"}`}
                  {...register("title")}
                />
                {errors.title && <p className="text-red-500 text-xs ml-2">{errors.title.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="flex justify-center items-center px-[16px]"><FaPlus className="text-slate-700" /></button>
            </form>
          </div>

          <div ref={listRef} onScroll={handleContainerScroll} 
          className={`to_do_items_container w-full h-[420px] mt-6 overflow-y-auto relative rounded-md shadow-md flex flex-col smooth-scroll ${isDark ? "bg-slate-900" : "bg-white text-slate-950"}`}>
            {filteredTodos.length > 0 ? (
              <ul>
                {filteredTodos.map((todo) => (
                  <SortableTodoItem
                    key={todo._id}
                    todo={todo}
                    onDelete={handleDeleteTodo}
                    userId={userData?.id}
                    onDragStart={(e) => onDragStart(e, todo._id)}
                    onDrop={(e) => onDrop(e, todo._id)}
                    onDragOver={onDragOver}
                    onDragEnd={onDragEnd}
                    style={{
                      animationDelay: `${(todo % 9) * 0.05}s` // Stagger animation for new items
                    }}
                  />
                ))}
                {hasNextPage && (
                  <li 
                    ref={setLoadMoreRef}
                    className="h-16 flex items-center justify-center text-slate-500 transition-all duration-300"
                  >
                    {isFetchingNextPage ? (
                      <div className="flex items-center gap-2 animate-pulse">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Loading more...</span>
                      </div>
                    ) : (
                      <span className="text-sm opacity-60 hover:opacity-100 transition-opacity">
                        Scroll to load more
                      </span>
                    )}
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-slate-600 text-center mt-4">
                No {todoFilter === "all" ? "" : todoFilter} todos
              </p>
            )}
            
            <div className={`mt-auto border-t border-slate-600 bg-slate-900 sticky bottom-0 w-full flex justify-between items-center text-slate-600 px-4 py-2 ${isDark ? "bg-slate-900" : "bg-white text-slate-950"} `}>
              <div>{filteredTodos.length} Items</div>
              <div className="hidden lg:flex gap-4">
                {["all", "active", "completed"].map(filter => (
                  <div
                    key={filter}
                    className={`cursor-pointer ${todoFilter === filter ? "text-blue-400" : ""}`}
                    onClick={() => setFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </div>
                ))}
              </div>
              <div onClick={handleDeleteMany} className="cursor-pointer">
                Clear Completed
              </div>
            </div>
          </div>
          <div className={`flex lg:hidden gap-4 rounded-md shadow-lg mt-4 justify-between items-center p-4
              ${isDark ? "bg-slate-900" : "bg-white text-slate-950"}
            `}>
                {["all", "active", "completed"].map(filter => (
                  <div
                    key={filter}
                    className={`cursor-pointer ${todoFilter === filter ? "text-blue-400" : ""}`}
                    onClick={() => setFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </div>
                ))}
          </div>

          {/* Mobile menu */}
          <div
            className={`fixed top-0 right-0 h-full w-64 bg-slate-900 shadow-xl transform transition-transform duration-300 z-40
              ${mobileOpen ? "translate-x-0" : "translate-x-full"}
            `}
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white text-xl"
            >
              <AiOutlineClose />
            </button>

            <div className="h-full flex flex-col justify-between p-6 text-white">
              
              {/* TOP: user info */}
              <div className="flex flex-col gap-1">
                <p className="text-lg font-semibold">
                  {firstName} {lastName}
                </p>
                <p className="text-sm text-gray-300">{email}</p>
              </div>

              {/* BOTTOM: sign out */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 px-3 rounded-lg bg-red-400 hover:bg-red-500 transition"
              >
                <FaSignOutAlt />
                Sign out
              </button>

            </div>
          </div>
          {/* Mobile menu end */}
        </div>

        <div className="Drag_and_drop_message flex justify-center items-center my-6">
          <p className="text-slate-600">Drag and drop to reorder the list</p>
        </div>
      </div>
    </>
  );
};

export default Home;

