"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ImageData } from "@/types/image";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

interface ImagePreviewProps {
  original: {
    url: string | null;
    size: number;
    name: string;
  };
  compressed: ImageData;
}

export default function ImagePreview({
  original,
  compressed,
}: ImagePreviewProps) {
  const [view, setView] = useState<"side-by-side" | "slider">("side-by-side");

  const compressionRatio = (
    ((original.size - compressed.size) / original.size) *
    100
  ).toFixed(1);

  const handleDownload = () => {
    if (!compressed.url) return;

    const link = document.createElement("a");
    link.href = compressed.url;
    link.download = `compressed-${compressed.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Tabs
            value={view}
            onValueChange={(v) => setView(v as "side-by-side" | "slider")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
              <TabsTrigger value="slider">Slider View</TabsTrigger>
            </TabsList>

            <TabsContent value="side-by-side" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-black/5">
                    <img
                      src={original.url || ""}
                      alt="Original"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <p className="text-sm font-medium">Original</p>
                  <p className="text-xs text-muted-foreground">
                    {(original.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-black/5">
                    <img
                      src={compressed.url || "/placeholder.svg"}
                      alt="Compressed"
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <p className="text-sm font-medium">Compressed</p>
                  <p className="text-xs text-muted-foreground">
                    {(compressed.size / 1024 / 1024).toFixed(2)} MB (
                    {compressionRatio}% smaller)
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="slider" className="mt-4">
              <div className="aspect-video relative rounded-lg bg-black/5">
                <ReactCompareSlider
                  itemOne={
                    <ReactCompareSliderImage
                      src={original.url || ""}
                      alt="Original"
                    />
                  }
                  itemTwo={
                    <ReactCompareSliderImage
                      src={compressed.url || ""}
                      alt="Compressed"
                    />
                  }
                />
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Original
                </div>
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Compressed
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <p>Original: {(original.size / 1024 / 1024).toFixed(2)} MB</p>
                <p>
                  Compressed: {(compressed.size / 1024 / 1024).toFixed(2)} MB (
                  {compressionRatio}% smaller)
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-center">
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download Compressed Image
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
