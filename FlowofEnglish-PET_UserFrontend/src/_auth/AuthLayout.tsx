import { Outlet, Navigate } from "react-router-dom";

const AuthLayout = () => {
  const isAuthenticated = false;

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <div className="min-h-screen flex justify-center items-center bg-slate-50">
          <Outlet />
        </div>
      )}
    </>
  );
};

export default AuthLayout;
