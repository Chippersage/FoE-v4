import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    console.log(`Scrolling to top for path: ${pathname}`);
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scrolling
    });
  }, [pathname]); // Trigger scroll on route change

  return null;
};

export default ScrollToTop;
