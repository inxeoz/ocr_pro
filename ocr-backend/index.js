const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Enable CORS for cross-origin requests
app.use(cors());

// Set up file storage for uploaded images
const storage = multer.memoryStorage();
const upload = multer({ storage });

// API endpoint for OCR
app.post("/extract-text", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    // Convert buffer to Base64 for Tesseract.js
    const imageBase64 = `data:image/png;base64,${req.file.buffer.toString(
      "base64"
    )}`;

    // Run OCR using Tesseract.js
    const { data: { text } } = await Tesseract.recognize(imageBase64, "eng");

    res.json({ extractedText: text });
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Failed to process image." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`OCR backend is running on http://localhost:${PORT}`);
});
