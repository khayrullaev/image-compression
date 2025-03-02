import type { Metadata } from "next"
import ImageUploader from "@/components/image-uploader"

export const metadata: Metadata = {
  title: "Image Compression App",
  description: "Upload and compress your images easily",
}

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Image Compression Tool</h1>
      <div className="max-w-4xl mx-auto">
        <ImageUploader />
      </div>
    </main>
  )
}

