import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import LandingHeader from "../components/Landing/LandingHeader";
import HomeBanner from "../components/Landing/HomeBanner";
import ProfessionalIdentitySection from "../components/Landing/ProfessionalIdentitySection";
import BooksSection from "../components/Landing/BooksSection";
import GallerySection from "../components/Landing/GallerySection";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const pageContent = (
  <div className="min-h-screen flex flex-col bg-white relative">
    <LandingHeader />
    <HomeBanner />
    <ProfessionalIdentitySection />
    <BooksSection />
    <GallerySection />
  </div>
);

export default function LandingPage() {
  // Only wrap with Elements when Stripe key is set; otherwise Stripe lib crashes with stripe={null}
  if (stripePromise) {
    return <Elements stripe={stripePromise}>{pageContent}</Elements>;
  }
  return pageContent;
}
