import React from "react";
import { Edit, Trash2, ImageIcon, Eye } from "lucide-react";

export default function GalleryCard({
  item,
  getImageUrl,
  formatDate,
  onView,
  onEdit,
  onDelete,
}) {
  const imageUrl = getImageUrl?.(item);

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:border-accent/30 transition-all duration-300 ease-out hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/60">
            <ImageIcon
              className="w-14 h-14 mb-2 opacity-40"
              strokeWidth={1.25}
            />
            <span className="text-xs font-medium tracking-widest uppercase">
              No image
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-foreground tracking-tight line-clamp-1">
          {item.title || "-"}
        </h3>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground line-clamp-1">
          {item.type || "image"}
        </p>
        <p className="text-xs text-muted-foreground/80 mt-2">
          Updated {formatDate(item.updatedAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex items-center justify-end gap-2">
        <button
          onClick={() => onView?.(item)}
          className="p-2.5 rounded-xl text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:scale-105 cursor-pointer transition-all duration-200"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(item)}
          className="p-2.5 rounded-xl text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:scale-105 cursor-pointer transition-all duration-200"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="p-2.5 rounded-xl text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 hover:scale-105 cursor-pointer transition-all duration-200"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

