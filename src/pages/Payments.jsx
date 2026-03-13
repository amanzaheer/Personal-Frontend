import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { DollarSign, RefreshCw } from "lucide-react";
import useApi from "../lib/useApi";
import DataTable from "../components/ui/DataTable";
import { useFormatDate } from "../lib/dateUtils";

export default function Payments() {
  const navigate = useNavigate();
  const api = useApi();
  const { formatDate: formatDateWithTimezone } = useFormatDate();
  const fetchInProgressRef = useRef(false);

  const [isAdmin, setIsAdmin] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Payments page is admin-only; redirect others to dashboard
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
    fetchPayments(pagination.page, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, isAdmin]);

  const fetchPayments = async (page = 1, limit = 10) => {
    if (fetchInProgressRef.current) return;
    fetchInProgressRef.current = true;
    try {
      setLoading(true);
      const response = await api.get("payment/history", { page, limit });
      const data = response?.data?.data;
      const list = Array.isArray(data?.payments)
        ? data.payments
        : Array.isArray(response?.data?.payments)
          ? response.data.payments
          : [];
      setPayments(list);
      if (data?.pagination) {
        setPagination((prev) => ({
          ...prev,
          page: data.pagination.page ?? page,
          limit: data.pagination.limit ?? limit,
          total: data.pagination.total ?? 0,
          pages: data.pagination.pages ?? 1,
        }));
      }
    } catch {
      setPayments([]);
    } finally {
      fetchInProgressRef.current = false;
      setLoading(false);
    }
  };

  const refreshPayments = () => {
    fetchPayments(pagination.page, pagination.limit);
  };

  const syncWithStripe = async () => {
    try {
      setLoading(true);
      await api.post("payment/sync");
      await fetchPayments(pagination.page, pagination.limit);
      toast.success("Synced latest payments from Stripe.");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to sync with Stripe";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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

  const StatusChip = ({ status }) => {
    const normalized = (status || "").toLowerCase();
    const cfg =
      normalized === "success"
        ? {
            label: "Success",
            className:
              "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
          }
        : normalized === "failed"
          ? {
              label: "Failed",
              className:
                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
            }
          : {
              label: "Pending",
              className:
                "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
            };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${cfg.className}`}
      >
        {cfg.label}
      </span>
    );
  };

  const preparedItems = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    return payments.map((p, index) => ({
      serial: index + 1,
      userId: p.userId || "-",
      currency: (p.currency || "usd").toUpperCase(),
      amount:
        typeof p.amount === "number"
          ? `${(p.currency || "usd").toUpperCase()} ${p.amount.toFixed(2)}`
          : String(p.amount ?? "-"),
      paymentMethod: p.paymentMethod || "-",
      paymentStatus: <StatusChip status={p.paymentStatus} />,
      cardBrand: p.cardBrand || "-",
      cardLast4: p.cardLast4 ? `•••• ${p.cardLast4}` : "-",
      stripePaymentIntentId: p.stripePaymentIntentId || "-",
      transactionId: p.transactionId || "-",
      createdAt: formatDate(p.createdAt),
      updatedAt: formatDate(p.updatedAt),
    }));
  }, [payments]);

  const handlePageSizeChange = (e) => {
    const newLimit = Number(e.target.value) || 10;
    setPagination((prev) => ({
      ...prev,
      page: 1,
      limit: newLimit,
    }));
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <Toaster position="top-right" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 text-accent" />
            <span>Payments</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <button
              type="button"
              onClick={syncWithStripe}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-accent text-accent text-xs font-medium bg-white hover:bg-accent/5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync with Stripe</span>
            </button>
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pagination.limit}
                onChange={handlePageSizeChange}
                className="border border-gray-300 rounded-md px-2 py-1 text-xs bg-white cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
        <DataTable
          heads={[
            "Sr#",
            "User ID",
            "Currency",
            "Amount",
            "Method",
            "Status",
            "Card Brand",
            "Card Last4",
            "Stripe Intent ID",
            "Transaction ID",
            "Created At",
            "Updated At",
          ]}
          items={preparedItems}
          isLoading={loading}
          pagination
          serverPagination
          currentPage={pagination.page}
          totalPage={pagination.pages}
          totalRecords={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(p) =>
            setPagination((prev) => ({
              ...prev,
              page: p,
            }))
          }
          searchBox
          searchPlaceholder="Search payments..."
          refreshData={refreshPayments}
          emptyMessage="No payments found"
        />
      </div>
    </div>
  );
}
