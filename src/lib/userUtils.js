/**
 * Utility functions for user authentication and role checking
 */

/**
 * Decode JWT token to get payload
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token payload or null
 */
export const decodeToken = (token) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
        console.error("Failed to decode token:", error);
        return null;
    }
};

/**
 * Get user type from token
 * @returns {string|null} User type (merchant, superadmin, agency, etc.) or null
 */
export const getUserType = () => {
    const token =
        localStorage.getItem("auth_token") || localStorage.getItem("accessToken");
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded?.user_type || null;
};

/**
 * Check if current user is merchant
 * @returns {boolean}
 */
export const isMerchant = () => {
    const userType = getUserType();

    // Also check user object from localStorage as fallback
    let userFromStorage = null;
    try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            userFromStorage = JSON.parse(userStr);
        }
    } catch (e) {
        console.error("Error parsing user from localStorage:", e);
    }

    // Check user_type from token
    if (userType) {
        const lowerType = String(userType).toLowerCase();
        // Must be merchant and NOT superadmin or agency
        if (lowerType === "merchant") {
            return true;
        }
    }

    // Fallback: Check if user has merchantId but is not superadmin/agency
    if (userFromStorage) {
        const hasMerchantId = userFromStorage.merchantId;
        const userRole = userFromStorage.roleId?.type?.toLowerCase() || "";
        const userLevel = userFromStorage.roleId?.level;

        // If user has merchantId and is not admin/superadmin level, they're likely a merchant
        if (hasMerchantId && userLevel !== 10 && userRole !== "admin" && userRole !== "superadmin") {
            // Double check it's not agency
            const tokenType = userType ? String(userType).toLowerCase() : "";
            if (tokenType !== "agency" && tokenType !== "superadmin") {
                return true;
            }
        }
    }

    return false;
};

/**
 * Check if current user is superadmin
 * @returns {boolean}
 */
export const isSuperadmin = () => {
    const userType = getUserType();
    return userType === "superadmin";
};

/**
 * Check if current user is agency
 * @returns {boolean}
 */
export const isAgency = () => {
    const userType = getUserType();
    return userType === "agency";
};

