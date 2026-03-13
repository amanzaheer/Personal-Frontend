import { useState, useCallback } from "react";

export default function useProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getApiConfig = () => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
    const CUSTOM_ORIGIN = import.meta.env.VITE_ORIGIN || "";
    return { API_BASE, CUSTOM_ORIGIN };
  };

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { API_BASE, CUSTOM_ORIGIN } = getApiConfig();
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(CUSTOM_ORIGIN && { "Custom-Origin": CUSTOM_ORIGIN }),
        },
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || data?.error || "Failed to fetch profile");
      }

      const data = await response.json();
      const user = data?.data?.user || data?.user || data?.data;

      return { success: true, data: user };
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to fetch profile. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async ({ name, email }) => {
    try {
      setLoading(true);
      setError(null);

      const { API_BASE, CUSTOM_ORIGIN } = getApiConfig();
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE}/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(CUSTOM_ORIGIN && { "Custom-Origin": CUSTOM_ORIGIN }),
        },
        credentials: "include",
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || data?.error || "Failed to update profile");
      }

      const user = data?.data?.user || data?.user || data?.data;

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      return {
        success: true,
        data: user,
        message: data?.message || "Profile updated successfully",
      };
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to update profile. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (passwordData) => {
    try {
      setLoading(true);
      setError(null);

      const { API_BASE, CUSTOM_ORIGIN } = getApiConfig();
      const token = localStorage.getItem("auth_token");

      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...(CUSTOM_ORIGIN && { "Custom-Origin": CUSTOM_ORIGIN }),
        },
        credentials: "include",
        body: JSON.stringify(passwordData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || "Failed to change password"
        );
      }

      return {
        success: true,
        message: data?.message || "Password changed successfully",
      };
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to change password. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getProfile,
    updateProfile,
    changePassword,
  };
}
