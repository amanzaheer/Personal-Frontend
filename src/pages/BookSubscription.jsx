import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { CreditCard, BookOpen } from "lucide-react";
import useApi from "../lib/useApi";

export default function BookSubscription() {
  const [searchParams] = useSearchParams();
  const api = useApi();

  const { bookId, title, amount } = useMemo(
    () => ({
      bookId: searchParams.get("bookId") || "",
      title: searchParams.get("title") || "Book",
      amount: searchParams.get("amount") || "",
    }),
    [searchParams],
  );

  const numericAmount = useMemo(() => {
    const n = parseFloat(amount);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amount]);

  const handlePay = async () => {
    if (!numericAmount || !bookId) {
      toast.error("Missing book information for payment.");
      return;
    }

    try {
      const response = await api.post("payment/create", {
        amount: numericAmount,
        currency: "usd",
        bookId,
        description: `Read access for ${title}`,
      });

      const checkoutUrl =
        response?.data?.data?.checkoutUrl || response?.data?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        toast.error("Unable to start Stripe payment. Please try again.");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to start payment";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8 flex items-center justify-center">
      <Toaster position="top-center" />
      <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <CreditCard className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">
              Subscribe to read
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Complete a secure Stripe payment to unlock this book.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-muted/40 border border-border/60 p-4 flex items-start gap-3">
          <span className="mt-1 text-accent">
            <BookOpen className="w-5 h-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {title || "Book"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              You will get full access to read this book once the payment is
              completed.
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
              Price
            </p>
            <p className="text-lg font-semibold text-foreground">
              {numericAmount ? `$${numericAmount.toFixed(2)}` : "—"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePay}
          disabled={!numericAmount || !bookId}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-accent hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
        >
          <CreditCard className="w-4 h-4" />
          Pay with Stripe
        </button>

        <p className="text-[11px] text-muted-foreground text-center">
          Payments are processed securely by Stripe. You can use test cards in
          development mode.
        </p>
      </div>
    </div>
  );
}

