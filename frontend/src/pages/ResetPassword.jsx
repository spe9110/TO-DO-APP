import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useSendResetPasswordMutation, useResetPasswordMutation } from '../redux/Slice/userSlice';

const styleBg = {
  backgroundImage:
    'url("https://images.pexels.com/photos/2363/france-landmark-lights-night.jpg")',
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  width: "100%",
};

const ResetPassword = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputRefs = useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').slice(0, 6);
    paste.split('').forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  // mutation hooks with different names for loading states
  const [sendResetPassword, { isLoading: isSending }] = useSendResetPasswordMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const onSubmitEmailHandler = async (e) => {
    e.preventDefault(); // prevent form reload
    try {
      const res = await sendResetPassword({ email }).unwrap();
      toast.success(res?.message || 'Email sent successfully!');
      setIsEmailSent(true);
    } catch (err) {
      console.error(err?.data?.message || err.error);
      toast.error(err?.data?.message || 'Failed to send reset email');
    }
  };
  
  // OTP Submit
  const onSubmitOtpHandler = async (e) => {
    e.preventDefault();
    const otpValue = inputRefs.current.map((input) => input.value).join('');
    if (otpValue.length === 6) {
      setOtp(otpValue);
      setIsOtpSubmitted(true);
    } else {
      toast.error('Please enter a 6-digit OTP');
    }
  };

  // Reset Password Submit
  const onSubmitNewPasswordHandler = async (e) => {
    e.preventDefault();
    try {
      await resetPassword({ email, otp, newPassword }).unwrap();
      toast.success("Password updated successfully");
      navigate("/login"); // optional
    } catch (error) {
      toast.error(error?.data?.message || "Password modification failed");
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 z-0 h-dvh" style={styleBg}></div>
      <div className="absolute w-full inset-0 h-dvh flex justify-center items-center bg-gradient-to-r from-cyan-400/90 to-blue-500/90 z-10 px-[8px] sm:px-[24px] lg:px-[100px] 2xl:px-[200px]">
        <div className='absolute top-8 left-4 lg:left-24'>
          <h1
            onClick={() => navigate("/")}
            className="text-xl xs:text-2xl sm:text-3xl font-extrabold tracking-tight text-red-500 cursor-pointer hover:text-red-600 transition duration-300"
          >
            MyTodo
          </h1>
        </div>
        <div className='w-full flex justify-center items-center'>
          {!isEmailSent && (
            <form
              onSubmit={onSubmitEmailHandler}
              className="bg-slate-950 w-full p-4 lg:p-8 rounded-lg shadow-lg lg:w-[450px] text-sm"
            >
              <h1 className="text-white text-2xl font-semibold text-center mb-4">
                Reset Password
              </h1>
              <p className="text-center mb-6 text-cyan-400">
                Enter your registered email address
              </p>
              <div className="flex items-center gap-3 w-full px-5 py-3 rounded-full bg-gray-700">
                <FaEnvelope className="text-gray-100" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-gray-100 focus:outline-none"
                  placeholder="Email Address"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white py-2 rounded-md hover:from-cyan-500 hover:to-blue-700 transition duration-200 cursor-pointer mt-4"
              >
                {isSending ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          )}
          
          {!isOtpSubmitted && isEmailSent && (
            <form onSubmit={onSubmitOtpHandler} className='bg-slate-950 w-full p-4 lg:p-8 rounded-lg shadow-lg lg:w-[450px] text-sm'>
              <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset password OTP</h1>
              <p className='text-center mb-6 text-cyan-400'>Enter the 6-digit code sent to your email address</p>
              <div onPaste={handlePaste} className="flex items-center justify-between mb-4 w-full space-x-1">
                  {Array(6)
                    .fill(0)
                    .map((_, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        onInput={(e) => handleInput(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-800 text-white text-center text-xl font-semibold rounded-md shadow-inner border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-150"
                        type="text"
                        maxLength="1"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                    />
                    ))}
                </div>
              <button
                  type="submit"
                  disabled={false}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white py-2 rounded-md hover:from-cyan-500 hover:to-blue-700 transition duration-200 cursor-pointer mt-4"
                  >
                  {isSending ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          )}
          
          {isOtpSubmitted && isEmailSent && (
            <form onSubmit={onSubmitNewPasswordHandler} className='bg-slate-950 w-full p-4 lg:p-8 rounded-lg shadow-lg lg:w-[450px] text-sm'>
              <h1 className='text-white text-2xl font-semibold text-center mb-4'>New password</h1>
              <p className='text-center mb-6 text-cyan-400'>Enter the new password below</p>
              <div className="relative flex items-center gap-3 w-full px-5 py-3 rounded-full bg-gray-700">
                  <FaLock className="text-gray-100" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-100 pr-8"
                    placeholder="New Password"
                    required
                  />
                  <div
                    className="absolute right-5 cursor-pointer text-gray-300 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
              <button
                  type="submit"
                  disabled={isResetting}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 text-white py-2 rounded-md hover:from-cyan-500 hover:to-blue-700 transition duration-200 cursor-pointer mt-4"
                  >
                  {isResetting ? 'Resetting...' : 'Reset'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword