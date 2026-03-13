import React from "react";
import { Edit, Trash2, ImageIcon } from "lucide-react";

export default function SliderCard({
  slider,
  getImageUrl,
  getIconUrl,
  getImagesUrls,
  formatStatus,
  formatDate,
  onEdit,
  onDelete,
}) {
  const imgUrl = getImageUrl?.(slider);
  const iconUrl = getIconUrl?.(slider);
  const imagesUrls = getImagesUrls?.(slider) ?? [];

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:border-accent/30 transition-all duration-300 ease-out hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative aspect-[16/10] w-full bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        {imgUrl ? (
          <>
            <img
              src={imgUrl}
              alt={slider.title}
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
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          {formatStatus(slider.status)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <h3 className="slider-card-title text-lg font-semibold text-foreground tracking-tight mb-2 line-clamp-1">
          {slider.title || "-"}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-2 flex-1">
          {slider.description || "-"}
        </p>
        {(iconUrl || imagesUrls.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap mb-3">
            {iconUrl && (
              <img
                src={iconUrl}
                alt="Icon"
                className="w-12 h-16 rounded object-contain border border-border/60"
              />
            )}
            {imagesUrls.length > 0 && (
              <div className="flex gap-1">
                {imagesUrls.slice(0, 3).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Thumb ${i + 1}`}
                    className="w-10 h-10 rounded object-cover border border-border/60"
                  />
                ))}
                {imagesUrls.length > 3 && (
                  <span className="text-xs text-muted-foreground self-center">
                    +{imagesUrls.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className="text-xs font-medium text-muted-foreground/90 tracking-widest uppercase">
            Order {slider.order ?? "-"}
          </span>
          <span className="text-xs text-muted-foreground/80">
            {formatDate(slider.updatedAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex items-center justify-end gap-2">
        <button
          onClick={() => onEdit(slider)}
          className="p-2.5 rounded-xl text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:scale-105 cursor-pointer transition-all duration-200"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(slider)}
          className="p-2.5 rounded-xl text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 hover:scale-105 cursor-pointer transition-all duration-200"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
