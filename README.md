# Image Compression App

## Overview

This is a Next.js web application that allows users to upload images and compress them using the Tinify API. The app provides a user-friendly interface for image upload, compression, and side-by-side comparison of original and compressed images.

## Features

- Drag-and-drop or click-to-upload image functionality
- Image compression using the Tinify API
- Side-by-side comparison of original and compressed images
- Slider view for easy before/after comparison
- Responsive design for both desktop and mobile devices

## Tech Stack

- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Tinify API for image compression
- Node.js 22.11.0
- pnpm 9.15.0

## Setup and Installation

1. Clone the repository:

```plaintext
git clone https://github.com/khayrullaev/image-compression.git
cd image-compression
```

2. Install dependencies:

```plaintext
pnpm install
```

3. Run the development server:

```plaintext
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Architectural Decisions and Reasoning

1. **Next.js with App Router**: We chose Next.js for its server-side rendering capabilities and the new App Router for improved performance and easier route management.

2. **TypeScript**: Used for type safety and improved developer experience.

3. **Tailwind CSS**: Chosen for rapid UI development and easy customization.

4. **shadcn/ui**: Provides a set of accessible and customizable UI components that work well with Tailwind CSS.

5. **Tinify API**: Selected for its robust image compression capabilities and easy integration.

6. **File-based Routing**: Utilizing Next.js App Router for intuitive and efficient routing.

7. **Server Components**: Leveraging Next.js server components for improved performance and SEO.

8. **Client-side State Management**: Using React's useState and useCallback hooks for managing local component state, avoiding unnecessary complexity of global state management for this scale of application.

## Running and Testing the Application

1. Start the development server:

```plaintext
pnpm dev
```

2. Open your browser and navigate to `http://localhost:3000`.

3. Upload an image by dragging and dropping or clicking the upload area.

4. Click the "Compress Image" button to compress the uploaded image.

5. View the comparison between the original and compressed images using the side-by-side or slider view.

6. Download the compressed image using the provided button.

For testing:

- Ensure to test with various image formats (JPG, PNG, WebP, AVIF).
- Test with images of different sizes, including edge cases (very small and very large images).
- Verify the responsiveness on different device sizes.

## Assumptions and Limitations

1. **File Size Limit**: The application assumes a maximum file size of 10MB for uploaded images. This limit is enforced client-side and can be adjusted if needed.

2. **Supported Formats**: While the app supports common image formats (JPG, PNG, WebP, AVIF), some less common formats may not be supported or may not compress effectively.

3. **API Rate Limiting**: The Tinify API has rate limits. High-volume usage may require upgrading the API plan or implementing a queueing system.

4. **Server-side Storage**: The current implementation stores uploaded and compressed images on the server. For production use, should implement cloud storage solutions.
