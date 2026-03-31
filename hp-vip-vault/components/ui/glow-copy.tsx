"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils"; // Standard shadcn utility for classes

interface GlowCopyProps {
  text: string;
  className?: string;
  showIcon?: boolean;
}

export default function GlowCopy({ text, className, showIcon = true }: GlowCopyProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents triggering parent Link clicks
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Vault Copy Error:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "group/copy flex items-center gap-2 text-left transition-all active:scale-95",
        className
      )}
      title={`Copy: ${text}`}
    >
      <span className="transition-colors group-hover/copy:text-orange-500">
        {text}
      </span>
      
      {showIcon && (
        <div className="relative w-3 h-3 flex items-center justify-center">
          {copied ? (
            <Check size={12} className="text-green-500 animate-in zoom-in duration-300" />
          ) : (
            <Copy 
              size={10} 
              className="text-gray-700 opacity-0 group-hover/copy:opacity-100 transition-all transform translate-x-[-2px] group-hover:translate-x-0" 
            />
          )}
        </div>
      )}
    </button>
  );
}