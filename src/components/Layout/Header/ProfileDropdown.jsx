import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { User, Lock, ChevronRight } from "lucide-react";

export default function ProfileDropdown({
  isOpen,
  onClose,
  buttonRef,
  onChangePassword,
  userName,
  userInitials,
  userProfileImage,
}) {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });

  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: buttonRect.bottom + 8,
          right: window.innerWidth - buttonRect.right,
        });
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen, buttonRef]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose, buttonRef]);

  const handleViewProfile = () => {
    onClose();
    navigate("/profile");
  };

  const handleUpdatePassword = () => {
    onClose();
    navigate("/profile");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("profile:openChangePassword"));
    }, 100);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed w-64 bg-card border border-border/50 rounded-xl shadow-2xl z-[99999] overflow-hidden backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        top: `${dropdownPosition.top}px`,
        right: `${dropdownPosition.right}px`,
      }}
    >
      <div className="px-4 py-3 border-b border-border/50 bg-gradient-to-r from-accent/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border-2 border-accent/30 flex-shrink-0">
            {userProfileImage ? (
              <img
                src={userProfileImage}
                alt={userName || "Profile"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : userInitials ? (
              <span className="text-accent font-bold text-sm">{userInitials}</span>
            ) : (
              <User className="w-5 h-5 text-accent" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {userName || "User"}
            </p>
            <p className="text-xs text-muted-foreground">Account Settings</p>
          </div>
        </div>
      </div>

      <div className="py-2">
        <button
          onClick={handleViewProfile}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/10 transition-all duration-200 text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <User className="w-4 h-4 text-accent" />
            </div>
            <span className="font-medium">View Profile</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        <button
          onClick={handleUpdatePassword}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/10 transition-all duration-200 text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
              <Lock className="w-4 h-4 text-accent" />
            </div>
            <span className="font-medium">Update Password</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>,
    document.body
  );
}
