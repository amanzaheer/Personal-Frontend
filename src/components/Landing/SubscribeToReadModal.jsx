import React, { useEffect, useRef, useState } from "react";
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { X, CreditCard } from "lucide-react";
import { toast } from "react-hot-toast";
import useApi from "../../lib/useApi";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL || "";

export default function SubscribeToReadModal({
  open,
  onClose,
  book,
  guest = false,
  onSuccess,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const api = useApi();

  const [clientSecret, setClientSecret] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guestStep, setGuestStep] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestErrors, setGuestErrors] = useState({});
  const [credentialsSent, setCredentialsSent] = useState(false);
  const intentCreatedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      setClientSecret(null);
      setTransactionId(null);
      setGuestStep(1);
      setGuestName("");
      setGuestEmail("");
      setGuestErrors({});
      setCredentialsSent(false);
      intentCreatedRef.current = false;
    }
  }, [open]);

  // Logged-in user: create intent on open
  useEffect(() => {
    if (!open || !book?._id || guest || intentCreatedRef.current) return;
    intentCreatedRef.current = true;
    const createIntent = async () => {
      try {
        setLoading(true);
        const amount = book.price ?? 0;
        const res = await api.post("payment/intent", {
          amount,
          currency: "usd",
          bookId: book._id || book.id,
          description: `Read access for ${book.title || "Book"}`,
        });
        const secret =
          res?.data?.data?.clientSecret || res?.data?.clientSecret || null;
        if (!secret) toast.error("Unable to start payment. Please try again.");
        setClientSecret(secret);
      } catch (error) {
        intentCreatedRef.current = false;
        const msg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to start payment";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    createIntent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, book, guest]);

  const handleGuestContinue = async (e) => {
    e.preventDefault();
    const err = {};
    if (!guestName.trim()) err.name = "Name is required";
    if (!guestEmail.trim()) err.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(guestEmail.trim())) err.email = "Enter a valid email";
    setGuestErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    try {
      const base = apiBaseURL.endsWith("/api") ? apiBaseURL : `${apiBaseURL}/api`;
      const res = await fetch(`${base}/payment/intent-guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: guestName.trim(),
          email: guestEmail.trim().toLowerCase(),
          amount: book?.price ?? 0,
          currency: "usd",
          bookId: book?._id || book?.id,
          description: `Read access for ${book?.title || "Book"}`,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const payload = data?.data ?? data;
      const secret = payload?.clientSecret || null;
      const txnId = payload?.transactionId || null;
      if (!secret || !txnId) {
        toast.error(data?.message || "Unable to start payment. Please try again.");
        return;
      }
      setClientSecret(secret);
      setTransactionId(txnId);
      setCredentialsSent(payload?.credentialsSent === true);
      setGuestStep(2);
    } catch {
      toast.error("Failed to start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setLoading(true);
    try {
      const cardElement = elements.getElement(CardNumberElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        },
      );

      if (error) {
        toast.error(error.message || "Payment failed");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        if (guest && transactionId && guestEmail) {
          try {
            const base = apiBaseURL.endsWith("/api") ? apiBaseURL : `${apiBaseURL}/api`;
            const res = await fetch(`${base}/payment/complete-guest`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: guestEmail.trim().toLowerCase(), transactionId }),
            });
            const data = await res.json().catch(() => ({}));
            const payload = data?.data ?? data;
            const token = payload?.token;
            const user = payload?.user;
            if (token) localStorage.setItem("auth_token", token);
            if (user) {
              const normalized = { ...user, _id: user._id || user.id, id: user.id || user._id };
              localStorage.setItem("user", JSON.stringify(normalized));
            }
            if (credentialsSent) {
              toast.success("Login credentials have been sent to your email.");
            }
            toast.success("Account created and payment complete. You are now logged in.");
            if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("user:role-changed"));
            onSuccess?.(book);
            onClose?.();
            return;
          } catch (err) {
            toast.error("Payment succeeded but login failed. Check your email for password.");
            onClose?.();
            return;
          }
        }
        toast.success("Payment successful. You can now read this book.");
        onSuccess?.(book);
        onClose?.();
      }
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-7 shadow-xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-gray-500 hover:bg-gray-100 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <span className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <CreditCard className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Subscribe to read
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter your billing details to unlock this book instantly.
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-xl bg-gray-50 border border-gray-100 p-3.5 flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {book?.title || "Book"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              You’ll get full access to read this book after a one‑time payment.
              {guest && guestStep === 1 && " We’ll create an account for you and email your password."}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
              Price
            </p>
            <p className="text-base font-semibold text-gray-900">
              {book?.price ? `$${Number(book.price).toFixed(2)}` : "Free"}
            </p>
          </div>
        </div>

        {guest && guestStep === 1 ? (
          <form onSubmit={handleGuestContinue} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => { setGuestName(e.target.value); setGuestErrors((p) => ({ ...p, name: undefined })); }}
                  placeholder="Your name"
                  className={`w-full border rounded-lg px-3 py-2 text-sm bg-white ${guestErrors.name ? "border-red-500" : "border-gray-200"}`}
                />
                {guestErrors.name && <p className="text-xs text-red-600">{guestErrors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => { setGuestEmail(e.target.value); setGuestErrors((p) => ({ ...p, email: undefined })); }}
                  placeholder="your@email.com"
                  className={`w-full border rounded-lg px-3 py-2 text-sm bg-white ${guestErrors.email ? "border-red-500" : "border-gray-200"}`}
                />
                {guestErrors.email && <p className="text-xs text-red-600">{guestErrors.email}</p>}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-semibold disabled:opacity-60 cursor-pointer shadow-md"
            >
              {loading ? "Preparing…" : "Continue to payment"}
            </button>
          </form>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">
                Card number
              </label>
              <div className="border border-gray-200 rounded-lg px-3 py-2 bg-white">
                <CardNumberElement
                  options={{
                    style: {
                      base: {
                        fontSize: "14px",
                        color: "#111827",
                        "::placeholder": { color: "#9CA3AF" },
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                      },
                      invalid: { color: "#DC2626" },
                    },
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Expiration
                </label>
                <div className="border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <CardExpiryElement
                    options={{
                      style: {
                        base: {
                          fontSize: "14px",
                          color: "#111827",
                          "::placeholder": { color: "#9CA3AF" },
                          fontFamily:
                            "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                        },
                        invalid: { color: "#DC2626" },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">CVC</label>
                <div className="border border-gray-200 rounded-lg px-3 py-2 bg-white">
                  <CardCvcElement
                    options={{
                      style: {
                        base: {
                          fontSize: "14px",
                          color: "#111827",
                          "::placeholder": { color: "#9CA3AF" },
                          fontFamily:
                            "-apple-system, BlinkMacSystemFont, system-ui, sans-serif",
                        },
                        invalid: { color: "#DC2626" },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || !clientSecret || loading}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-md hover:shadow-lg transition-shadow"
          >
            {loading ? "Processing..." : "Pay and unlock"}
          </button>

          <p className="text-[11px] text-gray-500 text-center leading-snug">
            Payments are processed securely by Stripe. Use test cards while in
            development.
          </p>
        </form>
        )}

      </div>
    </div>
  );
}
