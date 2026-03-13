import React from "react";
import { Plus, Edit, UserCog, Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import SimpleSelect from "../ui/SimpleSelect";

export default function UserForm({
  mode,
  formData,
  setFormData,
  errors,
  roles = [],
  showCreatePassword,
  toggleCreatePasswordVisibility,
  isLoading = false,
  onSubmit,
  onCancel,
}) {
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const isAssignRoleMode = mode === "assignRole";

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        {(isCreateMode || isEditMode) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Name</label>
            <input
              type="text"
              value={formData.name || ""}
              placeholder="Enter name"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-black dark:text-white ${
                errors.name ? "border-red-500" : "border-gray-300 dark:border-neutral-800"
              }`}
              required
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
        )}

        {(isCreateMode || isEditMode) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Email</label>
            <input
              type="email"
              value={formData.email || ""}
              placeholder="Enter email"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              readOnly={isEditMode}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-black dark:text-white ${
                errors.email ? "border-red-500" : "border-gray-300 dark:border-neutral-800"
              } ${isEditMode ? "bg-gray-100 dark:bg-neutral-900 cursor-not-allowed" : ""}`}
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        )}

        {isCreateMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Password</label>
            <div className="relative">
              <input
                type={showCreatePassword ? "text" : "password"}
                value={formData.password || ""}
                placeholder="Enter password"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg pr-10 dark:bg-black dark:text-white ${
                  errors.password ? "border-red-500" : "border-gray-300 dark:border-neutral-800"
                }`}
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={toggleCreatePasswordVisibility}>
                {showCreatePassword ? <EyeOff size={20} className="text-gray-400" /> : <Eye size={20} className="text-gray-400" />}
              </div>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
        )}

        {isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Membership Status</label>
            <SimpleSelect
              value={formData.membershipStatus || "inactive"}
              onChange={(value) => setFormData({ ...formData, membershipStatus: value })}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              buttonClassName="w-full px-4 py-2 border border-gray-300 dark:border-neutral-800 rounded-lg dark:bg-black dark:text-white cursor-pointer"
            />
          </div>
        )}

        {(isCreateMode || isAssignRoleMode) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Role</label>
            <SimpleSelect
              value={formData.role || "user"}
              onChange={(value) => setFormData({ ...formData, role: value })}
              options={[
                { value: "user", label: "User" },
                { value: "admin", label: "Admin" },
                { value: "member", label: "Member" },
                ...(Array.isArray(roles) ? roles.map((r) => ({ value: r._id || r.name, label: r.name || r._id })) : []),
              ]}
              buttonClassName={`w-full px-4 py-2 border rounded-lg cursor-pointer dark:bg-black dark:text-white ${
                errors.role ? "border-red-500" : "border-gray-300 dark:border-neutral-800"
              }`}
            />
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
          </div>
        )}
      </div>

      <div className="mt-6 border-t border-gray-200 dark:border-neutral-800 pt-4 flex justify-end gap-2">
        <Button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 cursor-pointer" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-accent hover:bg-accent/80 text-white cursor-pointer" disabled={isLoading}>
          {isLoading ? "..." : isCreateMode ? "Create User" : isEditMode ? "Update User" : "Update Role"}
        </Button>
      </div>
    </form>
  );
}
