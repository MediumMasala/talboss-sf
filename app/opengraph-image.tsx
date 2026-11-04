import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

// Generated from content/site.ts in the light home-page look. Swap for a designed 1200x630 PNG
// (drop app/opengraph-image.png in and delete this file) if you have one.
export const alt = site.seo.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const wordmark = await readFile(path.join(process.cwd(), "public/tal-boss-wordmark.svg"));
  const logo = `data:image/svg+xml;base64,${Buffer.from(wordmark.toString().replaceAll("#FFFFFF", "#0a0a0a")).toString("base64")}`;
  const { lead, main, scribble, tail } = site.hero.headline;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#f6f7f9",
          color: "#0a0a0a",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={96} height={88} alt="" />
        <div style={{ display: "flex", flexDirection: "column", fontSize: 96, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3 }}>
          <span>{lead}</span>
          <span>{main}</span>
          <span>{`${scribble} ${tail}`}</span>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#61656e" }}>No HR, ATS, agency BS.</div>
      </div>
    ),
    size,
  );
}
