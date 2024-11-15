import React, { useState } from "react";

const ImageUploader = () => {
  const [image, setImage] = useState(null); // For preview (Base64 or URL)
  const [imageFile, setImageFile] = useState(null); // File object for backend
  const [imageUrl, setImageUrl] = useState(""); // URL entered by the user
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [eta, setETA] = useState(0);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Set file object
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result); // Preview image as Base64
      reader.readAsDataURL(file);
      setImageUrl(""); // Clear URL if a file is uploaded
    }
  };

  const handleUrlPaste = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImage(url); // Preview the URL
    setImageFile(null); // Clear the file if a URL is pasted
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setImageUrl("");
    setExtractedText("");
    setIsProcessing(false);
    setETA(0);
  };

  const processImage = async () => {
    if (!imageFile && !imageUrl) {
      alert("Please upload an image or provide a URL.");
      return;
    }

    setIsProcessing(true);
    setETA(10); // Simulated ETA for progress bar

    const interval = setInterval(() => {
      setETA((prevETA) => (prevETA > 0 ? prevETA - 1 : 0));
    }, 1000);

    try {
      let response;
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/extract-text`, {
          method: "POST",
          body: formData,
        });
      } else if (imageUrl) {
        response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/extract-text-from-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl }),
        });
      }

      const data = await response.json();
      if (response.ok) {
        setExtractedText(data.extractedText);
      } else {
        console.error(data.error);
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error processing the image:", error);
      alert("An error occurred while processing the image.");
    } finally {
      clearInterval(interval);
      setIsProcessing(false);
      setETA(0); // Reset ETA
    }
  };

  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard
        .writeText(extractedText)
        .then(() => alert("Text copied to clipboard!"))
        .catch((err) => console.error("Failed to copy:", err));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Contour Detection & OCR</h1>
      <div className="w-full max-w-lg p-6 bg-white shadow-md rounded-lg">
        <div className="mb-4">
          <label className="block mb-2 text-lg font-medium text-gray-700">Upload an Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-lg font-medium text-gray-700">Or Paste Image URL</label>
          <input
            type="text"
            placeholder="Enter image URL here..."
            value={imageUrl}
            onChange={handleUrlPaste}
            className="w-full p-2 border rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {image && (
          <div className="relative">
            <img src={image} alt="Uploaded Preview" className="w-full rounded-lg border border-gray-300" />
            <button
              onClick={handleReset}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600"
            >
              Reset
            </button>
          </div>
        )}
      </div>
      <div className="mt-8 flex flex-col items-center space-y-4">
        <button
          onClick={processImage}
          className={`px-6 py-2 text-white font-semibold rounded-lg shadow-md transition ${
            (imageFile || imageUrl) && !isProcessing ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!(imageFile || imageUrl) || isProcessing}
        >
          {isProcessing ? "Processing..." : "Process Image"}
        </button>

        {isProcessing && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Estimated Time Remaining: {eta}s</p>
            <div className="relative w-full max-w-sm h-2 bg-gray-300 rounded">
              <div className="absolute h-2 bg-blue-600 rounded" style={{ width: `${(10 - eta) * 10}%` }}></div>
            </div>
          </div>
        )}

        {extractedText && (
          <div className="p-4 bg-gray-50 border rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-2">Extracted Text:</h2>
            <p className="text-gray-800">{extractedText}</p>
            <button onClick={copyToClipboard} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
