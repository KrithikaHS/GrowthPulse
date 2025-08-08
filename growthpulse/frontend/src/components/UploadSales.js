import { useState } from "react";
import { uploadSales } from "../api";
import "../styles/UploadSales.css";

export default function UploadSales({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV or Excel file.");
    setMessage("Uploading...");
    const data = await uploadSales(file);
    if (data.error) {
      setMessage(`Error: ${data.error}`);
    } else {
      setMessage("Upload successful!");
      onUploadSuccess(data.kpi_summary);
    }
  };

  return (
    <div className="upload-container">
      <h3>Upload Sales Data</h3>
      <input
        type="file"
        accept=".csv, .xls, .xlsx"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
    </div>
  );
}
