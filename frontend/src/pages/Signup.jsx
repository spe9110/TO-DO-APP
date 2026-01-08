import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { FaCheck } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { useRegisterMutation } from '../redux/Slice/userSlice';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '../redux/Slice/authSlice';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
// import Loader from '../components/Loader';

const validationSchema = yup.object({
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),

  // ✔ FIXED FIELD NAME
  confirm_password: yup.string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
}).required();

const styleBg = {
  backgroundImage: 'url("https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg")',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  width: '100%'
};

const Signup = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(validationSchema),
  });

  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [registerUser, { isLoading }] = useRegisterMutation();

  useEffect(() => {
    if (userData) {
      navigate('/signin');
    }
  }, [userData, navigate]);

  // ✔ FIXED API PAYLOAD (added confirm_password)
  const onSubmit = async ({ firstName, lastName, email, password, confirm_password }) => {
    try {
      const res = await registerUser({
        firstName,
        lastName,
        email,
        password,
        confirm_password
      }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success("Registration successful.");
      reset();
      navigate('/signin');
    } catch (error) {
      console.error("Failed to register user: ", error);
      toast.error(error?.data?.message || "Registration failed. Please try again.");
    }
  };
  return (
    <div className='relative w-full min-h-screen'>
      <div className="w-full h-full absolute top-0 left-0 z-0" style={styleBg}></div>

      <div className='absolute w-full min-h-screen lg:h-screen flex justify-center items-center bg-gradient-to-r from-cyan-400/90 to-blue-500/90 z-10 py-[24PX] px-[8px] sm:px-[24px] lg:px-[100px] 2xl:px-[200px]'>
        
        <div className='flex flex-col lg:flex-row justify-between items-center gap-6 w-full lg:w-[800px] lg:min-h-[580px] rounded-xl border border-slate-400 shadow-md shadow-slate-500 bg-white p-[8px] sm:p-[16px] lg:p-[24px]'>

          {/* LEFT PANEL */}
          <div className='form_info flex-1 w-full lg:w-[44%] h-full bg-gradient-to-b from-[#818CF8] to-[#1D4ED8] p-[24px]'>

            <div className="box my-4 font-light text-white">
              <div className="icon w-[30px] h-[30px] rounded-full flex items-center justify-center bg-white/20 mb-[0.7rem]">
                <FaCheck className='text-white'/>
              </div>
              <h3 className='font-medium mb-1 text-Xl'>Quick and free sign-up</h3>
              <p>Enter your email address to create an account.</p>
            </div>

            <div className="box my-4 font-light text-white">
              <div className="icon w-[30px] h-[30px] rounded-full flex items-center justify-center bg-white/20 mb-[0.7rem]">
                <FaCheck className='text-white'/>
              </div>
              <h3 className='font-medium mb-1 text-Xl'>Stay organized effortlessly</h3>
              <p>Add your tasks, set priorities, and watch your productivity grow every day.</p>
            </div>

            <div className="box my-4 font-light text-white">
              <div className="icon w-[30px] h-[30px] rounded-full flex items-center justify-center bg-white/20 mb-[0.7rem]">
                <FaCheck className='text-white'/>
              </div>
              <h3 className='font-medium mb-1 text-Xl'>Achieve more with less effort</h3>
              <p>Create tasks, set deadlines, and keep every project under control in one place.</p>
            </div>

          </div>

          {/* RIGHT PANEL */}
          <div className='form_content flex-2 w-full lg:w-[56%] h-full flex justify-center items-center p-[24px]'>

            <form onSubmit={handleSubmit(onSubmit)} className='w-full h-full'>

              <div className="text-start mb-6">
                <h1 className='text-lg text-xl lg:text-2xl font-bold font-josefin'>Create your account</h1>
              </div>

              {/* First Name */}
              <div className="mb-3">
                <label>First Name</label>
                <input
                  {...register("firstName")}
                  placeholder="Enter your FirstName"
                  type="text"
                  className={`w-full px-3 py-1 border rounded-md transition-all duration-200 
                    focus:outline-none hover:shadow-sm
                    ${errors.firstName ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-slate-300 focus:ring-2 focus:ring-blue-500"}
                  `}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
              </div>

              {/* Last Name */}
              <div className="mb-3">
                <label>Last Name</label>
                <input
                  {...register("lastName")}
                  placeholder="Enter your LastName"
                  type="text"
                  className={`w-full px-3 py-1 border rounded-md transition-all duration-200 
                    focus:outline-none hover:shadow-sm
                    ${errors.lastName ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-slate-300 focus:ring-2 focus:ring-blue-500"}
                  `}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
              </div>

              {/* Email */}
              <div className="mb-3">
                <label>Email</label>
                <input
                  {...register("email")}
                  placeholder="Enter your Email address"
                  type="text"
                  className={`w-full px-3 py-1 border rounded-md transition-all duration-200 
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
                    className={`w-full px-3 py-1 border rounded-md pr-10 transition-all duration-200 
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

              {/* Confirm Password */}
              <div className="mb-3 relative">
                <label>Confirm password</label>
                <div className="relative">
                  <input
                    {...register("confirm_password")}
                    placeholder="Confirm your password"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`w-full px-3 py-1 border rounded-md pr-10 transition-all duration-200 
                      focus:outline-none hover:shadow-sm
                      ${errors.confirm_password ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-slate-300 focus:ring-2 focus:ring-blue-500"}
                    `}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {errors.confirm_password && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirm_password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isLoading} 
              className='text-white font-semibold mt-3 w-full px-3 py-1 border-none bg-blue-400 hover:bg-blue-500 rounded-md'>
                {isSubmitting || isLoading ? 'Loading...' : 'Sign up'}
              </button>

              <div className="mt-5 text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link to="/signin" className="text-blue-500 underline hover:text-blue-600">
                  Sign In
                </Link>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Signup;
