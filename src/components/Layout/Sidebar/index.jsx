import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { Search, LogOut, ChevronRight, ChevronDown } from "lucide-react";
import { menu } from "./Menu";
import DarkSwitch from "../../ui/DarkSwitch";

export default function Sidebar({ sidebar, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentPath = location.pathname;
  const [expandedSubmenus, setExpandedSubmenus] = useState({});
  const [user, setUser] = useState(null);
  const [loginRole, setLoginRole] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const menuItemRefs = useRef({});
  const searchInputRef = useRef(null);
  const [checkedUser, setCheckedUser] = useState(null);

  const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      const decoded = decodeToken(token);
      const merchantId = decoded?.user_type || "";
      localStorage.setItem("activeSwitch", merchantId);
      try {
        const lower = String(merchantId).toLowerCase();
        if (!lower.includes("superadmin") && !lower.includes("agency")) {
          localStorage.removeItem("previousactiveSwitch");
          sessionStorage.removeItem("previousactiveSwitch");
        }
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  useEffect(() => {
    const userLog = localStorage.getItem("user");
    if (userLog) {
      const parsedUser = JSON.parse(userLog);
      setCheckedUser(parsedUser);
    }
  }, []);

  function getUserRole() {
    try {
      const storedUser = localStorage.getItem("activeSwitch");
      if (!storedUser) return "merchant";
      return storedUser || null;
    } catch {
      return null;
    }
  }
  useEffect(() => {
    const roleName = getUserRole();
    if (roleName) {
      const lower = roleName.toLowerCase();
      let normalized = "guest";
      if (lower.includes("superadmin")) normalized = "superadmin";
      else if (lower.includes("agency")) normalized = "agency";
      else normalized = "merchant";
      setLoginRole(normalized);
    }
  }, []);
  useEffect(() => {
    menu.forEach((item) => {
      if (item.submenu) {
        const hasActiveSubmenu = item.submenu.some(
          (subItem) => subItem.to === currentPath,
        );
        if (hasActiveSubmenu) {
          setExpandedSubmenus((prev) => ({ ...prev, [item.to]: true }));
        }
      }
    });
  }, [currentPath]);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  useEffect(() => {
    if (sidebar) {
      setHoveredItem(null);
    }
  }, [sidebar]);

  const filterMenuItems = (items, query) => {
    if (!query.trim()) return items;

    const lowerQuery = query.toLowerCase();
    return items
      .map((item) => {
        const matchesTitle = item.title.toLowerCase().includes(lowerQuery);
        const matchesSubmenu =
          item.submenu &&
          item.submenu.some((subItem) =>
            subItem.title.toLowerCase().includes(lowerQuery),
          );

        if (matchesTitle || matchesSubmenu) {
          if (item.submenu && matchesSubmenu) {
            return {
              ...item,
              submenu: item.submenu.filter((subItem) =>
                subItem.title.toLowerCase().includes(lowerQuery),
              ),
            };
          }
          return item;
        }
        return null;
      })
      .filter(Boolean);
  };

  const filteredMenu = useMemo(
    () => filterMenuItems(menu, searchQuery),
    [searchQuery],
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      menu.forEach((item) => {
        if (item.submenu) {
          const hasMatchingSubmenu = item.submenu.some((subItem) =>
            subItem.title.toLowerCase().includes(lowerQuery),
          );
          if (hasMatchingSubmenu) {
            setExpandedSubmenus((prev) => ({ ...prev, [item.to]: true }));
          }
        }
      });
    }
  }, [searchQuery]);

  const handleSearchClick = () => {
    if (!sidebar) {
      toggleSidebar();
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 300);
    } else if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") {
      setSearchQuery("");
      searchInputRef.current?.blur();
    } else if (
      e.key === "Enter" &&
      searchQuery.trim() &&
      filteredMenu.length > 0
    ) {
      const firstItem = filteredMenu[0];
      if (firstItem.submenu && firstItem.submenu.length > 0) {
        navigate(firstItem.submenu[0].to);
      } else {
        navigate(firstItem.to);
      }
      setSearchQuery("");
    }
  };

  useEffect(() => {
    setSearchQuery("");
  }, [currentPath]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div
      className={`sidebar-novel h-screen flex flex-col justify-between z-20 transition-all duration-300 ease-in-out ${
        sidebar
          ? "w-64 sidebar-scrollbar-hide"
          : "w-16 sidebar-collapsed-scrollbar"
      } overflow-y-auto ${
        sidebar ? "overflow-x-visible" : "overflow-x-hidden"
      } bg-[#faf8f5] dark:bg-[#0f0e0c] text-gray-800 dark:text-gray-200 border-r border-amber-900/10 dark:border-amber-100/10 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.06)] dark:shadow-[4px_0_24px_-4px_rgba(0,0,0,0.3)]`}
      style={{ isolation: "isolate" }}
    >
      <div className="p-4">
        <button
          onClick={() => navigate("/")}
          className={`flex items-center cursor-pointer transition-all ${
            sidebar ? "justify-start" : "justify-center"
          } h-14 px-1 group`}
        >
          {sidebar ? (
            <div className="flex items-center gap-3 w-full">
              <div className="h-9 w-9 flex-shrink-0 rounded-xl overflow-hidden shadow-md ring-1 ring-amber-900/5 dark:ring-amber-100/5">
                <img
                  src="/img/A-logo1.png"
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="sidebar-brand text-gray-900 dark:text-white font-semibold text-xl tracking-tight">
                  Aisha Abdel Maguid
                </span>
                <span className="text-[10px] text-amber-800/60 dark:text-amber-200/50 tracking-widest uppercase mt-0.5">
                  Writer · Publisher
                </span>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl overflow-hidden shadow-md ring-1 ring-amber-900/5 dark:ring-amber-100/5 group-hover:shadow-lg transition-all duration-200">
              <img
                src="/img/A-logo1.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </button>

        {sidebar ? (
          <div className="mt-4 px-2.5 py-2.5 rounded-xl bg-white/80 dark:bg-white/5 border border-amber-900/5 dark:border-amber-100/5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/90 text-[11px] font-semibold text-white shadow-sm">
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : user?.email
                    ? user.email.charAt(0).toUpperCase()
                    : "U"}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                  {user?.name || user?.email || "User"}
                </span>
                {checkedUser?.role &&
                  String(checkedUser.role).toLowerCase() !==
                    String(user?.name || user?.email || "").toLowerCase() && (
                    <span className="text-[10px] text-amber-800/50 dark:text-amber-200/40 tracking-wide capitalize">
                      {checkedUser.role}
                    </span>
                  )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-center">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent/90 text-white text-[11px] font-semibold shadow-sm">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : user?.email
                  ? user.email.charAt(0).toUpperCase()
                  : "U"}
            </span>
          </div>
        )}

        {sidebar ? (
          <div className="mt-4">
            <p className="sidebar-section px-2.5 mb-2">Navigate</p>
            <div className="flex items-center gap-2 rounded-xl bg-white/60 dark:bg-white/5 border border-amber-900/5 dark:border-amber-100/5 px-3 py-2.5">
              <Search className="w-4 h-4 flex-shrink-0 text-amber-800/40 dark:text-amber-200/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="bg-transparent text-sm placeholder-amber-800/40 dark:placeholder-amber-200/40 focus:outline-none flex-1 text-gray-800 dark:text-gray-200"
                placeholder="Search..."
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-amber-800/40 hover:text-amber-800/70 dark:text-amber-200/40 dark:hover:text-amber-200/70"
                  title="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center justify-center">
            <button
              type="button"
              onClick={handleSearchClick}
              title="Search"
              className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white/60 dark:bg-white/5 border border-amber-900/5 dark:border-amber-100/5 hover:bg-white/80 dark:hover:bg-white/10 text-amber-800/60 dark:text-amber-200/60 transition-colors"
            >
              <Search className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        )}

        <div
          className="mt-4 space-y-0.5 relative"
          style={{ overflow: "visible" }}
        >
          {filteredMenu.length === 0 && searchQuery ? (
            <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No results found for "{searchQuery}"
            </div>
          ) : (
            filteredMenu.map((item, index) => {
              if (item?.title === "Settings" && checkedUser?.role !== "admin") {
                return null;
              }
              if (item?.title === "Payment" && checkedUser?.role !== "admin") {
                return null;
              }
              if (item?.title === "Books" && checkedUser?.role !== "admin") {
                return null;
              }
              if (item?.title === "Gallery" && checkedUser?.role !== "admin") {
                return null;
              }

              const isActive =
                currentPath === item.to ||
                (item.submenu &&
                  item.submenu.some((subItem) => subItem.to === currentPath));
              const isDisabled = item.disabled;
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isSubmenuExpanded = expandedSubmenus[item.to];

              if (isDisabled) {
                return (
                  <div
                    key={index}
                    className={`relative flex items-center gap-3 p-2.5 rounded-lg opacity-40 cursor-not-allowed ${
                      !sidebar && "justify-center"
                    }`}
                    title={!sidebar ? `${item.title} (Coming Soon)` : undefined}
                  >
                    {item.Icon && (
                      <item.Icon className="w-5 h-5 flex-shrink-0 text-gray-400 dark:text-gray-600" />
                    )}
                    {sidebar && (
                      <span className="text-sm font-medium truncate text-gray-500 dark:text-gray-600">
                        {item.title}
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  ref={(el) => (menuItemRefs.current[index] = el)}
                  className="space-y-1 relative"
                  onMouseEnter={() => {
                    if (!sidebar) {
                      setHoveredItem(index);
                      if (menuItemRefs.current[index]) {
                        const rect =
                          menuItemRefs.current[index].getBoundingClientRect();
                        setTooltipPosition({
                          top: rect.top + rect.height / 2,
                          left: rect.right,
                        });
                      }
                    }
                  }}
                  onMouseLeave={() => !sidebar && setHoveredItem(null)}
                >
                  {hasSubmenu ? (
                    <>
                      <button
                        onClick={() => {
                          if (sidebar) {
                            setExpandedSubmenus((prev) => ({
                              ...prev,
                              [item.to]: !prev[item.to],
                            }));
                          }
                        }}
                        className={`relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 w-full cursor-pointer ${
                          isActive
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "text-foreground hover:bg-amber-900/5 dark:hover:bg-amber-100/5 hover:border-l-2 hover:border-l-accent/30"
                        } ${!sidebar && "justify-center"}`}
                        title={!sidebar ? item.title : undefined}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-0.5 rounded-r-full bg-accent-foreground/80" />
                        )}
                        {item.Icon && (
                          <item.Icon
                            className={`w-5 h-5 flex-shrink-0 ${
                              isActive
                                ? "text-accent-foreground"
                                : "text-amber-900/70 dark:text-amber-100/70"
                            }`}
                          />
                        )}
                        {sidebar && (
                          <>
                            <span
                              className={`text-sm font-medium truncate flex-1 text-left ${
                                isActive
                                  ? "text-white"
                                  : "text-gray-700 dark:text-gray-200"
                              }`}
                            >
                              {item.title}
                            </span>
                            {isSubmenuExpanded ? (
                              <ChevronDown
                                className={`w-4 h-4 flex-shrink-0 ${
                                  isActive ? "text-white" : "text-foreground"
                                }`}
                              />
                            ) : (
                              <ChevronRight
                                className={`w-4 h-4 flex-shrink-0 ${
                                  isActive ? "text-white" : "text-foreground"
                                }`}
                              />
                            )}
                          </>
                        )}
                      </button>
                      {sidebar && isSubmenuExpanded && hasSubmenu && (
                        <div className="ml-3 space-y-0.5 border-l-2 border-amber-900/10 dark:border-amber-100/10 pl-2">
                          {item.submenu.map((subItem, subIndex) => {
                            const superadminOnlyRoutes = [
                              "/phone-number-requests",
                              "/agent-list",
                              "/trunk-list",
                              "/dispatch-list",
                              "/ns-config-template",
                              "/third-party-apis",
                              "/permissions",
                              "/ns-config-template",
                              "/agency-upgrade-requests",
                            ];
                            if (
                              superadminOnlyRoutes.includes(subItem.to) &&
                              loginRole !== "superadmin"
                            ) {
                              return null;
                            }
                            const superadminOnlyRoute = ["/roles"];
                            if (
                              superadminOnlyRoute.includes(subItem.to) &&
                              loginRole !== "superadmin" &&
                              checkedUser?.roleId?.level !== 10 &&
                              checkedUser?.roleId?.type !== "admin"
                            ) {
                              return null;
                            }
                            if (
                              subItem.to === "/billing-configs" &&
                              !["agency", "superadmin"].includes(loginRole)
                            ) {
                              return null;
                            }
                            const isSubActive = currentPath === subItem.to;
                            const isSubDisabled = subItem.disabled;

                            if (isSubDisabled) {
                              return (
                                <div
                                  key={subIndex}
                                  className="relative flex items-center gap-3 p-2 rounded-lg opacity-40 cursor-not-allowed"
                                >
                                  {subItem.Icon && (
                                    <subItem.Icon className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-600" />
                                  )}
                                  <span className="text-xs font-medium truncate text-gray-500 dark:text-gray-600">
                                    {subItem.title}
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <Link
                                key={subIndex}
                                to={subItem.to}
                                className={`relative flex items-center gap-3 p-2 rounded-lg transition-all duration-200 ${
                                  isSubActive
                                    ? "bg-accent/90 text-accent-foreground shadow-sm"
                                    : "text-foreground hover:bg-amber-900/5 dark:hover:bg-amber-100/5"
                                }`}
                              >
                                {isSubActive && (
                                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r bg-accent" />
                                )}
                                {subItem.Icon && (
                                  <subItem.Icon
                                    className={`w-4 h-4 flex-shrink-0 ${
                                      isSubActive
                                        ? "text-accent-foreground"
                                        : "text-foreground"
                                    }`}
                                  />
                                )}
                                <span
                                  className={`text-xs font-medium truncate ${
                                    isSubActive
                                      ? "text-white"
                                      : "text-foreground"
                                  }`}
                                >
                                  {subItem.title}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                      {!sidebar && hoveredItem === index && hasSubmenu && (
                        <div
                          className="fixed min-w-[200px] bg-[#faf8f5] dark:bg-[#0f0e0c] border border-amber-900/10 dark:border-amber-100/10 rounded-xl shadow-xl py-1 overflow-hidden backdrop-blur-sm"
                          onMouseEnter={() => setHoveredItem(index)}
                          onMouseLeave={() => setHoveredItem(null)}
                          style={{
                            pointerEvents: "auto",
                            zIndex: 99999,
                            top: `${tooltipPosition.top}px`,
                            left: `${tooltipPosition.left + 1}px`,
                            transform: "translateY(-50%)",
                          }}
                        >
                          <div className="px-4 py-2.5 bg-accent text-accent-foreground border-b border-accent/20">
                            <span className="text-sm font-semibold flex items-center gap-2">
                              {item.Icon && (
                                <item.Icon className="w-4 h-4 flex-shrink-0" />
                              )}
                              {item.title}
                            </span>
                          </div>
                          <div className="py-1.5">
                            {item.submenu.map((subItem, subIndex) => {
                              const superadminOnlyRoutes = [
                                "/phone-number-requests",
                                "/agent-list",
                                "/trunk-list",
                                "/dispatch-list",
                                "/ns-config-template",
                                "/third-party-apis",
                                "/permissions",
                                "/agency-upgrade-requests",
                              ];

                              if (superadminOnlyRoutes.includes(subItem.to)) {
                                const isSuperadmin = loginRole === "superadmin";
                                if (!isSuperadmin) {
                                  return null;
                                }
                              }
                              const superadminOnlyRoute = ["/roles"];
                              if (
                                superadminOnlyRoute.includes(subItem.to) &&
                                loginRole !== "superadmin" &&
                                checkedUser?.roleId?.level !== 10 &&
                                checkedUser?.roleId?.type !== "admin"
                              ) {
                                return null;
                              }
                              if (
                                subItem.to === "/billing-configs" &&
                                !["agency", "superadmin"].includes(loginRole)
                              ) {
                                return null;
                              }
                              const isSubActive = currentPath === subItem.to;
                              const isSubDisabled = subItem.disabled;

                              if (isSubDisabled) {
                                return (
                                  <div
                                    key={subIndex}
                                    className="relative flex items-center gap-3 px-4 py-2 mx-1 rounded-lg opacity-40 cursor-not-allowed"
                                  >
                                    {subItem.Icon && (
                                      <subItem.Icon className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-gray-600" />
                                    )}
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-600">
                                      {subItem.title}
                                    </span>
                                  </div>
                                );
                              }

                              return (
                                <Link
                                  key={subIndex}
                                  to={subItem.to}
                                  className={`relative flex items-center gap-3 px-4 py-2 mx-1 rounded-lg transition-all duration-200 ${
                                    isSubActive
                                      ? "bg-accent/10 text-accent-foreground border-l-2 border-accent"
                                      : "text-foreground hover:bg-secondary/60 dark:hover:bg-secondary/40"
                                  }`}
                                >
                                  {isSubActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-accent rounded-r-full" />
                                  )}
                                  {subItem.Icon && (
                                    <subItem.Icon
                                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                                        isSubActive
                                          ? "text-accent"
                                          : "text-foreground"
                                      }`}
                                    />
                                  )}
                                  <span
                                    className={`text-xs font-medium truncate ${
                                      isSubActive
                                        ? "text-white"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {subItem.title}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <Link
                        to={item.to}
                        className={`relative flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-accent text-accent-foreground shadow-sm"
                            : "text-foreground hover:bg-amber-900/5 dark:hover:bg-amber-100/5 hover:border-l-2 hover:border-l-accent/30 border-l-2 border-l-transparent"
                        } ${!sidebar && "justify-center"}`}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-0.5 rounded-r-full bg-accent-foreground/80" />
                        )}
                        {item.Icon && (
                          <item.Icon
                            className={`w-5 h-5 flex-shrink-0 ${
                              isActive
                                ? "text-accent-foreground"
                                : "text-amber-900/70 dark:text-amber-100/70"
                            }`}
                          />
                        )}
                        {sidebar && (
                          <span
                            className={`text-sm font-medium truncate ${
                              isActive
                                ? "text-white"
                                : "text-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {item.title}
                          </span>
                        )}
                      </Link>
                      {!sidebar && hoveredItem === index && (
                        <div
                          className="fixed px-3 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap backdrop-blur-sm border border-amber-900/10"
                          style={{
                            pointerEvents: "auto",
                            zIndex: 99999,
                            top: `${tooltipPosition.top}px`,
                            left: `${tooltipPosition.left + 8}px`,
                            transform: "translateY(-50%)",
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            {item.Icon && (
                              <item.Icon className="w-3.5 h-3.5 flex-shrink-0" />
                            )}
                            {item.title}
                          </div>
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-transparent border-r-accent"></div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-amber-900/10 dark:border-amber-100/10 mb-6">
        {sidebar && (
          <div className="flex items-center justify-between px-2 py-2 rounded-xl bg-white/40 dark:bg-white/5 mb-3">
            <span className="sidebar-section text-[10px]">Theme</span>
            <DarkSwitch bgSun="bg-white/20" />
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 cursor-pointer hover:bg-amber-900/5 dark:hover:bg-amber-100/5 p-2.5 rounded-xl transition-all duration-200 w-full group ${
            !sidebar && "justify-center"
          }`}
          title="Logout"
        >
          <span className="p-1 rounded-lg group-hover:bg-red-500/10">
            <LogOut className="w-4 h-4 flex-shrink-0 text-amber-800/70 dark:text-amber-200/70 group-hover:text-red-600 dark:group-hover:text-red-400" />
          </span>
          {sidebar && (
            <span className="text-sm font-medium text-amber-800/80 dark:text-amber-200/80 group-hover:text-red-600 dark:group-hover:text-red-400">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
