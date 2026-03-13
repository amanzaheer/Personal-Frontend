import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import { routes } from "./routes";

const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < currentTime) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error parsing token:", error);
    return false;
  }
};

export default function Router() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");

  if (ref) {
    localStorage.setItem("ref", ref);
  }
  const isAuthenticated = () => {
    if (typeof window === "undefined") return false;
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");

    if (!token) return false;

    if (!isTokenValid(token)) {
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      return false;
    }

    return true;
  };

  const Protected = ({ children }) => {
    return isAuthenticated() ? (
      <Layout>{children}</Layout>
    ) : (
      <Navigate to="/login" replace />
    );
  };

  const Public = ({ children, allowWhenAuthenticated = false }) => {
    if (allowWhenAuthenticated) {
      return children;
    }
    return isAuthenticated() ? <Navigate to="/" replace /> : children;
  };

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {routes.map((route, index) => {
          const isAuthPage =
            route.path === "/login" ||
            route.path === "/signup" ||
            route.path === "/reset-password" ||
            route.path === "/reset-password/:token" ||
            route.path === "/reset/:token";
          const isLandingPage = route.path === "/";
          const element = <route.element />;
          const allowAuthAccess =
            route.path.includes("/reset") ||
            route.path === "/login" ||
            route.path === "/signup";
          return (
            <Route
              key={index}
              path={route.path}
              element={
                isAuthPage ? (
                  <Public allowWhenAuthenticated={allowAuthAccess}>
                    {element}
                  </Public>
                ) : isLandingPage ? (
                  element
                ) : (
                  <Protected>{element}</Protected>
                )
              }
            />
          );
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
