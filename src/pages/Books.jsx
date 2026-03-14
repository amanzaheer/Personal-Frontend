import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import useApi from "../lib/useApi";
import DataTable from "../components/ui/DataTable";
import SearchBox from "../components/ui/SearchBox";
import ModalSidebar from "../components/ui/ModalSidebar";
import BookForm from "../components/Books/BookForm";
import BookCard from "../components/Books/BookCard";
import BookViewModal from "../components/Books/BookViewModal";
import Toast from "../components/ui/Toast";
import {
  Edit,
  Trash2,
  Plus,
  DollarSign,
  FileText,
  LayoutGrid,
  List,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useFormatDate } from "../lib/dateUtils";
import { buildUploadUrl } from "../lib/uploadUrl";

export default function Books() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const api = useApi();
  const { formatDate: formatDateWithTimezone } = useFormatDate();
  const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "";
  const fetchInProgressRef = useRef(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [bookToView, setBookToView] = useState(null);
  const [showConfirmToast, setShowConfirmToast] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    isPaid: false,
    price: 0,
  });
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [bookFileName, setBookFileName] = useState("");
  const [errors, setErrors] = useState({});
  const [viewMode, setViewMode] = useState("table");
  const [cardsSearchQuery, setCardsSearchQuery] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;
      const role = user?.role?.toLowerCase?.();
      if (role !== "admin") {
        navigate("/dashboard", { replace: true });
        return;
      }
      setIsAdmin(true);
    } catch {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (isAdmin !== true) return;
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, isAdmin]);

  const fetchBooks = async (page = 1, limit = 10) => {
    if (fetchInProgressRef.current) return;
    fetchInProgressRef.current = true;
    try {
      setLoading(true);
      const response = await api.get("books", { page, limit });
      const data = response?.data?.data;
      const bookData = data?.books || response?.data?.books || [];
      setBooks(Array.isArray(bookData) ? bookData : []);
      if (data?.pagination) {
        setPagination((prev) => ({
          ...prev,
          page: data.pagination.page ?? page,
          limit: data.pagination.limit ?? limit,
          total: data.pagination.total ?? 0,
          pages: data.pagination.pages ?? 1,
        }));
      }
    } catch (error) {
      setBooks([]);
      toast.error(error?.response?.data?.message || "Failed to fetch books");
    } finally {
      fetchInProgressRef.current = false;
      setLoading(false);
    }
  };

  const refreshBooks = () => {
    fetchBooks(pagination.page);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", formData.title || "");
    fd.append("author", formData.author || "");
    fd.append("description", formData.description || "");
    fd.append("isPaid", String(formData.isPaid === true || formData.isPaid === "true"));
    fd.append("price", String(formData.price ?? 0));
    if (coverImageFile) fd.append("coverImage", coverImageFile);
    if (bookFile) fd.append("bookFile", bookFile);
    return fd;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!formData.title?.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }
    setIsCreating(true);
    try {
      const fd = buildFormData();
      const response = await api.postForm("books", fd);
      if (response?.data?.success || response?.data?.data) {
        toast.success(response?.data?.message || "Book created successfully");
        closeCreateModal();
        refreshBooks();
      } else {
        toast.error(response?.data?.message || "Failed to create book");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to create book";
      toast.error(msg);
      if (
        error?.response?.data?.error &&
        typeof error.response.data.error === "object"
      ) {
        setErrors(error.response.data.error);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrors({});
    const id = selectedBook?._id || selectedBook?.id;
    if (!id || !formData.title?.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }
    setIsUpdating(true);
    try {
      const fd = buildFormData();
      const response = await api.putForm(`books/${id}`, fd);
      if (response?.data?.success || response?.data?.data) {
        toast.success(response?.data?.message || "Book updated successfully");
        closeUpdateModal();
        refreshBooks();
      } else {
        toast.error(response?.data?.message || "Failed to update book");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update book";
      toast.error(msg);
      if (
        error?.response?.data?.error &&
        typeof error.response.data.error === "object"
      ) {
        setErrors(error.response.data.error);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setShowConfirmToast(true);
  };

  const handleConfirmDelete = async () => {
    const id = bookToDelete?._id || bookToDelete?.id;
    if (!bookToDelete || !id) {
      toast.error("Invalid book selected for deletion");
      setShowConfirmToast(false);
      setBookToDelete(null);
      return;
    }
    setShowConfirmToast(false);
    setLoading(true);
    try {
      const response = await api.delete(`books/${id}`);
      if (
        response?.data?.success ||
        response?.data?.message?.toLowerCase?.()?.includes("success") ||
        (response?.status >= 200 && response?.status < 300)
      ) {
        toast.success(response?.data?.message || "Book deleted successfully");
        refreshBooks();
      } else {
        toast.error(
          response?.data?.message ||
            response?.data?.error ||
            "Failed to delete book",
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to delete book",
      );
    } finally {
      setLoading(false);
      setBookToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmToast(false);
    setBookToDelete(null);
  };

  const openCreateModal = () => {
    resetForm();
    setErrors({});
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setBookFile(null);
    setBookFileName("");
    setShowCreateModal(true);
    setTimeout(() => setIsMounted(true), 10);
    setTimeout(() => setIsOpenCreate(true), 50);
  };

  const closeCreateModal = () => {
    setIsOpenCreate(false);
    setTimeout(() => {
      setShowCreateModal(false);
      setIsMounted(false);
      setErrors({});
      setCoverImageFile(null);
      setCoverImagePreview(null);
      setBookFile(null);
      setBookFileName("");
    }, 300);
  };

  const openUpdateModal = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title || "",
      author: book.author || "",
      description: book.description || "",
      isPaid: book.isPaid === true || book.isPaid === "true",
      price: book.price ?? 0,
    });
    setCoverImageFile(null);
    const coverPath = book.coverImage || book.coverimage;
    if (coverPath && coverPath.trim()) {
      setCoverImagePreview(buildUploadUrl(coverPath) || coverPath);
    } else {
      setCoverImagePreview(null);
    }
    setBookFile(null);
    setBookFileName(book.bookFile ? (book.bookFile.split("/").pop() || "") : "");
    setErrors({});
    setShowUpdateModal(true);
    setTimeout(() => setIsMounted(true), 10);
    setTimeout(() => setIsOpenUpdate(true), 50);
  };

  const closeUpdateModal = () => {
    setIsOpenUpdate(false);
    setTimeout(() => {
      setShowUpdateModal(false);
      setIsMounted(false);
      setSelectedBook(null);
      setErrors({});
      setCoverImageFile(null);
      setCoverImagePreview(null);
      setBookFile(null);
      setBookFileName("");
    }, 300);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      description: "",
      isPaid: false,
      price: 0,
    });
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setCoverImageFile(null);
      setCoverImagePreview(null);
    }
  };

  const handleBookFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBookFile(file);
      setBookFileName(file.name);
    } else {
      setBookFile(null);
      setBookFileName("");
    }
  };

  const bookMap = useMemo(() => {
    const map = {};
    if (Array.isArray(books)) {
      books.forEach((b) => {
        const id = b?._id || b?.id;
        if (b && id) map[id] = b;
      });
    }
    return map;
  }, [books]);

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

  const formatIsPaid = (isPaid) => {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
          isPaid
            ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
            : "text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30"
        }`}
      >
        {isPaid ? (
          <DollarSign className="w-3 h-3" />
        ) : (
          <FileText className="w-3 h-3" />
        )}
        {isPaid ? "Paid" : "Free"}
      </span>
    );
  };

  const getCoverImageUrl = (book) =>
    buildUploadUrl(book?.coverImage || book?.coverimage);
  const getBookFileUrl = (book) =>
    buildUploadUrl(book?.bookFile || book?.bookfile);

  const openViewModal = (book) => {
    setBookToView(book);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setBookToView(null);
  };

  const renderActions = (bookId) => {
    const book = bookMap[bookId];
    if (!book)
      return <div className="flex items-center justify-center gap-2">-</div>;

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openViewModal(book)}
          className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer transition-colors duration-200"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => openUpdateModal(book)}
          className="p-1.5 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 rounded-md hover:text-yellow-800 dark:hover:text-yellow-300 cursor-pointer transition-colors duration-200"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDeleteClick(book)}
          className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md hover:text-white hover:bg-red-600 dark:hover:text-red-300 cursor-pointer transition-colors duration-200"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const filteredBooksForCards = useMemo(() => {
    if (!Array.isArray(books)) return [];
    if (!cardsSearchQuery?.trim()) return books;
    const q = cardsSearchQuery.toLowerCase().trim();
    return books.filter(
      (b) =>
        (b.title || "").toLowerCase().includes(q) ||
        (b.author || "").toLowerCase().includes(q) ||
        (b.description || "").toLowerCase().includes(q),
    );
  }, [books, cardsSearchQuery]);

  const prepareTableItems = () => {
    if (!Array.isArray(books)) return [];
    return books.map((book, index) => {
      const coverUrl = getCoverImageUrl(book);
      const isPaid = book.isPaid === true || book.isPaid === "true";
      return {
        serial: index + 1,
        actions: renderActions(book._id || book.id),
        coverImage: coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="w-12 h-16 rounded object-cover"
          />
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
        title: book.title || "-",
        author: book.author || "-",
        description:
          book.description?.length > 50
            ? `${book.description.slice(0, 50)}...`
            : book.description || "-",
        price: isPaid ? `$${Number(book.price ?? 0).toFixed(2)}` : "Free",
        isPaid: formatIsPaid(isPaid),
        createdAt: formatDate(book.createdAt),
        updatedAt: formatDate(book.updatedAt),
      };
    });
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-background">
        <Toaster position="top-right" />
        <div className="p-6">
          {viewMode === "table" ? (
            <DataTable
              searchBox
              searchPlaceholder="Search books..."
              refreshData={refreshBooks}
              isLoading={loading}
              pagination
              serverPagination
              currentPage={pagination.page}
              totalPage={pagination.pages}
              totalRecords={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={(p) =>
                setPagination((prev) => ({ ...prev, page: p }))
              }
              actionButtons={
                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-2.5 transition-colors ${
                        viewMode === "table"
                          ? "bg-accent text-accent-foreground"
                          : "bg-white dark:bg-neutral-900 text-muted-foreground hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                      }`}
                      title="Table view"
                    >
                      <List className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("cards")}
                      className={`p-2.5 transition-colors ${
                        viewMode === "cards"
                          ? "bg-accent text-accent-foreground"
                          : "bg-white dark:bg-neutral-900 text-muted-foreground hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                      }`}
                      title="Card view"
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={openCreateModal}
                    className="px-5 py-2.5 cursor-pointer text-sm font-semibold rounded-xl bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:from-accent/90 hover:to-accent/70 disabled:opacity-60 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-100 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Book
                  </button>
                </div>
              }
              heads={[
                "Sr#",
                "Actions",
                "Cover",
                "Title",
                "Author",
                "Description",
                "Price",
                "Status",
                "Created At",
                "Updated At",
              ]}
              items={prepareTableItems()}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-80 max-w-md">
                  <SearchBox
                    type="text"
                    placeholder="Search books..."
                    className="border border-gray-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900"
                    value={cardsSearchQuery}
                    onChange={(e) => setCardsSearchQuery(e.target.value)}
                    inputPadding="py-2.5"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-2.5 transition-colors ${
                        viewMode === "table"
                          ? "bg-accent text-accent-foreground"
                          : "bg-white dark:bg-neutral-900 text-muted-foreground hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                      }`}
                      title="Table view"
                    >
                      <List className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("cards")}
                      className={`p-2.5 transition-colors ${
                        viewMode === "cards"
                          ? "bg-accent text-accent-foreground"
                          : "bg-white dark:bg-neutral-900 text-muted-foreground hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                      }`}
                      title="Card view"
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={refreshBooks}
                    disabled={loading}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors disabled:opacity-50"
                    title="Refresh"
                  >
                    <RefreshCw
                      className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                    />
                  </button>
                  <button
                    onClick={openCreateModal}
                    className="px-5 py-2.5 cursor-pointer text-sm font-semibold rounded-xl bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:from-accent/90 hover:to-accent/70 disabled:opacity-60 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Book
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
                </div>
              ) : filteredBooksForCards.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  No books found
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBooksForCards.map((book) => (
                      <BookCard
                        key={book._id || book.id}
                        book={book}
                        getCoverImageUrl={getCoverImageUrl}
                        formatIsPaid={formatIsPaid}
                        formatDate={formatDate}
                        onView={openViewModal}
                        onEdit={openUpdateModal}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </div>
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredBooksForCards.length} of{" "}
                        {pagination.total} results
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: Math.max(1, prev.page - 1),
                            }))
                          }
                          disabled={pagination.page <= 1}
                          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Previous
                        </button>
                        <span className="text-sm text-muted-foreground">
                          Page {pagination.page} of {pagination.pages}
                        </span>
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: Math.min(pagination.pages, prev.page + 1),
                            }))
                          }
                          disabled={pagination.page >= pagination.pages}
                          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {showCreateModal && (
          <ModalSidebar
            isOpen={isOpenCreate}
            onClose={closeCreateModal}
            title="Create New Book"
            icon={Plus}
            errorMessage={errors.general}
          >
            <BookForm
              mode="create"
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              coverImagePreview={coverImagePreview}
              onCoverImageChange={handleCoverImageChange}
              bookFileName={bookFileName}
              onBookFileChange={handleBookFileChange}
              onSubmit={handleCreate}
              onCancel={closeCreateModal}
              isLoading={isCreating}
            />
          </ModalSidebar>
        )}

        {showUpdateModal && selectedBook && (
          <ModalSidebar
            isOpen={isOpenUpdate}
            onClose={closeUpdateModal}
            title="Update Book"
            icon={Edit}
            subtitle={`Editing: ${selectedBook.title}`}
            errorMessage={errors.general}
          >
            <BookForm
              mode="edit"
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              coverImagePreview={coverImagePreview}
              onCoverImageChange={handleCoverImageChange}
              bookFileName={bookFileName}
              onBookFileChange={handleBookFileChange}
              onSubmit={handleUpdate}
              onCancel={closeUpdateModal}
              isLoading={isUpdating}
            />
          </ModalSidebar>
        )}

        {showConfirmToast && bookToDelete && (
          <Toast
            message={`Are you sure you want to delete "${bookToDelete.title}"? This action cannot be undone.`}
            type="warning"
            onClose={handleCancelDelete}
            duration={0}
            actions={[
              { label: "Cancel", onClick: handleCancelDelete },
              { label: "Delete", onClick: handleConfirmDelete },
            ]}
          />
        )}

        <BookViewModal
          book={bookToView}
          isOpen={showViewModal}
          onClose={closeViewModal}
          getCoverImageUrl={getCoverImageUrl}
          getBookFileUrl={getBookFileUrl}
          formatIsPaid={formatIsPaid}
          formatDate={formatDate}
        />
      </div>
    </>
  );
}
