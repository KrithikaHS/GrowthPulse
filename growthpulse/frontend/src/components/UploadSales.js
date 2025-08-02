import axios from "axios";
import { useState } from "react";

function UploadSales({ onUploadSuccess }) {  // ✅ add { onUploadSuccess }
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const handleClear = async () => {
  try {
    await axios.delete("http://127.0.0.1:8000/api/clear-sales/");
    setMessage("✅ All sales data cleared");
    if (onUploadSuccess) onUploadSuccess(); // refresh charts after clearing
  } catch (err) {
    setMessage(`❌ Clear failed: ${err.response?.data?.message || err.message}`);
  }
};
  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/upload-sales/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(`✅ Upload successful: ${res.data.rows_added} rows added`);

      if (onUploadSuccess) onUploadSuccess(); // ✅ call parent refresh
    } catch (err) {
      setMessage(`❌ Upload failed: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
      <p>{message}</p>
      <button onClick={handleClear} style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}>
      Clear Data
    </button>
    </div>
  );
}

export default UploadSales;
