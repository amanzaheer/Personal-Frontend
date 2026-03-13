import React from "react";
import { Button } from "../ui/button";
import SimpleSelect from "../ui/SimpleSelect";

export default function SliderForm({
  mode,
  formData,
  setFormData,
  errors,
  imagePreview,
  onImageChange,
  iconPreview,
  onIconChange,
  imagesPreviews,
  onImagesChange,
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
            placeholder="Enter slide title"
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
            Description
          </label>
          <textarea
            value={formData.description || ""}
            placeholder="Enter slide description"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Icon (right corner of description)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onIconChange?.(e)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-800 rounded-lg dark:bg-black dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
          />
          {iconPreview && (
            <div className="mt-2">
              <img
                src={iconPreview}
                alt="Icon preview"
                className="max-h-20 w-20 rounded-lg object-contain border border-gray-200 dark:border-neutral-700"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Images (below description, multiple)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onImagesChange?.(e)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-800 rounded-lg dark:bg-black dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-accent/10 file:text-accent hover:file:bg-accent/20"
          />
          {(imagesPreviews?.length ?? 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {imagesPreviews.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="h-16 w-16 rounded-lg object-cover border border-gray-200 dark:border-neutral-700"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Button Text
          </label>
          <input
            type="text"
            value={formData.buttonText || ""}
            placeholder="e.g. Learn More"
            onChange={(e) =>
              setFormData({ ...formData, buttonText: e.target.value })
            }
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-black dark:text-white ${
              errors.buttonText
                ? "border-red-500"
                : "border-gray-300 dark:border-neutral-800"
            }`}
          />
          {errors.buttonText && (
            <p className="mt-1 text-sm text-red-600">{errors.buttonText}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Button Link
          </label>
          <input
            type="text"
            value={formData.buttonLink || ""}
            placeholder="e.g. /about"
            onChange={(e) =>
              setFormData({ ...formData, buttonLink: e.target.value })
            }
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-black dark:text-white ${
              errors.buttonLink
                ? "border-red-500"
                : "border-gray-300 dark:border-neutral-800"
            }`}
          />
          {errors.buttonLink && (
            <p className="mt-1 text-sm text-red-600">{errors.buttonLink}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Order
          </label>
          <input
            type="number"
            min="1"
            value={formData.order ?? 1}
            onChange={(e) =>
              setFormData({
                ...formData,
                order: parseInt(e.target.value, 10) || 1,
              })
            }
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-black dark:text-white ${
              errors.order
                ? "border-red-500"
                : "border-gray-300 dark:border-neutral-800"
            }`}
          />
          {errors.order && (
            <p className="mt-1 text-sm text-red-600">{errors.order}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
            Status
          </label>
          <SimpleSelect
            value={formData.status || "active"}
            onChange={(value) => setFormData({ ...formData, status: value })}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            buttonClassName="w-full px-4 py-2 border border-gray-300 dark:border-neutral-800 rounded-lg dark:bg-black dark:text-white cursor-pointer"
          />
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
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
