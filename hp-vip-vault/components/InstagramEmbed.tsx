"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: any;
  }
}

type InstagramEmbedProps = {
  url: string; // full post URL, e.g. https://www.instagram.com/p/XXXX/
};

export function InstagramEmbed({ url }: InstagramEmbedProps) {
  useEffect(() => {
    const scriptId = "instagram-embed-script";

    // Only inject the script once
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.async = true;
      script.src = "https://www.instagram.com/embed.js";
      document.body.appendChild(script);

      script.onload = () => {
        window.instgrm?.Embeds?.process();
      };
    } else {
      window.instgrm?.Embeds?.process();
    }
  }, [url]);

  return (
    <div className="">
      <blockquote
        className="instagram-media"
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        // Remove the next line if you *want* captions:
        // data-instgrm-captioned="true"
        style={{
          margin: 0,
          minWidth: 0,
          width: "100%",
          
        }}
      />
    </div>
  );
}
