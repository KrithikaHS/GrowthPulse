// frontend/src/components/UploadSales.js
import { useState } from "react";

export default function UploadSales({ onKPIUpdate }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/upload-sales/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ " + data.message);
        if (data.kpi_summary) {
          onKPIUpdate(data.kpi_summary);
        }
      } else {
        alert("❌ " + (data.error || "Upload failed"));
      }
    } catch (error) {
      console.error(error);
      alert("❌ Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".csv,.xls,.xlsx" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
