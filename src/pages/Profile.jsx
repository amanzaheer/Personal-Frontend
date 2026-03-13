import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Building2,
  Shield,
  Edit,
  ArrowLeft,
  UserCircle,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import UpdateProfileModal from "../components/Profile/UpdateProfileModal";
import useProfile from "../hooks/useProfile";
import { useFormatDate } from "../lib/dateUtils";

export default function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { formatDate: formatDateWithTimezone } = useFormatDate();

  useEffect(() => {
    if (window.location.search) {
      navigate("/profile", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    loadProfileFromStorage();

    const handleOpenChangePassword = () => {
      setActiveTab("change-password");
    };

    const handleProfileUpdate = () => {
      loadProfileFromStorage();
    };

    window.addEventListener(
      "profile:openChangePassword",
      handleOpenChangePassword
    );
    window.addEventListener("profile:updated", handleProfileUpdate);

    return () => {
      window.removeEventListener(
        "profile:openChangePassword",
        handleOpenChangePassword
      );
      window.removeEventListener("profile:updated", handleProfileUpdate);
    };
  }, []);

  const loadProfileFromStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setProfileData(user);
      }
    } catch (e) {
      console.error("Error loading profile from storage:", e);
    }
  };

  const handleUpdateSuccess = (updatedData) => {
    setProfileData(updatedData);
    setShowUpdateModal(false);
    try {
      localStorage.setItem("user", JSON.stringify(updatedData));
      window.dispatchEvent(new CustomEvent("profile:updated"));
    } catch (e) {
      console.error("Error updating localStorage:", e);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return formatDateWithTimezone(dateString, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getUserInitials = (user) => {
    if (user?.name) {
      const parts = user.name.split(" ").filter(Boolean);
      return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : user.name.substring(0, 2).toUpperCase();
    }
    if (user?.email) return user.email.substring(0, 2).toUpperCase();
    return "U";
  };

  const getUserName = (user) => {
    return user?.name || user?.email || "User";
  };

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">No profile data available</div>
      </div>
    );
  }

  const ChangePasswordTab = () => {
    const { changePassword, loading } = useProfile();
    const [formData, setFormData] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
      current: false,
      new: false,
      confirm: false,
    });
    const [error, setError] = useState("");

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setError("");
    };

    const togglePasswordVisibility = (field) => {
      setShowPasswords((prev) => ({
        ...prev,
        [field]: !prev[field],
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");

      if (!formData.currentPassword.trim()) {
        setError("Current password is required");
        return;
      }

      if (!formData.newPassword.trim()) {
        setError("New password is required");
        return;
      }

      if (formData.newPassword.length < 8) {
        setError("New password must be at least 8 characters long");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("New password and confirm password do not match");
        return;
      }

      if (formData.currentPassword === formData.newPassword) {
        setError("Current password and new password should not be the same");
        return;
      }

      try {
        const result = await changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        });

        if (result.success) {
          toast.success(result.message || "Password changed successfully");
          setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setShowPasswords({
            current: false,
            new: false,
            confirm: false,
          });
          setActiveTab("profile");
        } else {
          setError(result.error);
          toast.error(result.error);
        }
      } catch (err) {
        const errorMessage =
          err?.message || "Failed to change password. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    return (
      <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-accent/10">
              <Lock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Change Password
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Update your account password
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg px-4 py-3 flex items-start gap-2">
                <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Current Password
                <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 transition-all duration-200">
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter current password"
                  className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary/50"
                  aria-label={
                    showPasswords.current ? "Hide password" : "Show password"
                  }
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                New Password
                <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 transition-all duration-200">
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary/50"
                  aria-label={
                    showPasswords.new ? "Hide password" : "Show password"
                  }
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Confirm Password
                <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-3 focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/20 transition-all duration-200">
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary/50"
                  aria-label={
                    showPasswords.confirm ? "Hide password" : "Show password"
                  }
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("profile");
                }}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-medium rounded-lg border border-border text-foreground hover:bg-secondary/80 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30"
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => {
                setActiveTab("profile");
              }}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "profile"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab("change-password");
              }}
              className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === "change-password"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Change Password
              </div>
            </button>
          </div>
        </div>

        {activeTab === "profile" && (
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-8 border-b border-border">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-2xl font-bold text-accent-foreground border-4 border-background shadow-lg">
                  {profileData?.profileImage ? (
                    <img
                      src={profileData.profileImage}
                      alt={getUserName(profileData)}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{getUserInitials(profileData)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    {getUserName(profileData)}
                  </h2>
                  <p className="text-muted-foreground">
                    {profileData?.email || profileData?.username}
                  </p>
                </div>
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      First Name
                    </p>
                    <p className="text-base font-medium text-foreground">
                      {profileData?.personalInfo?.firstName || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Last Name
                    </p>
                    <p className="text-base font-medium text-foreground">
                      {profileData?.personalInfo?.lastName || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="text-base font-medium text-foreground">
                      {profileData?.email || profileData?.username || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Mobile</p>
                    <p className="text-base font-medium text-foreground">
                      {profileData?.personalInfo?.mobile || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <UserCircle className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Username
                    </p>
                    <p className="text-base font-medium text-foreground">
                      {profileData?.username || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Member Since
                    </p>
                    <p className="text-base font-medium text-foreground">
                      {formatDate(profileData?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {(profileData?.roleId || profileData?.merchantId) && (
                <div className="mt-8 pt-8 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-6">
                    Account Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profileData?.roleId && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Shield className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Role
                          </p>
                          <p className="text-base font-medium text-foreground">
                            {profileData.roleId?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                    )}

                    {profileData?.merchantId && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <Building2 className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Merchant ID
                          </p>
                          <p className="text-base font-medium text-foreground">
                            {typeof profileData.merchantId === "string"
                              ? profileData.merchantId
                              : profileData.merchantId?._id || "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "change-password" && <ChangePasswordTab />}
      </div>

      <UpdateProfileModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        profileData={profileData}
        onSuccess={handleUpdateSuccess}
      />
    </div>
  );
}
