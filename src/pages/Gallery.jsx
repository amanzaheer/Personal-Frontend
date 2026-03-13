import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import useApi from "../lib/useApi";
import DataTable from "../components/ui/DataTable";
import SearchBox from "../components/ui/SearchBox";
import ModalSidebar from "../components/ui/ModalSidebar";
import GalleryForm from "../components/Gallery/GalleryForm";
import GalleryCard from "../components/Gallery/GalleryCard";
import GalleryViewModal from "../components/Gallery/GalleryViewModal";
import Toast from "../components/ui/Toast";
import {
  Edit,
  Trash2,
  Plus,
  LayoutGrid,
  List,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useFormatDate } from "../lib/dateUtils";

export default function Gallery() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const api = useApi();
  const { formatDate: formatDateWithTimezone } = useFormatDate();
  const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "";
  const uploadsBaseURL =
    import.meta.env.VITE_UPLOADS_BASE_URL ||
    apiBaseURL.replace(/\/api\/?$/, "");
  const fetchInProgressRef = useRef(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [itemToView, setItemToView] = useState(null);
  const [showConfirmToast, setShowConfirmToast] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "image",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
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
    fetchGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, isAdmin]);

  const fetchGallery = async (page = 1, limit = 10) => {
    if (fetchInProgressRef.current) return;
    fetchInProgressRef.current = true;
    try {
      setLoading(true);
      const response = await api.get("gallery", { page, limit });
      const data = response?.data?.data;
      const galleryData = data?.gallery || response?.data?.gallery || [];
      setItems(Array.isArray(galleryData) ? galleryData : []);
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
      setItems([]);
      toast.error(
        error?.response?.data?.message || "Failed to fetch gallery items",
      );
    } finally {
      fetchInProgressRef.current = false;
      setLoading(false);
    }
  };

  const refreshGallery = () => {
    fetchGallery(pagination.page);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", formData.title || "");
    fd.append("type", formData.type || "image");
    if (imageFile) fd.append("image", imageFile);
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
      const response = await api.postForm("gallery", fd);
      if (response?.data?.success || response?.data?.data) {
        toast.success(
          response?.data?.message || "Gallery item created successfully",
        );
        closeCreateModal();
        refreshGallery();
      } else {
        toast.error(
          response?.data?.message || "Failed to create gallery item",
        );
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to create gallery item";
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
    const id = selectedItem?._id || selectedItem?.id;
    if (!id || !formData.title?.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }
    setIsUpdating(true);
    try {
      const fd = buildFormData();
      const response = await api.putForm(`gallery/${id}`, fd);
      if (response?.data?.success || response?.data?.data) {
        toast.success(
          response?.data?.message || "Gallery item updated successfully",
        );
        closeUpdateModal();
        refreshGallery();
      } else {
        toast.error(
          response?.data?.message || "Failed to update gallery item",
        );
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update gallery item";
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

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmToast(true);
  };

  const handleConfirmDelete = async () => {
    const id = itemToDelete?._id || itemToDelete?.id;
    if (!itemToDelete || !id) {
      toast.error("Invalid gallery item selected for deletion");
      setShowConfirmToast(false);
      setItemToDelete(null);
      return;
    }
    setShowConfirmToast(false);
    setLoading(true);
    try {
      const response = await api.delete(`gallery/${id}`);
      if (
        response?.data?.success ||
        response?.data?.message?.toLowerCase?.()?.includes("success") ||
        (response?.status >= 200 && response?.status < 300)
      ) {
        toast.success(
          response?.data?.message || "Gallery item deleted successfully",
        );
        refreshGallery();
      } else {
        toast.error(
          response?.data?.message ||
            response?.data?.error ||
            "Failed to delete gallery item",
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to delete gallery item",
      );
    } finally {
      setLoading(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmToast(false);
    setItemToDelete(null);
  };

  const openCreateModal = () => {
    resetForm();
    setErrors({});
    setImageFile(null);
    setImagePreview(null);
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
      setImageFile(null);
      setImagePreview(null);
    }, 300);
  };

  const openUpdateModal = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title || "",
      type: item.type || "image",
    });
    setImageFile(null);
    const imgPath = item.image;
    if (imgPath && imgPath.trim()) {
      const imgUrl = imgPath.startsWith("http")
        ? imgPath
        : import.meta.env.DEV
          ? `/${imgPath.replace(/^\/+/, "")}`
          : `${uploadsBaseURL.replace(/\/+$/, "")}/${imgPath.replace(
              /^\/+/,
              "",
            )}`;
      setImagePreview(imgUrl);
    } else {
      setImagePreview(null);
    }
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
      setSelectedItem(null);
      setErrors({});
      setImageFile(null);
      setImagePreview(null);
    }, 300);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "image",
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const galleryMap = useMemo(() => {
    const map = {};
    if (Array.isArray(items)) {
      items.forEach((g) => {
        const id = g?._id || g?.id;
        if (g && id) map[id] = g;
      });
    }
    return map;
  }, [items]);

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

  const buildAssetUrl = (path) => {
    if (!path || typeof path !== "string") return null;
    const trimmed = path.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("http")) return trimmed;
    const p = trimmed.replace(/^\/+/, "");
    if (!p) return null;
    return import.meta.env.DEV
      ? `/${p}`
      : `${uploadsBaseURL.replace(/\/+$/, "")}/${p}`;
  };

  const getImageUrl = (item) => buildAssetUrl(item?.image);

  const openViewModal = (item) => {
    setItemToView(item);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setItemToView(null);
  };

  const renderActions = (itemId) => {
    const item = galleryMap[itemId];
    if (!item)
      return <div className="flex items-center justify-center gap-2">-</div>;

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openViewModal(item)}
          className="p-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-md hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer transition-colors duration-200"
          title="View"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => openUpdateModal(item)}
          className="p-1.5 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 rounded-md hover:text-yellow-800 dark:hover:text-yellow-300 cursor-pointer transition-colors duration-200"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDeleteClick(item)}
          className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md hover:text-white hover:bg-red-600 dark:hover:text-red-300 cursor-pointer transition-colors duration-200"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const filteredItemsForCards = useMemo(() => {
    if (!Array.isArray(items)) return [];
    if (!cardsSearchQuery?.trim()) return items;
    const q = cardsSearchQuery.toLowerCase().trim();
    return items.filter(
      (g) =>
        (g.title || "").toLowerCase().includes(q) ||
        (g.type || "").toLowerCase().includes(q),
    );
  }, [items, cardsSearchQuery]);

  const prepareTableItems = () => {
    if (!Array.isArray(items)) return [];
    return items.map((item, index) => {
      const imgUrl = getImageUrl(item);
      return {
        serial: index + 1,
        actions: renderActions(item._id || item.id),
        image: imgUrl ? (
          <img
            src={imgUrl}
            alt={item.title}
            className="w-16 h-12 rounded object-cover"
          />
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
        title: item.title || "-",
        type: item.type || "image",
        createdAt: formatDate(item.createdAt),
        updatedAt: formatDate(item.updatedAt),
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
              searchPlaceholder="Search gallery..."
              refreshData={refreshGallery}
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
                    Add Gallery Item
                  </button>
                </div>
              }
              heads={[
                "Sr#",
                "Actions",
                "Image",
                "Title",
                "Type",
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
                    placeholder="Search gallery..."
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
                    onClick={refreshGallery}
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
                    Add Gallery Item
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
                </div>
              ) : filteredItemsForCards.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  No gallery items found
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItemsForCards.map((item) => (
                      <GalleryCard
                        key={item._id || item.id}
                        item={item}
                        getImageUrl={getImageUrl}
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
                        Showing {filteredItemsForCards.length} of{" "}
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
            title="Create Gallery Item"
            icon={Plus}
            errorMessage={errors.general}
          >
            <GalleryForm
              mode="create"
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onSubmit={handleCreate}
              onCancel={closeCreateModal}
              isLoading={isCreating}
            />
          </ModalSidebar>
        )}

        {showUpdateModal && selectedItem && (
          <ModalSidebar
            isOpen={isOpenUpdate}
            onClose={closeUpdateModal}
            title="Update Gallery Item"
            icon={Edit}
            subtitle={`Editing: ${selectedItem.title}`}
            errorMessage={errors.general}
          >
            <GalleryForm
              mode="edit"
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              onSubmit={handleUpdate}
              onCancel={closeUpdateModal}
              isLoading={isUpdating}
            />
          </ModalSidebar>
        )}

        {showConfirmToast && itemToDelete && (
          <Toast
            message={`Are you sure you want to delete "${itemToDelete.title}"? This action cannot be undone.`}
            type="warning"
            onClose={handleCancelDelete}
            duration={0}
            actions={[
              { label: "Cancel", onClick: handleCancelDelete },
              { label: "Delete", onClick: handleConfirmDelete },
            ]}
          />
        )}

        <GalleryViewModal
          item={itemToView}
          isOpen={showViewModal}
          onClose={closeViewModal}
          getImageUrl={getImageUrl}
          formatDate={formatDate}
        />
      </div>
    </>
  );
}

