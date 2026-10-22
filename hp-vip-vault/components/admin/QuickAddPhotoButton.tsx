"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";

export default function QuickAddPhotoButton({ carId }: { carId: number }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (files.length === 0) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1920, useWebWorker: true };
      const compressed = await Promise.all(
        files.map((file) => imageCompression(file, options))
      );

      const fd = new FormData();
      fd.append("car_id", String(carId));
      compressed.forEach((file) => fd.append("photos", file));

      const response = await fetch("/api/admin/update-car", {
        method: "POST",
        body: fd,
      });

      const result = await response.json();
      if (result.success) {
        router.refresh();
      } else {
        throw new Error(result.error ?? "Upload failed.");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pb-4 space-y-3">
      <ErrorBanner message={errorMsg} />
      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        id="quick-add-photo"
        disabled={loading}
        onChange={handleFiles}
      />
      <Button asChild variant="vault-ghost" className="gap-3 tracking-tighter cursor-pointer">
        <label htmlFor="quick-add-photo">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          {loading ? "Uploading..." : "Add Photo"}
        </label>
      </Button>
    </div>
  );
}
