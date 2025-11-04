import { Outlet, Navigate } from "react-router-dom";

const AuthLayout = () => {
  const isAuthenticated = false;

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        // center the outlet; padding for top/bottom so card doesn't touch edges
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
          {/* This wrapper controls the maximum width of the whole auth area.
              It ensures the child (Outlet) cannot grow bigger than this. */}
          <div className="w-full max-w-[460px]">
            <Outlet />
          </div>
        </div>
      )}
    </>
  );
};

export default AuthLayout;
