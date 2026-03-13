import React from "react";

export default function Placeholder({ title }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-muted-foreground">This page is coming soon.</p>
    </div>
  );
}

export function MembershipPage() {
  return <Placeholder title="Membership" />;
}
export function PaymentPage() {
  return <Placeholder title="Payment" />;
}
export function BooksPage() {
  return <Placeholder title="Books" />;
}
export function SlidersPage() {
  return <Placeholder title="Sliders" />;
}
export function GalleryPage() {
  return <Placeholder title="Gallery" />;
}
