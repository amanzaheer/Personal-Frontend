import React, { useState, useEffect, useMemo, isValidElement } from "react";
import {
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import SearchBox from "./SearchBox";
import LoadingSpinner from "./LoadingSpinner";

const DataTable = ({
  heads,
  items,
  tableHeight,
  isLoading,
  totalRecords,
  tdClass,
  denseRow,
  title,
  searchBox,
  searchPlaceholder,
  handleSubmit,
  extras,
  emptyMessage,
  onRowClick,
  pagination = false,
  itemsPerPage = 10,
  currentPage = 1,
  onPageChange,
  serverPagination = false,
  exportData = false,
  refreshData,
  actionButtons,
  onFilterClick,
  onAssingFilterClick,
  showFilter = false,
  assign = false,
  totalPage = 1,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [localPage, setLocalPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const location = useLocation();

  const activePage = serverPagination ? currentPage : localPage;

  const getSearchPlaceholder = () => {
    if (searchPlaceholder) return searchPlaceholder;
    let tableName = "";
    if (typeof title === "string") tableName = title;
    else if (title && typeof title === "object") {
      const textContent = title.props?.children
        ?.filter?.((child) => typeof child === "string")
        ?.join(" ");
      if (textContent) tableName = textContent;
    }
    return tableName
      ? `Search ${tableName.toLowerCase()}...`
      : "Search anything...";
  };

  useEffect(() => {
    if (!serverPagination) setLocalPage(1);
  }, [searchQuery, serverPagination]);

  useEffect(() => {
    if (items !== null && items !== undefined && !Array.isArray(items)) {
      console.error("DataTable: 'items' prop must be an array", items);
      setError("Invalid data format received. Expected an array.");
    } else setError(null);
  }, [items]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    else if (sortConfig.key === key && sortConfig.direction === "descending") {
      key = null;
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const isReactElement = (value) => {
    if (!value) return false;
    if (isValidElement(value)) return true;
    if (typeof value === "object" && value.$$typeof) return true;
    return false;
  };

  const extractTextFromElement = (element) => {
    if (!element) return "";
    if (typeof element === "string") return element;
    if (typeof element === "number") return String(element);
    if (isValidElement(element)) {
      if (element.props?.children) {
        const children = Array.isArray(element.props.children)
          ? element.props.children
          : [element.props.children];
        return children
          .map((child) => {
            if (typeof child === "string") return child;
            if (typeof child === "number") return String(child);
            if (isValidElement(child)) return extractTextFromElement(child);
            return "";
          })
          .join(" ");
      }
      return "";
    }
    return "";
  };

  const sortedItems = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    if (serverPagination) return items;
    try {
      let sortableItems = [...items];
      if (sortConfig.key) {
        sortableItems.sort((a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          if (aValue === undefined || aValue === null) return 1;
          if (bValue === undefined || bValue === null) return -1;
          if (aValue < bValue)
            return sortConfig.direction === "ascending" ? -1 : 1;
          if (aValue > bValue)
            return sortConfig.direction === "ascending" ? 1 : -1;
          return 0;
        });
      }
      return sortableItems;
    } catch (err) {
      console.error("Error sorting items:", err);
      return Array.isArray(items) ? items : [];
    }
  }, [items, sortConfig, serverPagination]);

  const filteredItems = useMemo(() => {
    if (!sortedItems || !Array.isArray(sortedItems)) return [];
    if (serverPagination) return sortedItems;
    try {
      if (!searchQuery) return sortedItems;
      const queryLower = searchQuery.toLowerCase();
      return sortedItems.filter((item) =>
        Object.values(item || {}).some((value) => {
          if (value === null || value === undefined) return false;

          if (isReactElement(value)) {
            const extractedText = extractTextFromElement(value);
            return extractedText.toLowerCase().includes(queryLower);
          }

          const textValue = String(value).toLowerCase();
          return textValue.includes(queryLower);
        }),
      );
    } catch (err) {
      console.error("Error filtering items:", err);
      return [];
    }
  }, [sortedItems, searchQuery, serverPagination]);

  const paginatedItems = useMemo(() => {
    if (!pagination || !filteredItems || !Array.isArray(filteredItems))
      return filteredItems;
    if (serverPagination) return filteredItems;
    try {
      const startIndex = (localPage - 1) * itemsPerPage;
      return filteredItems.slice(startIndex, startIndex + itemsPerPage);
    } catch (err) {
      console.error("Error paginating items:", err);
      return [];
    }
  }, [filteredItems, localPage, itemsPerPage, pagination, serverPagination]);

  const totalPages = serverPagination
    ? Math.ceil(totalRecords / itemsPerPage)
    : Math.ceil((filteredItems?.length || 0) / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (serverPagination && onPageChange) onPageChange(newPage);
    else setLocalPage(newPage);
  };

  const handleExport = () => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.warn("No data to export");
      return;
    }

    try {
      const headers = heads.join(",");
      const csvRows = [headers];

      const dataToExport = serverPagination ? items : filteredItems;

      dataToExport.forEach((item) => {
        if (!item || typeof item !== "object") return;

        const values = Object.values(item).map((value) => {
          if (value === null || value === undefined) return "";

          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }

          if (typeof value === "object") {
            try {
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            } catch {
              return "";
            }
          }

          return value;
        });

        csvRows.push(values.join(","));
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("hidden", "");
      a.setAttribute("href", url);

      const pathSegments = location.pathname
        .split("/")
        .filter(Boolean)
        .join("_");

      const fileName = pathSegments ? `${pathSegments}.csv` : "export.csv";
      a.setAttribute("download", fileName);

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error exporting data:", err);
    }
  };

  const handleNextClick = () => {
    if (location.pathname === "/tickets") {
      handlePageChange(Math.min(activePage + 1, totalPage));
    } else {
      handlePageChange(Math.min(activePage + 1, totalPages));
    }
  };

  const isLastPage =
    location.pathname === "/tickets"
      ? activePage === totalPage
      : activePage === totalPages;

  const highlightText = (text, query) => {
    if (!query || !text) {
      return text !== null && text !== undefined ? String(text) : "-";
    }

    if (isReactElement(text)) {
      return text;
    }

    const textStr = String(text);
    const queryStr = query.trim();

    if (!queryStr) {
      return textStr;
    }

    // Escape special regex characters in the query
    const escapedQuery = queryStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    const parts = textStr.split(regex);

    return (
      <>
        {parts.map((part, index) => {
          if (part.toLowerCase() === queryStr.toLowerCase()) {
            return (
              <mark
                key={index}
                className="bg-accent/30 text-accent dark:bg-accent/40 dark:text-accent font-semibold px-0.5 rounded"
              >
                {part}
              </mark>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </>
    );
  };

  return (
    <div className="flex flex-col" style={{ overflow: "visible" }}>
      {/* Header */}
      <div
        className="bg-white dark:bg-black  py-2 px-2"
        style={{ overflow: "visible" }}
      >
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          style={{ overflow: "visible" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
            {title && (
              <h4 className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2 mb-2 sm:mb-0">
                {title}
              </h4>
            )}
            {searchBox && (
              <div className="relative w-full sm:w-80 flex-1 max-w-md">
                <SearchBox
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  className="border border-gray-200 dark:border-neutral-800 text-gray-800 rounded-xl bg-white dark:bg-neutral-900 dark:text-gray-200 transition-all duration-200 focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent/50 shadow-sm hover:shadow-md"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  inputPadding="py-2.5"
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors text-sm font-medium px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          <div
            className="flex items-center justify-end gap-2.5 mt-3 sm:mt-0 flex-shrink-0"
            style={{ overflow: "visible", position: "relative", zIndex: 1 }}
          >
            {assign && (
              <button
                onClick={async () => {
                  if (onAssingFilterClick) {
                    setIsAssigning(true);
                    try {
                      await onAssingFilterClick();
                    } finally {
                      setIsAssigning(false);
                    }
                  }
                }}
                disabled={isAssigning}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                  isAssigning
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-primary/30 dark:hover:border-primary/30"
                }`}
                title="Assign To"
              >
                {isAssigning ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Assigning...</span>
                  </>
                ) : (
                  <span className="hidden sm:inline">Assign To</span>
                )}
              </button>
            )}

            {refreshData && (
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  try {
                    if (typeof refreshData === "function") {
                      await refreshData();
                    }
                  } finally {
                    setIsRefreshing(false);
                  }
                }}
                disabled={isRefreshing}
                className={`p-2.5 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                  isRefreshing
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer text-gray-600 hover:text-accent dark:text-gray-300 dark:hover:text-primary bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-primary/30 dark:hover:border-primary/30"
                } group`}
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-5 h-5 transition-transform duration-500 ${
                    isRefreshing ? "animate-spin" : "group-hover:rotate-180"
                  }`}
                />
              </button>
            )}

            {showFilter && (
              <button
                onClick={async () => {
                  if (onFilterClick) {
                    setIsFiltering(true);
                    try {
                      await onFilterClick();
                    } finally {
                      setIsFiltering(false);
                    }
                  } else {
                    setShowFilters(!showFilters);
                  }
                }}
                disabled={isFiltering}
                className={`p-2.5 rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                  isFiltering
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                } ${
                  showFilters
                    ? "text-primary dark:text-primary bg-primary/10 dark:bg-primary/20 border-primary/50 dark:border-primary/50"
                    : "text-gray-600 hover:text-accent dark:text-gray-300 dark:hover:text-primary bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-primary/30 dark:hover:border-primary/30"
                }`}
                title="Toggle filters"
              >
                {isFiltering ? (
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                ) : (
                  <Filter className="w-5 h-5" />
                )}
              </button>
            )}

            {extras}

            {handleSubmit && (
              <>
                {isLoading ? (
                  <div className="bg-primary/10 flex items-center justify-center rounded-xl py-2.5 px-4 shadow-sm">
                    <LoaderCircle className="w-5 h-5 mr-2 animate-spin text-primary" />
                    <span className="text-primary font-medium">
                      Processing...
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="py-2.5 px-5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-100 cursor-pointer"
                  >
                    Save and Update
                  </button>
                )}
              </>
            )}

            {actionButtons}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-black rounded-lg overflow-hidden mt-6">
        {error && (
          <div className="flex items-center justify-center p-6 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <div
          className={`w-full overflow-auto max-h-[calc(100vh-200px)] ${tableHeight} scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-neutral-800 scrollbar-track-transparent`}
        >
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-100 dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800">
                {heads?.map((head, key) => {
                  const headKey =
                    Array.isArray(items) && items[0]
                      ? Object.keys(items[0])[key]
                      : null;
                  const isSortable =
                    headKey &&
                    headKey !== "actions" &&
                    headKey !== "serial" &&
                    !serverPagination;
                  return (
                    <th
                      key={key}
                      className={`py-3 pl-5 pr-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-neutral-900 ${
                        isSortable
                          ? "cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10"
                          : ""
                      }`}
                      onClick={() => isSortable && requestSort(headKey)}
                    >
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        {head}
                        {isSortable && (
                          <div className="flex flex-col">
                            <ChevronUp
                              className={`h-3 w-3 ${
                                sortConfig.key === headKey &&
                                sortConfig.direction === "ascending"
                                  ? "text-primary"
                                  : "text-gray-400"
                              }`}
                            />
                            <ChevronDown
                              className={`h-3 w-3 ${
                                sortConfig.key === headKey &&
                                sortConfig.direction === "descending"
                                  ? "text-primary"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-neutral-800 bg-white dark:bg-black">
              {Array.isArray(paginatedItems) &&
                paginatedItems.map((item, index) => (
                  <tr
                    key={index}
                    className={`${
                      onRowClick ? "cursor-pointer" : ""
                    } odd:dark:bg-black even:dark:bg-neutral-950 hover:bg-primary/5 dark:hover:bg-white/5 transition-colors duration-150`}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {Object.values(item).map((value, key) => {
                      // Check if value is a React element
                      const isElement = isReactElement(value);

                      return (
                        <td
                          key={key}
                          className={`pl-5 pr-3 ${
                            denseRow ? "py-2" : "py-3"
                          } ${tdClass}`}
                        >
                          <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                            {value !== null && value !== undefined
                              ? // If it's a React element, render as-is (no highlighting)
                                // If it's a primitive and we have a search query, apply highlighting
                                isElement || !searchQuery
                                ? value
                                : highlightText(value, searchQuery)
                              : "-"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Empty states */}
          {!items && !error && (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                {emptyMessage || "No Data Available"}
              </p>
            </div>
          )}

          {Array.isArray(items) &&
            items.length === 0 &&
            !isLoading &&
            !error && (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                  No Data Found
                </p>
                <p className="text-gray-500 dark:text-gray-500 mt-1">
                  Try changing your search or filters
                </p>
              </div>
            )}

          {isLoading && <LoadingSpinner />}
        </div>

        {/* Pagination */}
        {pagination && Array.isArray(items) && items.length > 0 && (
          <div className="bg-white dark:bg-black px-4 py-2 flex items-center justify-between border-t border-gray-200 dark:border-neutral-800 mb-20 ">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing{" "}
                  <span className="font-medium">
                    {serverPagination
                      ? Math.min(
                          (activePage - 1) * itemsPerPage + 1,
                          totalRecords,
                        )
                      : Math.min(
                          (activePage - 1) * itemsPerPage + 1,
                          filteredItems?.length || 0,
                        )}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {serverPagination
                      ? Math.min(activePage * itemsPerPage, totalRecords)
                      : Math.min(
                          activePage * itemsPerPage,
                          filteredItems?.length || 0,
                        )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {serverPagination
                      ? totalRecords
                      : filteredItems?.length || 0}
                  </span>{" "}
                  results
                </p>
              </div>

              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(activePage - 1, 1))
                    }
                    disabled={activePage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black text-sm font-medium ${
                      activePage === 1
                        ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {[...Array(totalPages)].map((_, index) => {
                    const isActive = activePage === index + 1;

                    return (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`relative inline-flex items-center px-3 py-2 border 
        border-gray-300 dark:border-neutral-800 text-sm font-medium cursor-pointer
        ${
          isActive
            ? "bg-white text-grey dark:bg-black dark:text-gray-300" // ACTIVE
            : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-white dark:text-gray-500 dark:hover:bg-neutral-900" // INACTIVE
        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}

                  <button
                    onClick={handleNextClick}
                    disabled={isLastPage}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-neutral-800 bg-white dark:bg-black text-sm font-medium ${
                      isLastPage
                        ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                    }`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataTable;
