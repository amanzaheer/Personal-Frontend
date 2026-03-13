import { useState, useCallback } from "react";

export default function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get API configuration
    const getApiConfig = () => {
        const API_BASE = import.meta.env.VITE_API_BASE_URL;
        const CUSTOM_ORIGIN = import.meta.env.VITE_ORIGIN;
        return { API_BASE, CUSTOM_ORIGIN };
    };

    // Login - POST /api/auth/login { email, password }
    const login = useCallback(async (email, password) => {
        try {
            setLoading(true);
            setError(null);
            const { API_BASE, CUSTOM_ORIGIN } = getApiConfig();

            const response = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(CUSTOM_ORIGIN && { "Custom-Origin": CUSTOM_ORIGIN }),
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const msg = data?.message || data?.error || data?.msg || "Login failed.";
                throw new Error(msg);
            }

            const token = data?.data?.token || data?.token;
            const user = data?.data?.user || data?.user;

            if (token) localStorage.setItem("auth_token", token);
            if (user) {
                const normalized = { ...user, _id: user._id || user.id, id: user.id || user._id };
                localStorage.setItem("user", JSON.stringify(normalized));
            }

            return { success: true, data: { user, token } };
        } catch (err) {
            const errorMessage = err?.message || "Login failed. Please try again.";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Signup - POST /api/auth/register { name, email, password, role }
    const signup = useCallback(async (name, email, password, role = "user") => {
        try {
            setLoading(true);
            setError(null);
            const { API_BASE, CUSTOM_ORIGIN } = getApiConfig();

            const response = await fetch(`${API_BASE}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(CUSTOM_ORIGIN && { "Custom-Origin": CUSTOM_ORIGIN }),
                },
                credentials: "include",
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data?.message || data?.error || `Signup failed`);
            }

            const token = data?.data?.token || data?.token;
            const user = data?.data?.user || data?.user;
            if (token) localStorage.setItem("auth_token", token);
            if (user) localStorage.setItem("user", JSON.stringify(user));

            return {
                success: true,
                data: data?.data || data,
                message: data?.message || "Registration successful",
            };
        } catch (err) {
            const errorMessage = err?.message || "Unable to sign up.";
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, []);

    // Recover Password (Forget Password)
    const recoverPassword = useCallback(async (email) => {
        try {
            setLoading(true);
            setError(null);

            const { API_BASE, CUSTOM_ORIGIN } = getApiConfig();

            const response = await fetch(`${API_BASE}/auth/recoverPassword`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Origin": CUSTOM_ORIGIN,
                },
                credentials: "include",
                body: JSON.stringify({ email: email.trim() }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    "Failed to send recovery email. Please try again."
                );
            }

            return {
                success: true,
                data: data,
            };
        } catch (err) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to send recovery email. Please try again.";
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    }, []);

    // Reset Password
    const resetPassword = useCallback(async (token, password, confirmPassword) => {
        try {
            setLoading(true);
            setError(null);

            const { API_BASE, CUSTOM_ORIGIN } = getApiConfig();

            const response = await fetch(`${API_BASE}/auth/resetPassword/${token}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Custom-Origin": CUSTOM_ORIGIN,
                },
                credentials: "include",
                body: JSON.stringify({
                    password: password.trim(),
                    confirmPassword: confirmPassword.trim(),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    data?.error ||
                    "Failed to reset password. Please try again."
                );
            }

            return {
                success: true,
                data: data,
            };
        } catch (err) {
            const errorMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to reset password. Please try again.";
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            const { API_BASE, CUSTOM_ORIGIN } = getApiConfig();
            const token = localStorage.getItem("auth_token");
            if (token && API_BASE) {
                await fetch(`${API_BASE}/auth/logout`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        ...(CUSTOM_ORIGIN && { "Custom-Origin": CUSTOM_ORIGIN }),
                    },
                    credentials: "include",
                });
            }
        } catch {
            // Ignore logout API errors
        } finally {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("menu_permissions");
        }
    }, []);

    const logoutUser = logout;

    return {
        loading,
        error,
        login,
        signup,
        logout,
        logoutUser,
        recoverPassword,
        resetPassword,
    };
}

