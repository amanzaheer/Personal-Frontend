import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import useApi from "../lib/useApi";
import DataTable from "../components/ui/DataTable";
import SearchBox from "../components/ui/SearchBox";
import ModalSidebar from "../components/ui/ModalSidebar";
import SliderForm from "../components/Sliders/SliderForm";
import SliderCard from "../components/Sliders/SliderCard";
import Toast from "../components/ui/Toast";
import {
  Edit,
  Trash2,
  Plus,
  UserCheck,
  Clock,
  LayoutGrid,
  List,
  RefreshCw,
} from "lucide-react";
import { useFormatDate } from "../lib/dateUtils";

const STATUS_OPTIONS = ["active", "inactive"];

export default function Sliders() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlider, setSelectedSlider] = useState(null);
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
  const [showConfirmToast, setShowConfirmToast] = useState(false);
  const [sliderToDelete, setSliderToDelete] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenUpdate, setIsOpenUpdate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    order: 1,
    status: "active",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [viewMode, setViewMode] = useState("table");
  const [cardsSearchQuery, setCardsSearchQuery] = useState("");

  useEffect(() => {
    fetchSliders();
  }, [pagination.page]);

  const fetchSliders = async (page = 1, limit = 10) => {
    if (fetchInProgressRef.current) return;
    fetchInProgressRef.current = true;
    try {
      setLoading(true);
      const response = await api.get("sliders", { page, limit });
      const data = response?.data?.data;
      const sliderData = data?.sliders || response?.data?.sliders || [];
      setSliders(Array.isArray(sliderData) ? sliderData : []);
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
      setSliders([]);
      toast.error(error?.response?.data?.message || "Failed to fetch sliders");
    } finally {
      fetchInProgressRef.current = false;
      setLoading(false);
    }
  };

  const refreshSliders = () => {
    fetchSliders(pagination.page);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", formData.title || "");
    fd.append("description", formData.description || "");
    fd.append("buttonText", formData.buttonText || "");
    fd.append("buttonLink", formData.buttonLink || "");
    fd.append("order", String(formData.order ?? 1));
    fd.append("status", formData.status || "active");
    if (imageFile) fd.append("image", imageFile);
    if (iconFile) fd.append("icon", iconFile);
    (imagesFiles || []).forEach((f) => fd.append("images", f));
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
      const response = await api.postForm("sliders", fd);
      if (response?.data?.success || response?.data?.data) {
        toast.success(response?.data?.message || "Slider created successfully");
        closeCreateModal();
        refreshSliders();
      } else {
        toast.error(response?.data?.message || "Failed to create slider");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to create slider";
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
    const id = selectedSlider?._id || selectedSlider?.id;
    if (!id || !formData.title?.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }
    setIsUpdating(true);
    try {
      const fd = buildFormData();
      const response = await api.putForm(`sliders/${id}`, fd);
      if (response?.data?.success || response?.data?.data) {
        toast.success(response?.data?.message || "Slider updated successfully");
        closeUpdateModal();
        refreshSliders();
      } else {
        toast.error(response?.data?.message || "Failed to update slider");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update slider";
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

  const handleDeleteClick = (slider) => {
    setSliderToDelete(slider);
    setShowConfirmToast(true);
  };

  const handleConfirmDelete = async () => {
    const id = sliderToDelete?._id || sliderToDelete?.id;
    if (!sliderToDelete || !id) {
      toast.error("Invalid slider selected for deletion");
      setShowConfirmToast(false);
      setSliderToDelete(null);
      return;
    }
    setShowConfirmToast(false);
    setLoading(true);
    try {
      const response = await api.delete(`sliders/${id}`);
      if (
        response?.data?.success ||
        response?.data?.message?.toLowerCase?.()?.includes("success") ||
        (response?.status >= 200 && response?.status < 300)
      ) {
        toast.success(response?.data?.message || "Slider deleted successfully");
        refreshSliders();
      } else {
        toast.error(
          response?.data?.message ||
            response?.data?.error ||
            "Failed to delete slider",
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to delete slider",
      );
    } finally {
      setLoading(false);
      setSliderToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmToast(false);
    setSliderToDelete(null);
  };

  const openCreateModal = () => {
    resetForm();
    setErrors({});
    setImageFile(null);
    setImagePreview(null);
    setIconFile(null);
    setIconPreview(null);
    setImagesFiles([]);
    setImagesPreviews([]);
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
      setIconFile(null);
      setIconPreview(null);
      setImagesFiles([]);
      setImagesPreviews([]);
    }, 300);
  };

  const openUpdateModal = (slider) => {
    setSelectedSlider(slider);
    setFormData({
      title: slider.title || "",
      description: slider.description || "",
      buttonText: slider.buttonText || "",
      buttonLink: slider.buttonLink || "",
      order: slider.order ?? 1,
      status: slider.status || "active",
    });
    setImageFile(null);
    const imgPath = slider.image;
    if (imgPath && imgPath.trim()) {
      const imgUrl = imgPath.startsWith("http")
        ? imgPath
        : import.meta.env.DEV
          ? `/${imgPath.replace(/^\/+/, "")}`
          : `${uploadsBaseURL.replace(/\/+$/, "")}/${imgPath.replace(/^\/+/, "")}`;
      setImagePreview(imgUrl);
    } else {
      setImagePreview(null);
    }
    setIconFile(null);
    const iconPath = slider.icon;
    if (iconPath && iconPath.trim()) {
      const iconUrl = iconPath.startsWith("http")
        ? iconPath
        : import.meta.env.DEV
          ? `/${iconPath.replace(/^\/+/, "")}`
          : `${uploadsBaseURL.replace(/\/+$/, "")}/${iconPath.replace(/^\/+/, "")}`;
      setIconPreview(iconUrl);
    } else {
      setIconPreview(null);
    }
    setImagesFiles([]);
    const imgs = Array.isArray(slider.images) ? slider.images : [];
    if (imgs.length > 0) {
      const urls = imgs
        .map((p) =>
          p && p.trim()
            ? p.startsWith("http")
              ? p
              : import.meta.env.DEV
                ? `/${p.replace(/^\/+/, "")}`
                : `${uploadsBaseURL.replace(/\/+$/, "")}/${p.replace(/^\/+/, "")}`
            : null
        )
        .filter(Boolean);
      setImagesPreviews(urls);
    } else {
      setImagesPreviews([]);
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
      setSelectedSlider(null);
      setErrors({});
      setImageFile(null);
      setImagePreview(null);
      setIconFile(null);
      setIconPreview(null);
      setImagesFiles([]);
      setImagesPreviews([]);
    }, 300);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      order: 1,
      status: "active",
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

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setIconPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setIconFile(null);
      setIconPreview(null);
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImagesFiles(files);
      const loadAll = () => {
        let done = 0;
        const results = [];
        files.forEach((f, i) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            results[i] = reader.result;
            done++;
            if (done === files.length) setImagesPreviews(results);
          };
          reader.readAsDataURL(f);
        });
      };
      loadAll();
    } else {
      setImagesFiles([]);
      setImagesPreviews([]);
    }
  };

  const sliderMap = useMemo(() => {
    const map = {};
    if (Array.isArray(sliders)) {
      sliders.forEach((s) => {
        const id = s?._id || s?.id;
        if (s && id) map[id] = s;
      });
    }
    return map;
  }, [sliders]);

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

  const formatStatus = (status) => {
    const isActive = status === "active";
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
          isActive
            ? "text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30"
            : "text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30"
        }`}
      >
        {isActive ? (
          <UserCheck className="w-3 h-3" />
        ) : (
          <Clock className="w-3 h-3" />
        )}
        {status === "active" ? "Active" : "Inactive"}
      </span>
    );
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

  const getImageUrl = (slider) => buildAssetUrl(slider?.image);
  const getIconUrl = (slider) => buildAssetUrl(slider?.icon);
  const getImagesUrls = (slider) => {
    const arr = slider?.images;
    if (!Array.isArray(arr)) return [];
    return arr.map((p) => buildAssetUrl(p)).filter(Boolean);
  };

  const renderActions = (sliderId) => {
    const slider = sliderMap[sliderId];
    if (!slider)
      return <div className="flex items-center justify-center gap-2">-</div>;

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openUpdateModal(slider)}
          className="p-1.5 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 rounded-md hover:text-yellow-800 dark:hover:text-yellow-300 cursor-pointer transition-colors duration-200"
          title="Edit"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleDeleteClick(slider)}
          className="p-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-md hover:text-white hover:bg-red-600 dark:hover:text-red-300 cursor-pointer transition-colors duration-200"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const filteredSlidersForCards = useMemo(() => {
    if (!Array.isArray(sliders)) return [];
    if (!cardsSearchQuery?.trim()) return sliders;
    const q = cardsSearchQuery.toLowerCase().trim();
    return sliders.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q),
    );
  }, [sliders, cardsSearchQuery]);

  const prepareTableItems = () => {
    if (!Array.isArray(sliders)) return [];
    return sliders.map((slider, index) => {
      const imgUrl = getImageUrl(slider);
      const iconUrl = getIconUrl(slider);
      const imagesUrls = getImagesUrls(slider);
      return {
        serial: index + 1,
        actions: renderActions(slider._id || slider.id),
        image: imgUrl ? (
          <img
            src={imgUrl}
            alt={slider.title}
            className="w-12 h-10 rounded object-cover"
          />
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        ),
        iconImages: (
          <div className="flex items-center gap-2">
            {iconUrl ? (
              <img
                src={iconUrl}
                alt="Icon"
                className="w-8 h-8 rounded object-contain border border-gray-200 dark:border-neutral-700"
              />
            ) : (
              <span className="text-muted-foreground text-xs">-</span>
            )}
            {imagesUrls.length > 0 && (
              <span className="text-xs text-muted-foreground">
                +{imagesUrls.length} img
              </span>
            )}
          </div>
        ),
        title: slider.title || "-",
        description:
          slider.description?.length > 50
            ? `${slider.description.slice(0, 50)}...`
            : slider.description || "-",
        order: slider.order ?? "-",
        status: formatStatus(slider.status),
        createdAt: formatDate(slider.createdAt),
        updatedAt: formatDate(slider.updatedAt),
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
              searchPlaceholder="Search sliders..."
              refreshData={refreshSliders}
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
                    Add Slider
                  </button>
                </div>
              }
              heads={[
                "Sr#",
                "Actions",
                "Image",
                "Icon/Images",
                "Title",
                "Description",
                "Order",
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
                    placeholder="Search sliders..."
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
                    onClick={refreshSliders}
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
                    Add Slider
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent" />
                </div>
              ) : filteredSlidersForCards.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  No sliders found
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredSlidersForCards.map((slider) => (
                      <SliderCard
                        key={slider._id || slider.id}
                        slider={slider}
                        getImageUrl={getImageUrl}
                        getIconUrl={getIconUrl}
                        getImagesUrls={getImagesUrls}
                        formatStatus={formatStatus}
                        formatDate={formatDate}
                        onEdit={openUpdateModal}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </div>
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800">
                      <p className="text-sm text-muted-foreground">
                        Showing {filteredSlidersForCards.length} of{" "}
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
            title="Create New Slider"
            icon={Plus}
            errorMessage={errors.general}
          >
            <SliderForm
              mode="create"
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              iconPreview={iconPreview}
              onIconChange={handleIconChange}
              imagesPreviews={imagesPreviews}
              onImagesChange={handleImagesChange}
              onSubmit={handleCreate}
              onCancel={closeCreateModal}
              isLoading={isCreating}
            />
          </ModalSidebar>
        )}

        {showUpdateModal && selectedSlider && (
          <ModalSidebar
            isOpen={isOpenUpdate}
            onClose={closeUpdateModal}
            title="Update Slider"
            icon={Edit}
            subtitle={`Editing: ${selectedSlider.title}`}
            errorMessage={errors.general}
          >
            <SliderForm
              mode="edit"
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              imagePreview={imagePreview}
              onImageChange={handleImageChange}
              iconPreview={iconPreview}
              onIconChange={handleIconChange}
              imagesPreviews={imagesPreviews}
              onImagesChange={handleImagesChange}
              onSubmit={handleUpdate}
              onCancel={closeUpdateModal}
              isLoading={isUpdating}
            />
          </ModalSidebar>
        )}

        {showConfirmToast && sliderToDelete && (
          <Toast
            message={`Are you sure you want to delete "${sliderToDelete.title}"? This action cannot be undone.`}
            type="warning"
            onClose={handleCancelDelete}
            duration={0}
            actions={[
              { label: "Cancel", onClick: handleCancelDelete },
              { label: "Delete", onClick: handleConfirmDelete },
            ]}
          />
        )}
      </div>
    </>
  );
}
