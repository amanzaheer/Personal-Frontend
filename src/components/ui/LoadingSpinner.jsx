import React from "react";
import { Bot } from "lucide-react";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Main spinner container */}
      <div className="relative w-20 h-20 mb-8">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 border-4 border-secondary rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-accent rounded-full animate-spin"></div>

        {/* Inner pulsing circle with bot icon */}
        <div className="absolute inset-4 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Pulsing background glow */}
            <div className="absolute inset-0 bg-accent/10 rounded-full animate-ping"></div>
            <div className="absolute inset-2 bg-accent/5 rounded-full"></div>

            {/* Bot icon */}
            <div className="relative z-10">
              <Bot className="w-8 h-8 text-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading text with animated dots */}
      <div className="text-center space-y-3">
        <p className="text-base font-medium text-muted-foreground">{message}</p>
        <div className="flex items-center justify-center gap-1.5">
          <div
            className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
            style={{ animationDelay: "0s", animationDuration: "1.4s" }}
          ></div>
          <div
            className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
            style={{ animationDelay: "0.2s", animationDuration: "1.4s" }}
          ></div>
          <div
            className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
            style={{ animationDelay: "0.4s", animationDuration: "1.4s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
