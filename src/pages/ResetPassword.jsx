import React, { useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import ResetPasswordModal from "../components/auth/ResetPasswordModal";
import { Bot } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const token = searchParams.get("token") || params.token;
  const [showModal, setShowModal] = React.useState(false);

  useEffect(() => {
    if (token) {
      setShowModal(true);
    } else {
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [token, navigate]);

  const handleSuccess = () => {
    setTimeout(() => navigate("/login"), 2000);
  };

  const handleClose = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex w-1/2 relative border-r border-border items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=2069&auto=format&fit=crop"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <p className="text-5xl font-bold text-foreground">AgentDial</p>
              <p className="text-sm text-muted-foreground">
                Voice AI Assistants Platform
              </p>
            </div>
          </div>
          {!token && (
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8 shadow-lg shadow-black/5 text-center">
              <p className="text-foreground">
                Invalid or missing reset token. Redirecting to login...
              </p>
            </div>
          )}
        </div>
      </div>

      <ResetPasswordModal
        isOpen={showModal}
        onClose={handleClose}
        token={token}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
