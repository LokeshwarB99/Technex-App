import React, { useState } from "react";
import axios from "axios";

const Gugugaga = () => {
  const [image, setImage] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result.split(",")[1]); // Extract base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    try {
      const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        new URLSearchParams({
          key: "1927edb8a3d4c8a7d375dc20726dacab",
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

      // Log the response data
      console.log("Upload Response:", response.data);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  return (
    <div>
      <h1>Upload Image to ImgBB</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>

      {uploadResponse && (
        <div>
          <h2>Upload Response:</h2>
          <pre>{JSON.stringify(uploadResponse, null, 2)}</pre>
          {uploadResponse.data && (
            <div>
              <h3>Image Preview:</h3>
              <img src={uploadResponse.data.url} alt="Uploaded" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Gugugaga;
