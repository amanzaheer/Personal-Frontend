import React from "react";
import { Button } from "../ui/button";

export default function GalleryForm({
  mode,
  formData,
  setFormData,
  errors,
  imagePreview,
  onImageChange,
  isLoading = false,
  onSubmit,
  onCancel,
}) {
  const isCreateMode = mode === "create";

  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Title
          </label>
          <input
            type="text"
            value={formData.title || ""}
            placeholder="Enter gallery title"
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-black dark:text-white ${
              errors.title
                ? "border-red-500"
                : "border-gray-300 dark:border-neutral-800"
            }`}
            required
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Type
          </label>
          <input
            type="text"
            value={formData.type || ""}
            placeholder='e.g. "image" or "video"'
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-black dark:text-white ${
              errors.type
                ? "border-red-500"
                : "border-gray-300 dark:border-neutral-800"
            }`}
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-800 rounded-lg dark:bg-black dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-32 rounded-lg object-cover border border-gray-200 dark:border-neutral-700"
              />
            </div>
          )}
          {errors.image && (
            <p className="mt-1 text-sm text-red-600">{errors.image}</p>
          )}
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 dark:border-neutral-800 pt-4 flex justify-end gap-2">
        <Button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 hover:bg-gray-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 cursor-pointer"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : isCreateMode ? "Create" : "Update"}
        </Button>
      </div>
    </form>
  );
}

