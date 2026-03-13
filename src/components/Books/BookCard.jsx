import React from "react";
import { Edit, Trash2, ImageIcon, Eye } from "lucide-react";

export default function BookCard({
  book,
  getCoverImageUrl,
  formatIsPaid,
  formatDate,
  onView,
  onEdit,
  onDelete,
}) {
  const coverUrl = getCoverImageUrl?.(book);
  const isPaid = book?.isPaid === true || book?.isPaid === "true";

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-card border border-border/60 shadow-sm hover:shadow-xl hover:shadow-accent/5 hover:border-accent/30 transition-all duration-300 ease-out hover:-translate-y-0.5">
      {/* Cover Image */}
      <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        {coverUrl ? (
          <>
            <img
              src={coverUrl}
              alt={book.title}
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
              No cover
            </span>
          </div>
        )}
        {/* Paid/Free badge */}
        <div className="absolute top-3 right-3">
          {formatIsPaid(isPaid)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <h3 className="text-lg font-semibold text-foreground tracking-tight mb-1 line-clamp-1">
          {book.title || "-"}
        </h3>
        <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
          {book.author || "Unknown author"}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3 flex-1">
          {book.description || "-"}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className="text-sm font-medium text-foreground">
            {isPaid ? `$${Number(book.price ?? 0).toFixed(2)}` : "Free"}
          </span>
          <span className="text-xs text-muted-foreground/80">
            {formatDate(book.updatedAt)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex items-center justify-end gap-2">
        <button
          onClick={() => onView?.(book)}
          className="p-2.5 rounded-xl text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:scale-105 cursor-pointer transition-all duration-200"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(book)}
          className="p-2.5 rounded-xl text-amber-600 dark:text-amber-400 bg-amber-50/80 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 hover:scale-105 cursor-pointer transition-all duration-200"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(book)}
          className="p-2.5 rounded-xl text-red-600 dark:text-red-400 bg-red-50/80 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 hover:scale-105 cursor-pointer transition-all duration-200"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
