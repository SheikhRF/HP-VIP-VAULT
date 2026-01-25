"use client";

import Script from "next/script";

export default function InstagramWidget() {
  return (
    <>
      {/* Load LightWidget script */}
      <Script
        src="https://cdn.lightwidget.com/widgets/lightwidget.js"
        strategy="afterInteractive"
      />

      {/* LightWidget iframe */}
      <iframe
        src="https://lightwidget.com/widgets/d1240b3e25965a2c947d5504f74f6e24.html"
        scrolling="no"
        allowTransparency
        className="lightwidget-widget"
        style={{
          width: "100%",
          border: "0",
          overflow: "hidden",
        }}
      />
    </>
  );
}
