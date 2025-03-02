"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, ImageIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImagePreview from "@/components/image-preview";
import type { ImageData } from "@/types/image";

export default function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedImage, setCompressedImage] = useState<ImageData | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompressed, setIsCompressed] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const selectedFile = acceptedFiles[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    const fileSize = selectedFile.size || 0;
    if (fileSize > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);

    setCompressedImage(null);
    setIsCompressed(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    maxFiles: 1,
  });

  const uploadAndCompress = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      const formData = new FormData();
      formData.append("image", file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("Upload response error:", errorText);
        throw new Error(`Failed to upload image: ${errorText}`);
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      const uploadData = await uploadResponse.json();

      // Compress the image
      setIsCompressing(true);
      const compressResponse = await fetch("/api/compress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: uploadData.id }),
      });

      if (!compressResponse.ok) {
        const errorText = await compressResponse.text();
        console.error("Compress response error:", errorText);
        throw new Error(`Failed to compress image: ${errorText}`);
      }

      const compressData = await compressResponse.json();
      setCompressedImage(compressData);
      setIsCompressed(true);
    } catch (err) {
      console.error("Error during upload and compress:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      if (err instanceof Error) {
        console.error("Error stack:", err.stack);
      }
    } finally {
      setIsLoading(false);
      setIsUploading(false);
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-gray-300 hover:border-primary"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              {isDragActive ? (
                <p className="text-lg font-medium">Drop the image here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium">
                    Drag & drop an image here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports: JPG, PNG, WebP, AVIF (max 10MB)
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      {preview && (
        <div className="space-y-6">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="comparison" disabled={!compressedImage}>
                Comparison
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-black/5">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt="Preview"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground">
                      {file?.name} (
                      {((file?.size || 0) / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="comparison" className="mt-4">
              {compressedImage && (
                <ImagePreview
                  original={{
                    url: preview,
                    size: file?.size || 0,
                    name: file?.name || "Original",
                  }}
                  compressed={compressedImage}
                />
              )}
            </TabsContent>
          </Tabs>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={uploadAndCompress}
              disabled={!file || isLoading || isCompressed}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="mr-2 h-4 w-4" />
              )}
              {isLoading
                ? "Processing..."
                : isCompressed
                ? "Image Compressed"
                : "Compress Image"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
