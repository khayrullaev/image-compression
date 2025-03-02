import { type NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import { existsSync, statSync } from "fs";
import path from "path";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    const image = db.images.find((img) => img.id === id);

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Create compressed directory if it doesn't exist
    const compressedDir = path.join(process.cwd(), "public", "compressed");
    if (!existsSync(compressedDir)) {
      await mkdir(compressedDir, { recursive: true });
    }

    const originalPath = path.join(process.cwd(), "public", image.url);

    const fileExt = path.extname(image.url) || ".jpg";
    const compressedFileName = `${image.id}-compressed${fileExt}`;
    const compressedPath = path.join(compressedDir, compressedFileName);

    try {
      const fs = require("fs");
      const imageBuffer = fs.readFileSync(originalPath);

      // Compress using TinyPNG/TinyJPG API
      const API_KEY = process.env.TINYPNG_API_KEY;

      if (!API_KEY) {
        throw new Error("TinyPNG API key is not configured");
      }

      const authHeader = `Basic ${Buffer.from(`api:${API_KEY}`).toString(
        "base64"
      )}`;

      const compressionResponse = await fetch("https://api.tinify.com/shrink", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: imageBuffer,
      });

      if (!compressionResponse.ok) {
        throw new Error(
          `TinyPNG API error: ${compressionResponse.status} ${compressionResponse.statusText}`
        );
      }

      const compressionData = await compressionResponse.json();

      // Download the compressed image
      const downloadResponse = await fetch(compressionData.output.url);

      if (!downloadResponse.ok) {
        throw new Error("Failed to download compressed image");
      }

      const compressedBuffer = await downloadResponse.arrayBuffer();

      await writeFile(compressedPath, Buffer.from(compressedBuffer));

      const stats = statSync(compressedPath);

      // Create compressed image data
      const compressedImageData = {
        id: `${image.id}-compressed`,
        name: image.name.replace(/\.[^/.]+$/, "") + fileExt,
        url: `/compressed/${compressedFileName}`,
        size: stats.size,
        format: image.format,
        width: compressionData.output.width || 0,
        height: compressionData.output.height || 0,
        createdAt: new Date().toISOString(),
      };

      db.compressedImages.push(compressedImageData);

      return NextResponse.json(compressedImageData);
    } catch (compressionError) {
      console.error("Image compression error:", compressionError);

      const fs = require("fs");
      fs.copyFileSync(originalPath, compressedPath);

      const stats = fs.statSync(compressedPath);

      const compressedImageData = {
        id: `${image.id}-compressed`,
        name: image.name,
        url: `/compressed/${compressedFileName}`,
        size: stats.size,
        format: image.format,
        width: 0,
        height: 0,
        createdAt: new Date().toISOString(),
      };

      db.compressedImages.push(compressedImageData);

      return NextResponse.json(compressedImageData);
    }
  } catch (error) {
    console.error("Error compressing image:", error);
    return NextResponse.json(
      { error: "Failed to compress image" },
      { status: 500 }
    );
  }
}
