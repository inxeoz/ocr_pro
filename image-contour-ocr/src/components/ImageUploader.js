import React, { useState } from "react";

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null); // Store the original file
  const [imageUrl, setImageUrl] = useState(""); // Store the pasted URL
  const [extractedText, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false); // Track processing state
  const [eta, setETA] = useState(0); // Store ETA in seconds

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Save the raw file for processing
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result); // Set Base64 for preview
      reader.readAsDataURL(file);
    }
  };

  const handleUrlPaste = (e) => {
    const url = e.target.value;
    setImageUrl(url);
    setImageFile(null); // Clear uploaded file if a URL is pasted
    setImage(url); // Use URL directly for preview
  };

  const handleReset = () => {
    setImage(null);
    setImageFile(null);
    setImageUrl("");
    setText("");
    setIsProcessing(false);
    setETA(0);
  };

  const processImage = async () => {
    if (!imageFile && !imageUrl) return;

    setIsProcessing(true);
    setETA(10); // Set an initial ETA (adjust this value based on real-world testing)

    // Simulate ETA countdown
    const interval = setInterval(() => {
      setETA((prevETA) => (prevETA > 0 ? prevETA - 1 : 0));
    }, 1000);

    try {
      let formData;

      if (imageFile) {
        formData = new FormData();
        formData.append("image", imageFile); // Append the raw file
      } else if (imageUrl) {
        // Fetch the image from the URL and send as a blob
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error("Failed to fetch image from URL");
        const imageBlob = await response.blob();
        formData = new FormData();
        formData.append("image", imageBlob, "image.jpg"); // Send the blob as an image
      }

      const response = await fetch(`${REACT_APP_API_BASE_URL}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setText(data.extractedText);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error sending image to backend:", error);
    } finally {
      clearInterval(interval); // Stop the countdown
      setIsProcessing(false);
      setETA(0); // Clear the ETA after processing
    }
  };


  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText)
        .then(() => {
          alert('Text copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Contour Detection & OCR
      </h1>
      <div className="w-full max-w-lg p-6 bg-white shadow-md rounded-lg">
        <div className="mb-4">
          <label className="block mb-2 text-lg font-medium text-gray-700">
            Upload an Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-lg font-medium text-gray-700">
            Or Paste Image URL
          </label>
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
            <img
              src={image}
              alt="Uploaded Preview"
              className="w-full rounded-lg border border-gray-300"
            />
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
          className={`px-6 py-2 text-white font-semibold rounded-lg shadow-md transition ${(imageFile || imageUrl) && !isProcessing
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
            }`}
          disabled={!(imageFile || imageUrl) || isProcessing}
        >
          {isProcessing ? "Processing..." : "Process Image"}
        </button>

        {isProcessing && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Estimated Time Remaining: {eta}s
            </p>
            <div className="relative w-full max-w-sm h-2 bg-gray-300 rounded">
              <div
                className="absolute h-2 bg-blue-600 rounded"
                style={{ width: `${(10 - eta) * 10}%` }} // Progress bar
              ></div>
            </div>
          </div>
        )}

        <div>
          {extractedText && (
            <div className="p-4 bg-gray-50 border rounded-lg shadow-md">
              <h2 className="text-lg font-bold mb-2">Extracted Text:</h2>
              <p className="text-gray-800">{extractedText}</p>
              <button
                onClick={copyToClipboard}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
