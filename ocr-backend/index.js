import express from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Configure Multer for file uploads


// OCR Endpoint: Process Uploaded File
app.get("/extract-text", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    const imageBase64 = `data:image/png;base64,${req.file.buffer.toString("base64")}`;
    const { data: { text } } = await Tesseract.recognize(imageBase64, "eng");

    res.json({ extractedText: text });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process the image." });
  }
});

// OCR Endpoint: Process Image from URL
app.get("/extract-text-from-url", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "No image URL provided." });
    }

    // Dynamic import of node-fetch
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

    // Fetch the image from the provided URL
    // Fetch the image from the provided URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image. Status: ${response.status}`);
    }

    // Use arrayBuffer instead of buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageBase64 = `data:image/png;base64,${buffer.toString("base64")}`;


    const { data: { text } } = await Tesseract.recognize(imageBase64, "eng");

    res.json({ extractedText: text });
  } catch (error) {
    console.error("Error processing image from URL:", error);
    res.status(500).json({ error: "Failed to process the image from URL." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`OCR backend is running on http://localhost:${PORT}`);
});
