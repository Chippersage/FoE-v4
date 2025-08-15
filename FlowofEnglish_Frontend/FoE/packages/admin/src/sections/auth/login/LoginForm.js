// /* eslint-disable */
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { EyeIcon, EyeOffIcon } from 'lucide-react';

// import { useUser } from 'src/UserContext';

// export default function LoginForm() {
//   const navigate = useNavigate();
//   const { setUserType } = useUser(); // Using useUser hook to get setUserType
//   const apiUrl = process.env.REACT_APP_API_URL;

//   const [showPassword, setShowPassword] = useState(false);
//   const [userId, setUserId] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     try {
//       const response = await fetch(`${apiUrl}/superadmin/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ userId, password }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         setError(errorData.message || 'Login failed');
//         return;
//       }

//       const data = await response.json();
//       if (data.token) {
//         localStorage.setItem('token', data.token);
//         // setUserType(data.userType);
//         setUserType('superAdmin');
//         localStorage.removeItem('orgId'); // Clear org-specific data
//         navigate('/dashboard', { replace: true });
//       } else {
//         setError('Invalid credentials');
//       }
//     } catch (error) {
//       console.error('Error during login:', error);
//       setError('Error during login');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleSuperAdmin = () => navigate('/loginorg');

//   return (
//     <div className="min-h-screen md:bg-gray-100 w-full flex flex-col items-center md:p-4">
//       <div className="mb-8 mt-8">
//         {/* <img src="/assets/main-logo.png" alt="flowofenglish Logo" className="h-16" /> */}
//         <img src="/assets/mindful_logo_circle.png" alt="Mindfultalk Logo" className="h-16" />
//       </div>

//       <div className="w-full max-w-md bg-white rounded-lg shadow-md md:p-8 p-4">
//         <h2 className="md:text-3xl text-xl font-semibold text-center text-gray-800 mb-8">
//           Login to Superadmin Account
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <input
//               type="text"
//               placeholder="User ID"
//               value={userId}
//               onChange={(e) => setUserId(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5bc3cd]"
//               required
//             />
//           </div>

//           <div className="relative">
//             <input
//               type={showPassword ? 'text' : 'password'}
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5bc3cd]"
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute inset-y-0 right-0 pr-3 flex items-center"
//             >
//               {showPassword ? (
//                 <EyeOffIcon className="h-5 w-5 text-gray-500" />
//               ) : (
//                 <EyeIcon className="h-5 w-5 text-gray-500" />
//               )}
//             </button>
//           </div>

//           <div className="flex items-center space-x-2">
//             <input
//               type="checkbox"
//               id="rememberMe"
//               checked={rememberMe}
//               onChange={(e) => setRememberMe(e.target.checked)}
//               className="w-4 h-4 text-[#5bc3cd] border-gray-300 rounded focus:ring-[#5bc3cd]"
//             />
//             <label htmlFor="rememberMe" className="text-sm text-gray-600">
//               Remember me
//             </label>
//           </div>

//           {error && <p className="text-red-600 text-center text-sm font-medium">{error}</p>}

//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="w-full bg-[#5bc3cd] hover:bg-[#DB5788] text-white font-bold py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//           >
//             {isSubmitting ? 'Logging in...' : 'Login'}
//           </button>
//         </form>

//         <div className="mt-6 text-center space-y-2">
//           <button onClick={handleSuperAdmin} className="text-[#5bc3cd] hover:underline block w-full">
//             Go to Org Admin Page
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

/* eslint-disable */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { useUser } from 'src/UserContext';

export default function LoginForm() {
  const navigate = useNavigate();
  const { setUserType } = useUser(); // Using useUser hook to get setUserType
  const apiUrl = process.env.REACT_APP_API_URL;

  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/superadmin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
        return;
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        // setUserType(data.userType);
        setUserType('superAdmin');
        localStorage.removeItem('orgId'); // Clear org-specific data
        navigate('/dashboard', { replace: true });
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error during login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuperAdmin = () => navigate('/loginorg');

  return (
    <div className="w-full flex flex-col items-center">
      {/* Logo with increased size */}
      <div className="mb-8">
        <img 
          src="/assets/mindful_logo_circle.png" 
          alt="Mindfultalk Logo" 
          className="h-24 w-24 md:h-32 md:w-32" 
        />
      </div>

      {/* Login Form Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6 md:p-8">
        <h2 className="text-xl md:text-2xl font-semibold text-center text-gray-800 mb-8">
          Login to Superadmin Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5bc3cd]"
              required
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5bc3cd]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOffIcon className="h-5 w-5 text-gray-500" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-500" />
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-[#5bc3cd] border-gray-300 rounded focus:ring-[#5bc3cd]"
            />
            <label htmlFor="rememberMe" className="text-sm text-gray-600">
              Remember me
            </label>
          </div>

          {error && <p className="text-red-600 text-center text-sm font-medium">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#5bc3cd] hover:bg-[#DB5788] text-white font-bold py-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button onClick={handleSuperAdmin} className="text-[#5bc3cd] hover:underline block w-full">
            Go to Org Admin Page
          </button>
        </div>
      </div>
    </div>
  );
}