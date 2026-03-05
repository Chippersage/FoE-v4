import { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const useModalClose = ({ isOpen, onClose }: Props) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);
};