"use client";

import Script from "next/script";

export default function InstagramWidget() {
  return (
    <div className="bg-black rounded-xl overflow-hidden border border-border center mx-auto shadow-2xl">
      <Script
        src="https://cdn.lightwidget.com/widgets/lightwidget.js"
        strategy="afterInteractive"
      />

      <iframe
        src="https://cdn.lightwidget.com/widgets/da184118debe57d0ad3d3be79a2da45c.html"
        className="lightwidget-widget"
        scrolling="no"
        style={{
          width: "100%",
          border: 0,
          overflow: "hidden",
          backgroundColor: "#171717",
          
            
        }}
      />
    </div>
  );
}