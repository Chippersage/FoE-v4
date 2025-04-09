import { Outlet } from "react-router-dom";
import Header from "../components/Header.tsx";
import { AnnouncementBanner } from "@/components/AnnouncementBanner.tsx";
import { useState } from "react";
import { SessionProvider } from "@/context/TimerContext.tsx";
import Header2 from "@/components/Header2.tsx";

const RootLayout = () => {
  //   const {isLoading: isUserLoading} = useUserContext()
  const [cohortReminder, setCohortReminder] = useState(
    localStorage.getItem("cohortReminder")
  );
  const handleOnClose = () => {
    localStorage.removeItem("cohortReminder");
    setCohortReminder(null);
  };

  return (
    // <SessionProvider>
    <div className="w-full md:flex">
      {cohortReminder &&
        cohortReminder !== null &&
        cohortReminder !== undefined && (
          <AnnouncementBanner
            isVisible={true}
            onClose={handleOnClose}
            message={cohortReminder}
          />
        )}
      {/* <Header />
      <Header2/> */}
      {/* {isUserLoading ? <SidebarSkeleton /> : <LeftSidebar />} */}

      <section className="flex flex-1 h-full relative">
        <Outlet />
      </section>
    </div>
    // </SessionProvider>
  );
};

export default RootLayout;
