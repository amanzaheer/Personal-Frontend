import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import LandingHeader from "../components/Landing/LandingHeader";
import HomeBanner from "../components/Landing/HomeBanner";
import ProfessionalIdentitySection from "../components/Landing/ProfessionalIdentitySection";
import BooksSection from "../components/Landing/BooksSection";
import GallerySection from "../components/Landing/GallerySection";
import LandingFooter from "../components/Landing/LandingFooter";

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

export default function LandingPage() {
  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen flex flex-col bg-white relative">
        <LandingHeader />
        <HomeBanner />
        <ProfessionalIdentitySection />
        <BooksSection />
        <GallerySection />
        <LandingFooter />
      </div>
    </Elements>
  );
}
