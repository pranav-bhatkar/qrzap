import satori from "satori";
import { writeFileSync, readFileSync } from "fs";
import sharp from "sharp";

const svg = await satori(
  {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#09090b",
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // Subtle grid pattern
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            },
          },
        },
        // QR icon
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    border: "2px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    color: "white",
                  },
                  children: "⣿",
                },
              },
            ],
          },
        },
        // Title
        {
          type: "div",
          props: {
            style: {
              fontSize: "72px",
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.04em",
              lineHeight: 1,
              marginBottom: "16px",
            },
            children: "QRzap",
          },
        },
        // Subtitle
        {
          type: "div",
          props: {
            style: {
              fontSize: "24px",
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "-0.01em",
            },
            children: "Free QR Code Generator",
          },
        },
        // Tags
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              gap: "12px",
              marginTop: "32px",
            },
            children: ["Web UI", "REST API", "MCP Server"].map((tag) => ({
              type: "div",
              props: {
                style: {
                  padding: "8px 16px",
                  borderRadius: "100px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                },
                children: tag,
              },
            })),
          },
        },
        // Bottom bar
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              bottom: "32px",
              fontSize: "14px",
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            },
            children: "qrzap.fun",
          },
        },
      ],
    },
  },
  {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Inter",
        data: readFileSync("/tmp/inter.woff"),
        style: "normal",
      },
    ],
  }
);

const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync("public/og.png", png);
console.log("Generated public/og.png (1200x630)");
