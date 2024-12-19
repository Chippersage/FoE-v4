import { X } from "lucide-react";
import PropTypes from "prop-types";
// @ts-ignore
export function AnnouncementBanner({ isVisible, onClose, message }) {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 text-primary-foreground px-4 py-2 z-[99999999] w-full bg-orange-500 bg-opacity-80">
      <div className="container mx-auto flex items-center justify-between">
        <p className="text-sm font-medium">
          {message}
        </p>
        <button
          onClick={onClose}
          className="text-primary-foreground hover:text-primary-foreground/80 transition-colors"
          aria-label="Close announcement"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

AnnouncementBanner.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
