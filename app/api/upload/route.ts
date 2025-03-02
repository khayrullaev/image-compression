import { type NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const id = uuidv4();
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${id}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      // Store metadata in database
      const imageData = {
        id,
        name: file.name,
        url: `/uploads/${fileName}`,
        size: file.size,
        format: file.type,
        width: 0,
        height: 0,
        createdAt: new Date().toISOString(),
      };

      db.images.push(imageData);

      return NextResponse.json(imageData);
    } catch (fileError) {
      console.error("File processing error:", fileError);
      return NextResponse.json(
        { error: "Failed to process uploaded file" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
