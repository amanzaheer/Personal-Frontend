import React from "react";
import { Button } from "../ui/button";
import SimpleSelect from "../ui/SimpleSelect";

export default function BookForm({
  mode,
  formData,
  setFormData,
  errors,
  coverImagePreview,
  onCoverImageChange,
  bookFileName,
  onBookFileChange,
  isLoading = false,
  onSubmit,
  onCancel,
}) {
  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";

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
            placeholder="Enter book title"
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
            Author
          </label>
          <input
            type="text"
            value={formData.author || ""}
            placeholder="Enter author name"
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-black dark:text-white ${
              errors.author
                ? "border-red-500"
                : "border-gray-300 dark:border-neutral-800"
            }`}
          />
          {errors.author && (
            <p className="mt-1 text-sm text-red-600">{errors.author}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Description
          </label>
          <textarea
            value={formData.description || ""}
            placeholder="Enter book description"
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-black dark:text-white ${
              errors.description
                ? "border-red-500"
                : "border-gray-300 dark:border-neutral-800"
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Cover Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onCoverImageChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-800 rounded-lg dark:bg-black dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
          />
          {coverImagePreview && (
            <div className="mt-2">
              <img
                src={coverImagePreview}
                alt="Cover preview"
                className="max-h-32 rounded-lg object-cover border border-gray-200 dark:border-neutral-700"
              />
            </div>
          )}
          {errors.coverImage && (
            <p className="mt-1 text-sm text-red-600">{errors.coverImage}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Book File (PDF, etc.)
          </label>
          <input
            type="file"
            accept=".pdf,.epub,.mobi,application/pdf"
            onChange={onBookFileChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-800 rounded-lg dark:bg-black dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
          />
          {bookFileName && (
            <p className="mt-1 text-xs text-muted-foreground">
              Selected: {bookFileName}
            </p>
          )}
          {errors.bookFile && (
            <p className="mt-1 text-sm text-red-600">{errors.bookFile}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Is Paid
          </label>
          <SimpleSelect
            value={
              formData.isPaid === true || formData.isPaid === "true"
                ? "true"
                : "false"
            }
            onChange={(value) =>
              setFormData({
                ...formData,
                isPaid: value === "true",
              })
            }
            options={[
              { value: "false", label: "Free" },
              { value: "true", label: "Paid" },
            ]}
            buttonClassName="w-full px-4 py-2 border border-gray-300 dark:border-neutral-800 rounded-lg dark:bg-black dark:text-white cursor-pointer"
          />
          {errors.isPaid && (
            <p className="mt-1 text-sm text-red-600">{errors.isPaid}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Price
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.price ?? 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                price: parseFloat(e.target.value) || 0,
              })
            }
            placeholder="0"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-black dark:text-white ${
              errors.price
                ? "border-red-500"
                : "border-gray-300 dark:border-neutral-800"
            }`}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
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
