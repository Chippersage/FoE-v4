import { Outlet } from "react-router-dom"
import Header from "../components/Header.tsx";

const RootLayout = () => {

//   const {isLoading: isUserLoading} = useUserContext()

  return (
    <div className="w-full md:flex">
      <Header />
      {/* {isUserLoading ? <SidebarSkeleton /> : <LeftSidebar />} */}

      <section className="flex flex-1 h-full relative">
        <Outlet />
      </section>
    </div>
  );
}

export default RootLayout