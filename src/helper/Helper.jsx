import toast from "react-hot-toast";

export function formatFirstName(name) {
  let value = name.replace(/[^A-Za-z\s]/g, "");
  value = value.replace(/^\s+/, "");
  if (value.length > 0) {
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }
  return value;
}

export function formatLastName(name) {
  let value = name.replace(/[^A-Za-z\s]/g, "");
  value = value.replace(/^\s+/, "");
  if (value.length > 0) {
    value = value.charAt(0).toUpperCase() + value.slice(1);
  }
  return value;
}

export function validateEmail(email) {
  if (!email) return false;

  const value = email.trim().toLowerCase();
  const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

  return regex.test(value);
}

export function formatMobile(mobile) {
  let value = mobile.replace(/[^0-9]/g, "");
 if (value.length === 1 && value.startsWith("0")) {
    value = ""; // block it entirely
  }
  return value;
}

export function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

/**
 * Generic function to check if field is empty
 */
export function isEmpty(value) {
  return !value || value.trim().length === 0;
}


// ✅ Utility: add a helper for video detection
export function isVideoFile (filename) {
  return /\.(mp4|webm|ogg|mov)$/i.test(filename);
};

// // utils/fileHelpers.js

export const isImage = (filename = "") =>
  /\.(png|jpe?g|gif|webp|bmp)$/i.test(filename);

  export const isViewableInBrowser = (filename = "") => {
  const viewableExtensions =
    /\.(pdf|txt|json|xml|html|htm|csv|md|log|xlsx|xls|xlsm|xlsb|docx|doc|pptx|ppt)$/i;
  return viewableExtensions.test(filename);
};

export const getFileExtension = (filename = "")=> {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext || "";
};

export const isPDF = (filename = "") => /\.pdf$/i.test(filename);

// Get file type badge styling and text
export const getFileTypeBadge = (filename = "") => {
  const ext = getFileExtension(filename);

  const badges = {
    // Documents
    pdf: {
      text: "PDF",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
    doc: {
      text: "DOC",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    docx: {
      text: "DOCX",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },

    // Spreadsheets
    xls: {
      text: "XLS",
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    xlsx: {
      text: "XLSX",
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    xlsm: {
      text: "XLSM",
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    xlsb: {
      text: "XLSB",
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    csv: {
      text: "CSV",
      color:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },

    // Presentations
    ppt: {
      text: "PPT",
      color:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    },
    pptx: {
      text: "PPTX",
      color:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    },

    // Text files
    txt: {
      text: "TXT",
      color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    },
    md: {
      text: "MD",
      color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    },
    log: {
      text: "LOG",
      color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    },

    // Code files
    json: {
      text: "JSON",
      color:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    xml: {
      text: "XML",
      color:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    html: {
      text: "HTML",
      color:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    htm: {
      text: "HTM",
      color:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },

    // Images
    jpg: {
      text: "JPG",
      color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    },
    jpeg: {
      text: "JPEG",
      color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    },
    png: {
      text: "PNG",
      color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    },
    gif: {
      text: "GIF",
      color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    },
    webp: {
      text: "WEBP",
      color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    },
    bmp: {
      text: "BMP",
      color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    },

    // Archives
    zip: {
      text: "ZIP",
      color:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    },
    rar: {
      text: "RAR",
      color:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    },
    "7z": {
      text: "7Z",
      color:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    },

    // Video
    mp4: {
      text: "MP4",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
    avi: {
      text: "AVI",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
    mov: {
      text: "MOV",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },

    // Audio
    mp3: {
      text: "MP3",
      color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    },
    wav: {
      text: "WAV",
      color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
    },
  };

  return (
    badges[ext] || {
      text: ext.toUpperCase() || "FILE",
      color: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
    }
  );
};


export async function handleTicketUpdate(
  api,  
  ticket,
  updates,
  {
    developers = [],
    setSelectedTicket,
    fetchSingleTicket,
    successMessage,
    setIsUpdatingStatus,
  } = {}
) {
  if (setIsUpdatingStatus) setIsUpdatingStatus(true);

  try {
    const response = await api.put(`support/tickets/${ticket._id}`, updates, {
      headers:
        updates instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : undefined,
    });

    if (response?.data) {
      let updatedTicket = { ...ticket, ...updates };

      if (updates.assignedTo && Array.isArray(developers)) {
        const assignedUser = developers.find(
          (dev) => dev._id === updates.assignedTo
        );
        updatedTicket.assignedTo = assignedUser || null;
      }

      if (setSelectedTicket) {
        setSelectedTicket(updatedTicket);
      }

      if (fetchSingleTicket) {
        setTimeout(() => fetchSingleTicket(ticket._id), 500);
      }

      if (successMessage) {
        toast.success(successMessage);
      } else if (updates.status) {
        toast.success("Status updated successfully");
      } else if ("assignedTo" in updates) {
        toast.success(
          updatedTicket.assignedTo
            ? `Ticket assigned to ${
                updatedTicket.assignedTo.personalInfo?.firstName
                  ? `${updatedTicket.assignedTo.personalInfo.firstName} ${updatedTicket.assignedTo.personalInfo.lastName}`
                  : updatedTicket.assignedTo.username ||
                    updatedTicket.assignedTo.email
              }`
            : "Ticket unassigned"
        );
      }

      return true;
    } else {
      toast.error("Failed to update ticket");
      return false;
    }
  } catch (error) {
    console.error("Ticket update error:", error);
    toast.error(error?.response?.data?.message || "Failed to update ticket");
    return false;
  } finally {
    if (setIsUpdatingStatus) setIsUpdatingStatus(false);
  }
}

/** ------------------------------------------------------------------------
 *  File size validation utility
 * --------------------------------------------------------------------- */
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes

export const validateFileSize = (files) => {
  const oversizedFiles = [];
  const validFiles = [];

  Array.from(files).forEach((file) => {
    if (file.size > MAX_FILE_SIZE) {
      oversizedFiles.push(file.name);
    } else {
      validFiles.push(file);
    }
  });

  if (oversizedFiles.length > 0) {
    toast.error(
      `Image size is too large! Only images below 3MB can be uploaded. Please compress or resize: ${oversizedFiles.join(
        ", "
      )}`
    );
  }

  return validFiles;
};


export const handleDeleteEntity = async ({ api, entityType, entity, onClose, onRefresh }) => {
  if (!entity) return;
  const entityName = capitalize(entityType);

  try {
    const { data } = await api.delete(`/merchant/delete/${entity._id}`);

    const isSuccess =
      data?._id ||
      data?.message?.includes('successfully') ||
      data?.data ||
      (typeof data === 'object' && Object.keys(data).length === 0);

    if (isSuccess) {
      toast.success(data?.message || `${entityName} deleted successfully`);
      onClose();
      onRefresh();
    } else {
      toast.error(data?.message || `Failed to delete ${entityType}`);
    }
  } catch (error) {
    console.error(`Error deleting ${entityType}:`, error);

    const errData = error.response?.data;
    if (errData?.error) {
      toast.error(errData.details ? `${errData.error}: ${errData.details}` : errData.error);
    } else if (errData?.message) {
      toast.error(errData.message);
    } else if (error.message) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.error(`Failed to delete ${entityType}`);
    }
  }
};

export const handleApproveEntity = async ({ api, entityType, entity, onRefresh, successMessage }) => {
  console.log("handleApproveEntity called with:", { api, entityType, entity });
  if (!entity) {
    console.warn("No entity passed, aborting approve.");
    return;
  }

  try {
    console.log("Calling API with ID:", entity._id);
    const res = await api.get(`merchant/verifyMerchant/${entity._id}`);
    console.log("API response:", res);

    toast.success(successMessage || `${capitalize(entityType)} approved successfully`);
    if (onRefresh) onRefresh();
  } catch (error) {
    console.error(`Error approving ${entityType}:`, error);

    const errData = error.response?.data;
    if (errData?.error) {
      toast.error(errData.details ? `${errData.error}: ${errData.details}` : errData.error);
    } else if (errData?.message) {
      toast.error(errData.message);
    } else if (error.message) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.error(`Failed to approve ${entityType}`);
    }
  }
};


// Helper to capitalize first letter
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);




export const approveChat = async (api, merchantId, setApproveData, setLoadingApproval, setShowApprovalModal, setSelectedMerchant) => {
  if (!merchantId) {
    toast.error('No merchant selected for chat approval.')
    return
  }

  try {
    setLoadingApproval(true)

    const res = await api.get(`chat/chatApproval/${merchantId}`)

    if (res?.data?.success) {
      toast.success(res?.data?.message || 'Chat approved successfully!')
      setApproveData(res?.data)
      setShowApprovalModal(false)
      setSelectedMerchant(null)
      return res?.data
    } else {
      toast.error(res?.data?.error || 'Chat approval failed.')
      return null
    }
  } catch (err) {
    console.error(err?.response?.data?.error)
    toast.error(err?.response?.data?.error || 'Something went wrong during chat approval.')
    return null
  } finally {
    setLoadingApproval(false)
  }
}
