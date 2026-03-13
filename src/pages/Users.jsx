import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import useApi from "../lib/useApi";
import usePermissions from "../lib/userPermission";
import DataTable from "../components/ui/DataTable";
import ModalSidebar from "../components/ui/ModalSidebar";
import UserForm from "../components/Users/UserForm";
import Toast from "../components/ui/Toast";
import {
  Edit,
  Trash2,
  UserCog,
  Plus,
  UserCheck,
  Clock,
} from "lucide-react";
import { useFormatDate } from "../lib/dateUtils";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const api = useApi();
  const { hasPermission } = usePermissions();
  const { formatDate: formatDateWithTimezone } = useFormatDate();

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error("Error parsing current user:", error);
    }
    return null;
  };

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?._id || null;

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showConfirmToast, setShowConfirmToast] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [isMounted, setIsMounted] = useState(false);
  const [isOpenNewUser, setIsOpenNewUser] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [isOpenAssignRole, setIsOpenAssignRole] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAssigningRole, setIsAssigningRole] = useState(false);
  const fetchInProgressRef = useRef(false);

  const ROLES = [{ _id: "user", name: "user" }, { _id: "admin", name: "admin" }, { _id: "member", name: "member" }];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    membershipStatus: "inactive",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const debugPermissions = () => {
      const storedPermissions = localStorage.getItem("menu_permissions");

      if (storedPermissions) {
        const parsedPermissions = JSON.parse(storedPermissions);
      }
    };

    debugPermissions();
  }, [hasPermission]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1, limit = 100) => {
    if (fetchInProgressRef.current) return;
    fetchInProgressRef.current = true;
    try {
      setLoading(true);
      const response = await api.get("users", { page, limit });
      const data = response?.data?.data;
      const userData = data?.users || response?.data?.users || [];
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (error) {
      setUsers([]);
    } finally {
      fetchInProgressRef.current = false;
      setLoading(false);
    }
  };

  const refreshUsers = () => {
    setTimeout(() => {
      fetchUsers();
    }, 500);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.password) {
      setErrors({ general: "Name, email and password are required" });
      return;
    }
    setIsCreating(true);
    try {
      const response = await api.post("auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role || "user",
      });
      if (response?.data?.success || response?.data?.data) {
        toast.success(response?.data?.message || "User created successfully");
        closeNewUserModal();
        resetForm();
        refreshUsers();
      } else {
        toast.error(response?.data?.message || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);

      if (
        error.response?.data?.error &&
        typeof error.response.data.error === "object"
      ) {
        const errorObj = error.response.data.error;

        setErrors(errorObj);

        const firstErrorMessage = Object.values(errorObj)[0];
        toast.error(firstErrorMessage);
      } else if (error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        toast.error(errorMessage);

        if (errorMessage.toLowerCase().includes("email")) {
          setErrors({ email: errorMessage });
        } else if (errorMessage.toLowerCase().includes("username")) {
          setErrors({ username: errorMessage });
        } else {
          setErrors({ general: errorMessage });
        }
      } else if (
        error.response?.data?.status === "error" &&
        error.response?.data?.errors
      ) {
        const validationErrors = error.response.data.errors;

        // For password requirements error specifically
        if (validationErrors.some((err) => err.includes("Password must"))) {
          const passwordError = validationErrors.find((err) =>
            err.includes("Password must")
          );
          setErrors({ password: passwordError });
          toast.error(passwordError);
        } else {
          validationErrors.forEach((err) => {
            toast.error(err);
          });

          setErrors({ general: error.response.data.message });
        }
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
        setErrors({ general: error.response.data.message });
      } else {
        toast.error("Failed to create user");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsUpdating(true);
    try {
      const id = selectedUser?._id || selectedUser?.id;
      const response = await api.put(`users/${id}`, {
        name: formData.name?.trim(),
        membershipStatus: formData.membershipStatus || "inactive",
      });
      if (response?.data?.success || response?.data?.data) {
        toast.success(response?.data?.message || "User updated successfully");
        closeUpdateModal();
        refreshUsers();
      } else {
        toast.error(response?.data?.message || "Failed to update user");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();
    setIsAssigningRole(true);
    try {
      const id = selectedUser?._id || selectedUser?.id;
      const response = await api.put(`users/role/${id}`, { role: formData.role || "user" });
      if (response?.data?.success || response?.data?.data) {
        toast.success(response?.data?.message || "Role updated successfully");
        closeAssignRoleModal();
        refreshUsers();
      } else {
        toast.error(response?.data?.message || "Failed to update role");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update role");
    } finally {
      setIsAssigningRole(false);
    }
  };

  const handleDeleteClick = (user) => {
    const uid = user?._id || user?.id;
    if (currentUserId && uid === currentUserId) {
      toast.error("You cannot delete your own account");
      return;
    }

    setUserToDelete(user);
    setShowConfirmToast(true);
  };

  const handleConfirmDelete = async () => {
    const id = userToDelete?._id || userToDelete?.id;
    if (!userToDelete || !id) {
      toast.error("Invalid user selected for deletion");
      setShowConfirmToast(false);
      setUserToDelete(null);
      return;
    }

    if (currentUserId && id === currentUserId) {
      toast.error("You cannot delete your own account");
      setShowConfirmToast(false);
      setUserToDelete(null);
      return;
    }

    setShowConfirmToast(false);
    setLoading(true);

    try {
      const response = await api.delete(`users/${id}`);

      if (
        (response.data &&
          response.data.message &&
          response.data.message.includes("successfully")) ||
        (response.data && response.data._id) ||
        (response.status >= 200 &&
          response.status < 300 &&
          Object.keys(response.data).length === 0)
      ) {
        toast.success(response.data.message || "User deleted successfully");
        refreshUsers();
      } else {
        toast.error(
          response.data.error ||
            response.data.message ||
            "Failed to delete user"
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);

      if (
        error.response?.data?.errors &&
        error.response.data.errors.length > 0
      ) {
        toast.error(error.response.data.errors[0]);
      } else {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "An error occurred while deleting the user"
        );
      }
    } finally {
      setLoading(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmToast(false);
    setUserToDelete(null);
  };

  const openNewUserModal = () => {
    if (showUpdateModal) closeUpdateModal();
    if (showAssignRoleModal) closeAssignRoleModal();

    resetForm();
    setErrors({});
    setShowCreatePassword(false);
    setShowNewUserModal(true);
    setTimeout(() => setIsMounted(true), 10);
    setTimeout(() => setIsOpenNewUser(true), 50);
  };

  const closeNewUserModal = () => {
    setIsOpenNewUser(false);
    setTimeout(() => {
      setShowNewUserModal(false);
      setIsMounted(false);
      setErrors({});
      setShowCreatePassword(false);
    }, 300);
  };

  const openUpdateModal = (user) => {
    if (showNewUserModal) closeNewUserModal();
    if (showAssignRoleModal) closeAssignRoleModal();

    setSelectedUser(user);
    setErrors({});
    setFormData({
      ...formData,
      name: user.name || "",
      email: user.email || "",
      membershipStatus: user.membershipStatus || "inactive",
    });
    setShowUpdateModal(true);
    setTimeout(() => setIsMounted(true), 10);
    setTimeout(() => setIsOpenUpdate(true), 50);
  };

  const closeUpdateModal = () => {
    setIsOpenUpdate(false);
    setTimeout(() => {
      setShowUpdateModal(false);
      setIsMounted(false);
      setErrors({});
    }, 300);
  };

  const openAssignRoleModal = (user) => {
    if (showNewUserModal) closeNewUserModal();
    if (showUpdateModal) closeUpdateModal();

    setSelectedUser(user);
    setErrors({});
    setFormData({
      ...formData,
      role: user.role || "user",
    });
    setShowAssignRoleModal(true);
    setTimeout(() => setIsMounted(true), 10);
    setTimeout(() => setIsOpenAssignRole(true), 50);
  };

  const closeAssignRoleModal = () => {
    setIsOpenAssignRole(false);
    setTimeout(() => {
      setShowAssignRoleModal(false);
      setIsMounted(false);
      setErrors({});
    }, 300);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
      membershipStatus: "inactive",
    });
  };

  const userMap = useMemo(() => {
    const map = {};
    if (Array.isArray(users)) {
      users.forEach((user) => {
        const id = user?._id || user?.id;
        if (user && id) map[id] = user;
      });
    }
    return map;
  }, [users]);

  const renderActions = (userId) => {
    const user = userMap[userId];
    if (!user) return <div className="flex items-center justify-center gap-2">-</div>;
    const uid = user._id || user.id;
    const isCurrentUser = currentUserId && uid === currentUserId;

    return (
      <div className="flex items-center gap-2">
        {hasPermission("edit_user") && (
          <button
            onClick={() => !isCurrentUser && openUpdateModal(user)}
            disabled={isCurrentUser}
            className={`p-1.5 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 rounded-md transition-colors duration-200 ${
              isCurrentUser
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-yellow-800 dark:hover:text-yellow-300 cursor-pointer"
            }`}
            title={isCurrentUser ? "Cannot edit your own account" : "Edit User"}
          >
            <Edit className="w-4 h-4" />
          </button>
        )}

        {hasPermission("edit_user") && (
          <button
            onClick={() => !isCurrentUser && openAssignRoleModal(user)}
            disabled={isCurrentUser}
            className={`p-1.5 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-md transition-colors duration-200 ${
              isCurrentUser
                ? "opacity-50 cursor-not-allowed"
                : "hover:text-white hover:bg-purple-600 dark:hover:text-purple-300 cursor-pointer"
            }`}
            title={
              isCurrentUser
                ? "Cannot assign role to your own account"
                : "Assign Role"
            }
          >
            <UserCog className="w-4 h-4" />
          </button>
        )}

        {hasPermission("delete_user") && (
          <button
            onClick={() => !isCurrentUser && handleDeleteClick(user)}
            disabled={isCurrentUser}
            className={`p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md transition-colors duration-200 ${
              isCurrentUser ? "opacity-50 cursor-not-allowed" : "hover:text-white hover:bg-red-600 dark:hover:text-red-300 cursor-pointer"
            }`}
            title={isCurrentUser ? "Cannot delete your own account" : "Delete User"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  const formatName = (user) => {
    return user?.name || "-";
  };

  const formatRole = (role) => {
    return role || "-";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return formatDateWithTimezone(date, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMembershipStatus = (status) => {
    const isActive = status === "active";
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${isActive ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30" : "text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30"}`}>
        {isActive ? <UserCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
        {status === "active" ? "Active" : "Inactive"}
      </span>
    );
  };

  const prepareTableItems = () => {
    if (!Array.isArray(users)) return [];
    return users
      .filter((u) => u && (u._id || u.id))
      .map((user, index) => ({
        serial: index + 1,
        actions: renderActions(user._id || user.id),
        name: formatName(user),
        email: user.email || "-",
        role: formatRole(user.role),
        status: formatMembershipStatus(user.membershipStatus),
        createdAt: formatDate(user.createdAt),
        updatedAt: formatDate(user.updatedAt),
      }));
  };

  const addUserButton = hasPermission("add_user") && (
    <button
      onClick={openNewUserModal}
      className="px-5 py-2.5 cursor-pointer text-sm font-semibold rounded-xl bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:from-accent/90 hover:to-accent/70 disabled:opacity-60 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-100 flex items-center gap-2"
    >
      <Plus className="w-4 h-4" />
      <span>Add User</span>
    </button>
  );

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleCreatePasswordVisibility = () => {
    setShowCreatePassword(!showCreatePassword);
  };

  return (
    hasPermission("view_all_users") && (
      <>
        <div className="flex-1 flex flex-col bg-background">
          <Toaster position="top-right" />
          <div className="p-6">
            <DataTable
              searchBox
              searchPlaceholder="Search users..."
              isLoading={loading}
              refreshData={() => fetchUsers()}
              pagination={true}
              exportData={true}
              actionButtons={addUserButton}
              heads={[
                "Sr#",
                "Actions",
                "Name",
                "Email",
                "Role",
                "Status",
                "Created At",
                "Updated At",
              ]}
              items={prepareTableItems()}
            />
          </div>

          {showNewUserModal && (
            <ModalSidebar
              isOpen={isOpenNewUser}
              onClose={closeNewUserModal}
              title="Create New User"
              icon={Plus}
              errorMessage={errors.general}
            >
              <UserForm
                mode="create"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                roles={ROLES}
                showCreatePassword={showCreatePassword}
                toggleCreatePasswordVisibility={toggleCreatePasswordVisibility}
                onSubmit={handleCreateUser}
                onCancel={closeNewUserModal}
                isLoading={isCreating}
              />
            </ModalSidebar>
          )}

          {showUpdateModal && (
            <ModalSidebar
              isOpen={isOpenUpdate}
              onClose={closeUpdateModal}
              title="Update User"
              icon={Edit}
              subtitle={`Editing: ${formatName(selectedUser)}`}
            >
              <UserForm
                mode="edit"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                roles={ROLES}
                onSubmit={handleUpdate}
                onCancel={closeUpdateModal}
                isLoading={isUpdating}
              />
            </ModalSidebar>
          )}

          {showAssignRoleModal && (
            <ModalSidebar
              isOpen={isOpenAssignRole}
              onClose={closeAssignRoleModal}
              title="Assign Role"
              icon={UserCog}
              subtitle={`User: ${formatName(selectedUser)}`}
            >
              <UserForm
                mode="assignRole"
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                roles={ROLES}
                onSubmit={handleAssignRole}
                onCancel={closeAssignRoleModal}
                isLoading={isAssigningRole}
              />
            </ModalSidebar>
          )}

          {showConfirmToast && userToDelete && (
            <Toast
              message={`Are you sure you want to delete the user "${formatName(userToDelete)}"? This action cannot be undone.`}
              type="warning"
              onClose={handleCancelDelete}
              duration={0}
              actions={[
                {
                  label: "Cancel",
                  onClick: handleCancelDelete,
                },
                {
                  label: "Delete",
                  onClick: handleConfirmDelete,
                },
              ]}
            />
          )}
        </div>
      </>
    )
  );
}
