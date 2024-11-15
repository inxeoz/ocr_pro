const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const fetch = require("node-fetch"); // Add fetch for Node.js
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for cross-origin requests

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// OCR Endpoint: Process Uploaded File
app.post("/extract-text", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    // Convert the image buffer to Base64 format
    const imageBase64 = `data:image/png;base64,${req.file.buffer.toString("base64")}`;

    // Use Tesseract.js for OCR
    const { data: { text } } = await Tesseract.recognize(imageBase64, "eng");

    res.json({ extractedText: text });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process the image." });
  }
});

// OCR Endpoint: Process Image from URL
app.post("/extract-text-from-url", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "No image URL provided." });
    }

    // Fetch the image from the provided URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image. Status: ${response.status}`);
    }

    const buffer = await response.buffer();
    const imageBase64 = `data:image/png;base64,${buffer.toString("base64")}`;

    // Use Tesseract.js for OCR
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
