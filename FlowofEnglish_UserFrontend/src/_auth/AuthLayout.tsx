// import { Outlet, Navigate } from "react-router-dom";

// const AuthLayout = () => {
//   const isAuthenticated = false;
//   return (
//     <>
//       {isAuthenticated ? (
//         <Navigate to="/" />
//       ) : (
//         <div className="flex overflow-hidden w-full">
//           <section className="flex flex-1 justify-center items-center flex-col max-h-screen md:px-20 px-10 py-20 ">
//             <Outlet />
//           </section>

          
//         </div>
//       )}
//     </>
//   );
// };

// export default AuthLayout;

import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="flex overflow-hidden w-full">
      <section className="flex flex-1 justify-center items-center flex-col max-h-screen md:px-20 px-10 py-20 ">
        <Outlet />
      </section>
    </div>
  );
};

export default AuthLayout;
