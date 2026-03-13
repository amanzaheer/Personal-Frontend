import React, { useState, useEffect, useRef } from "react";
import ProfileDropdown from "./ProfileDropdown";
import { getUserType } from "../../../lib/userUtils";
import { Menu, User, Shield, Building2, UserCircle } from "lucide-react";

export default function Header({ toggleSidebar, currentPage }) {
  const [userRole, setUserRole] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileButtonRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [userProfileImage, setUserProfileImage] = useState(null);

  useEffect(() => {
    const getUserRole = () => {
      const userType = getUserType();
      if (userType) {
        const lowerType = String(userType).toLowerCase();
        if (lowerType === "superadmin") {
          return "Super Admin";
        } else if (lowerType === "agency") {
          return "Agency";
        } else if (lowerType === "merchant") {
          return "Merchant";
        } else {
          try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
              const user = JSON.parse(userStr);
              const roleType = user?.roleId?.type?.toLowerCase() || "";
              if (
                roleType.includes("superadmin") ||
                roleType.includes("admin")
              ) {
                return "Super Admin";
              } else if (roleType.includes("agency")) {
                return "Agency";
              } else if (roleType.includes("merchant")) {
                return "Merchant";
              }
            }
          } catch (e) {
            console.error("Error parsing user:", e);
          }
          return "User";
        }
      }
      try {
        const activeSwitch = localStorage.getItem("activeSwitch");
        if (activeSwitch) {
          const lower = String(activeSwitch).toLowerCase();
          if (lower.includes("superadmin")) {
            return "Super Admin";
          } else if (lower.includes("agency")) {
            return "Agency";
          } else if (lower.includes("merchant")) {
            return "Merchant";
          }
        }
      } catch (e) {
        console.error("Error checking activeSwitch:", e);
      }
      return null;
    };

    setUserRole(getUserRole());

    const handleStorageChange = (e) => {
      if (
        e.key === "auth_token" ||
        e.key === "user" ||
        e.key === "activeSwitch"
      ) {
        setUserRole(getUserRole());
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const handleRoleChange = () => {
      setUserRole(getUserRole());
    };

    window.addEventListener("user:role-changed", handleRoleChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user:role-changed", handleRoleChange);
    };
  }, []);

  const getPageInfo = (pathname) => {
    switch (pathname) {
      case "/dashboard":
        return {
          title: "Dashboard",
          description: "Overview of your writing platform",
        };
      case "/":
      case "/home":
        return {
          title: "Home",
          description: "Landing page",
        };
      case "/users":
        return {
          title: "Users",
          description: "View and manage users",
        };
      case "/sliders":
        return {
          title: "Sliders",
          description: "Manage homepage sliders",
        };
      case "/books":
        return {
          title: "Books",
          description: "Manage books and ebooks",
        };
      case "/website-config":
        return {
          title: "Website Configuration",
          description: "Manage UI sections and website settings",
        };
      case "/profile":
        return {
          title: "Profile",
          description: "View and manage your profile",
        };
      case "/payment":
        return {
          title: "Payment",
          description: "Manage payments",
        };
      default:
        return {
          title: "Dashboard",
          description: "Welcome to your dashboard",
        };
    }
  };

  const pageInfo = getPageInfo(currentPage);

  useEffect(() => {
    const updateUserInfo = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const fullName =
            user?.name ||
            (user?.personalInfo?.firstName && user?.personalInfo?.lastName
              ? `${user.personalInfo.firstName} ${user.personalInfo.lastName}`.trim()
              : "") ||
            user?.username ||
            user?.email ||
            "";
          setUserName(fullName);

          if (fullName) {
            const parts = fullName.split(" ").filter(Boolean);
            const initials = parts
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase() || "")
              .join("");
            setUserInitials(initials || fullName.substring(0, 2).toUpperCase());
          } else {
            setUserInitials("");
          }

          setUserProfileImage(user?.profileImage || null);
        }
      } catch (e) {
        console.error("Error parsing user for profile icon:", e);
      }
    };

    updateUserInfo();

    const handleStorageChange = (e) => {
      if (e.key === "user") {
        updateUserInfo();
      }
    };

    const handleProfileUpdate = () => {
      updateUserInfo();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profile:updated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profile:updated", handleProfileUpdate);
    };
  }, []);

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="flex w-full items-center justify-between py-4 px-6">
        <div className="flex items-center gap-4">
          <button type="button" onClick={toggleSidebar}>
            <Menu className="w-5 h-5 dark:text-primary hover:text-accent cursor-pointer transition-colors duration-200" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-amber-950 dark:text-amber-100 flex items-center gap-2">
              {currentPage === "/users" && (
                <User className="w-5 h-5 text-accent" />
              )}
              {pageInfo.title}
            </h2>
            <p className="text-sm text-amber-800/90 dark:text-amber-200/80">
              {pageInfo.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              ref={profileButtonRef}
              type="button"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-foreground border-2 transition-all duration-200 cursor-pointer group ${
                showProfileDropdown
                  ? "border-accent bg-accent/10 ring-2 ring-accent/20 shadow-lg"
                  : "border-border bg-gradient-to-br from-secondary to-secondary/80 hover:border-accent/50 hover:shadow-md hover:scale-105"
              }`}
              title={userName || "Profile"}
            >
              {userProfileImage ? (
                <img
                  src={userProfileImage}
                  alt={userName || "Profile"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : userInitials ? (
                <span className="text-accent font-bold">{userInitials}</span>
              ) : (
                <UserCircle className="w-5 h-5 text-accent" />
              )}
              {showProfileDropdown && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-background"></span>
              )}
            </button>
            <ProfileDropdown
              isOpen={showProfileDropdown}
              onClose={() => setShowProfileDropdown(false)}
              buttonRef={profileButtonRef}
              userName={userName}
              userInitials={userInitials}
              userProfileImage={userProfileImage}
            />
          </div>
        </div>
      </div>

      {userRole && (
        <div
          className={`fixed bottom-3 right-6 z-30 flex items-center gap-2.5 px-3 py-1 rounded-full shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-3xl cursor-default   ${
            userRole === "Super Admin"
              ? "bg-accent border-2 border-accent text-white shadow-aaccent/90  "
              : userRole === "Agency"
                ? "bg-gradient-to-r from-blue-500/90 to-blue-600/90 border-2 border-blue-400/50 text-white shadow-blue-500/30"
                : "bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 border-2 border-emerald-400/50 text-white shadow-emerald-500/30"
          }`}
          title={`Current Role: ${userRole}`}
        >
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm ${
              userRole === "Super Admin"
                ? "ring-2 ring-purple-300/50"
                : userRole === "Agency"
                  ? "ring-2 ring-blue-300/50"
                  : "ring-2 ring-emerald-300/50"
            }`}
          >
            {userRole === "Super Admin" && (
              <Shield className="w-4 h-4 text-white" />
            )}
            {userRole === "Agency" && (
              <Building2 className="w-4 h-4 text-white" />
            )}
            {(userRole === "Merchant" || userRole === "User") && (
              <UserCircle className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="font-semibold text-sm tracking-wide">
            {userRole}
          </span>
        </div>
      )}
    </div>
  );
}
