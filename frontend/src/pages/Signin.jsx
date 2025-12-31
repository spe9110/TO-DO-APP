import { useState, useEffect} from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { useLoginMutation } from "../redux/Slice/userSlice";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "../redux/Slice/authSlice";
import { toast } from "react-toastify";
import Loader from '../components/Loader';
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Validation schema
const validationSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
}).required();

const styleBg = {
  backgroundImage:
    'url("https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg")',
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  width: "100%",
};

const Signin = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(validationSchema)
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userData } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  // API mutation hook
  const [ loginUser, { isLoading } ] = useLoginMutation();

  useEffect(() => {
    if (userData) {
      navigate('/');
    }
  }, [userData, navigate]);

  if (isLoading) return <Loader />;

  const onSubmit = async ({ email, password }) => {
    try {
      const res = await loginUser({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success("Successfully signed in!");
      reset();
      navigate("/");
    } catch (error) {
      console.error("Failed to login user: ", error);
      toast.error(error?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 z-0 h-dvh" style={styleBg}></div>

      {/* Gradient + Card */}
      <div className="absolute inset-0 h-dvh flex justify-center items-center bg-gradient-to-r from-cyan-400/90 to-blue-500/90 z-10 px-[8px] sm:px-[24px] lg:px-[100px] 2xl:px-[200px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="fake-shadow w-full relative shadow shadow-[#4d49e8] lg:max-w-[25rem] h-fit text-slate-900 text-xs bg-white pt-4 pb-6 px-6 md:px-12 rounded-lg [&_*]:transition-all [&_*]:ease-linear [&_*]:duration-200"
        >
          {/* Card inner */}
          <div className="relative after:content-[''] after:absolute after:sm:w-[105%] after:w-[98%] after:h-[148%] after:bg-[#1D4ED8] after:rounded-lg after:z-[-1] after:-top-[5rem] after:sm:-right-[5rem] after:right-1">
            <h2 className="text-3xl font-semibold my-6">Sign in</h2>

            {/* Email */}
            <div className="mb-3">
              <label>Email</label>
              <input
                {...register("email")}
                placeholder="Enter your Email address"
                type="text"
                className={`w-full px-3 py-2 border rounded-md transition-all duration-200 
                  focus:outline-none hover:shadow-sm
                  ${errors.email ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-slate-300 focus:ring-2 focus:ring-blue-500"}
                `}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="mb-3 relative">
              <label>Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  placeholder="Type your Password"
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-3 py-2 border rounded-md pr-10 transition-all duration-200 
                    focus:outline-none hover:shadow-sm
                    ${errors.password ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-slate-300 focus:ring-2 focus:ring-blue-500"}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            {/* Sign in button */}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="text-white font-semibold bg-blue-400 hover:bg-blue-500 px-3 sm:px-5 py-2 sm:py-3 cursor-pointer rounded-full w-fit"
              >
                {isSubmitting || isLoading ? 'Loading...' : 'Sign in'}
              </button>

              <Link to={'/reset-password'} className="hover:underline text-[0.7rem] font-semibold">
                Forget your password?
              </Link>
            </div>

            {/* Links */}
            <div className="flex flex-col items-center font-semibold gap-y-2 mt-5">
              <span>
                Don't have an account?{' '}
              </span>
                <Link to="/signup" className="text-blue-500 underline hover:text-blue-600">
                  Sign up
                </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signin;
