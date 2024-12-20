import { Outlet } from "react-router-dom"
import Header from "../components/Header.tsx";
import { AnnouncementBanner } from "@/components/AnnouncementBanner.tsx";
import { useState } from "react";

const RootLayout = () => {

//   const {isLoading: isUserLoading} = useUserContext()
const [cohortReminder, setCohortReminder] = useState(localStorage.getItem("cohortReminder"));
const handleOnClose = () => {
  localStorage.removeItem("cohortReminder")
  setCohortReminder(null)
};

  return (
    <div className="w-full md:flex">
      {cohortReminder && cohortReminder !== null &&
        <AnnouncementBanner isVisible={true} onClose={handleOnClose} message={cohortReminder}/>
      }
      <Header />
      {/* {isUserLoading ? <SidebarSkeleton /> : <LeftSidebar />} */}

      <section className="flex flex-1 h-full relative">
        <Outlet />
      </section>
    </div>
  );
}

export default RootLayout