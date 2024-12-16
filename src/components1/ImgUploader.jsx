import React, { useState, useRef } from "react";
import axios from "axios";
import './spin.css'

const ImageUploader = () => {
  const [image, setImage] = useState(null); // Base64 string of the image
  const [uploadResponse, setUploadResponse] = useState(null); // Response from ImgBB
  const [previewUrl, setPreviewUrl] = useState(null); // Image preview
  const [isLinkCopied, setIsLinkCopied] = useState(false); // State for copy indication
  const fileInputRef = useRef(null); // Ref for file input
  const [isUploading, setIsUploading] = useState(false);


  // Handle drag-and-drop events
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // Open file explorer on div click
  const handleDivClick = (e) => {
    if (e.target.tagName !== "INPUT" && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  // Read file and convert to base64
  const processFile = (file) => {
    setUploadResponse(null); // Clear old upload response
    setPreviewUrl(null); // Clear old preview
    setIsLinkCopied(false); // Reset copy state
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result.split(",")[1]); // Extract base64 string
      setPreviewUrl(reader.result); // Show preview
    };
    reader.readAsDataURL(file);
  };

  // Handle drag-over event to prevent default behavior
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Upload image to ImgBB
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please select an image before uploading.");
      return;
    }

    setIsUploading(true); // Start uploading animation
    try {
      const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        new URLSearchParams({
          key: "1927edb8a3d4c8a7d375dc20726dacab", // Replace with your API key
          image: image,
          expiration: "600", // optional
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      setUploadResponse(response.data);
      console.log(response.data)
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false); // Stop uploading animation
    }
  };


  const resetForm = () => {
    setImage(null);
    setPreviewUrl(null);
    setUploadResponse(null);
    setIsLinkCopied(false); // Reset copy state
  };

  const handleCopyLink = () => {
    if (uploadResponse?.data?.url) {
      navigator.clipboard.writeText(uploadResponse.data.url);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 5000); // Reset after 2 seconds
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "auto",
        textAlign: "center",
      }}
    >
      <h1>Image Uploader</h1>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleDivClick}
        style={{
          border: "2px dashed #aaa",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "20px",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <p>Drag and drop an image here, or click to select one.</p>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{
            opacity: 0,
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            cursor: "pointer",
          }}
        />
      </div>

      {previewUrl && (
        <div style={{ marginBottom: "20px" }}>
          <h3>Preview:</h3>
          <img
            src={previewUrl}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: "300px" }}
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!image || isUploading}
        style={{
          padding: "10px 20px",
          marginRight: "10px",
          backgroundColor: isUploading ? "#ccc" : "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: isUploading ? "not-allowed" : "pointer",
          // display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isUploading ? (
          <div
            style={{
              width: "15px",
              height: "15px",
              border: "3px solid #fff",
              borderTop: "3px solid #ccc",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
        ) : (
          "Upload Image"
        )}
      </button>

      {/* <button
        onClick={resetForm}
        style={{
          padding: "10px 20px",
          backgroundColor: "#dc3545",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Reset
      </button> */}

      {uploadResponse && (
        <div style={{ marginTop: "20px" }}>
          <h2>Upload Successful!</h2>
          <a
            href={uploadResponse.data.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", margin: "10px 0" }}
          >
            {uploadResponse.data.url}
          </a>
          <button
            onClick={handleCopyLink}
            style={{
              padding: "10px 20px",
              backgroundColor: isLinkCopied ? "#28a745" : "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {isLinkCopied ? "Link Copied!" : "Copy Link"}
          </button>
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          fontStyle: "italic",
          color: "#555",
          userSelect: "none",
        }}
      >
        <p>
          Note: You can upload multiple images using this webpage. Drag, drop,
          or click to select another image to upload again.
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;
