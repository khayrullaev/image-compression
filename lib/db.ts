import fs from "fs";
import path from "path";

interface ImageData {
  id: string;
  name: string;
  url: string;
  size: number;
  format: string;
  width: number;
  height: number;
  createdAt: string;
}

interface DB {
  images: ImageData[];
  compressedImages: ImageData[];
}

const DB_FILE = path.join(process.cwd(), "db.json");

function readDB(): DB {
  if (fs.existsSync(DB_FILE)) {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  }
  return { images: [], compressedImages: [] };
}

function writeDB(db: DB) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export const db = {
  images: {
    push: (image: ImageData) => {
      const currentDB = readDB();
      currentDB.images.push(image);
      writeDB(currentDB);
    },
    find: (predicate: (image: ImageData) => boolean) => {
      const currentDB = readDB();
      return currentDB.images.find(predicate);
    },
    getAll: () => {
      const currentDB = readDB();
      return currentDB.images;
    },
  },
  compressedImages: {
    push: (image: ImageData) => {
      const currentDB = readDB();
      currentDB.compressedImages.push(image);
      writeDB(currentDB);
    },
    find: (predicate: (image: ImageData) => boolean) => {
      const currentDB = readDB();
      return currentDB.compressedImages.find(predicate);
    },
    getAll: () => {
      const currentDB = readDB();
      return currentDB.compressedImages;
    },
  },
};
