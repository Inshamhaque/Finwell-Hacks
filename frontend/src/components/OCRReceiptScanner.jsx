import React, { useState, useRef } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

const TRANSACTION_CATEGORIES = [
  "FOOD",
  "SHOPPING",
  "UTILITIES",
  "ENTERTAINMENT",
  "TRANSPORTATION",
  "EDUCATION",
  "INVESTMENT",
  "OTHERS",
];

const OCRReceiptScanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [categoryOverride, setCategoryOverride] = useState("");
  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    setError("");
    setTransaction(null);
    setRawResponse("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    setSelectedFile(file);
    await sendToOCRBackend(file);
  };

  const sendToOCRBackend = async (file) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("receipt", file);

      const res = await axios.post(`${BACKEND_URL}/ocr`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data = res.data;
      setRawResponse(data.raw || "");
      data.transaction
        ? setTransaction(data.transaction)
        : setError("Could not extract transaction.");
    } catch (err) {
      setError("Failed to process receipt.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!transaction) return;

    const finalTx = {
      ...transaction,
      category: categoryOverride || transaction.category,
    };

    try {
      const token = localStorage.getItem("token");
      const selectedAccountId = localStorage.getItem("selectedAccountId");
      if (!selectedAccountId) return setError("Account not selected.");
      if (!token) return setError("Not authenticated.");

      const res = await axios.post(
        `${BACKEND_URL}/user/transaction`,
        {
          fromAccountId: selectedAccountId,
          category: finalTx.category,
          date: finalTx.date,
          amount: finalTx.amount,
          description: finalTx.description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Reset
      setTransaction(null);
      setSelectedFile(null);
      setCategoryOverride("");
      setRawResponse("");
      setError("");
    } catch (err) {
      setError("Failed to add transaction.");
    }
  };

  return (
    <div className="text-white text-sm space-y-3 max-h-[75vh] overflow-y-auto">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-base">🧾 OCR Receipt Scanner</p>
        <button
          onClick={handleUploadClick}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded text-xs"
        >
          Upload
          {loading && (
            <span className="ml-2 inline-block w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="bg-red-600/20 border border-red-500 text-xs rounded p-2">
          {error}
        </div>
      )}

      {/* Preview */}
      {selectedFile && (
        <div className="flex items-center gap-3 bg-gray-800 rounded p-2 border border-gray-700">
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Receipt"
            className="w-16 h-16 rounded border border-gray-600 object-cover"
          />
          <div className="flex-1 text-xs">
            <p className="font-medium break-all">{selectedFile.name}</p>
            <p className="text-gray-400">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedFile(null);
              setTransaction(null);
              setRawResponse("");
              setError("");
              setCategoryOverride("");
            }}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Clear
          </button>
        </div>
      )}

      {/* Transaction Form */}
      {transaction && (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded space-y-3">
          <p className="text-sm font-medium mb-1">Extracted Transaction</p>
          <div className="grid grid-cols-1 gap-2">
            <input
              type="number"
              value={transaction.amount}
              placeholder="Amount"
              onChange={(e) =>
                setTransaction({
                  ...transaction,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              className="bg-gray-900 border border-gray-600 px-3 py-1.5 rounded text-sm"
            />
            <input
              type="date"
              value={transaction.date}
              onChange={(e) =>
                setTransaction({ ...transaction, date: e.target.value })
              }
              className="bg-gray-900 border border-gray-600 px-3 py-1.5 rounded text-sm"
            />
            <input
              type="text"
              placeholder="Description"
              value={transaction.description}
              onChange={(e) =>
                setTransaction({
                  ...transaction,
                  description: e.target.value,
                  merchant: e.target.value,
                })
              }
              className="bg-gray-900 border border-gray-600 px-3 py-1.5 rounded text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-1 mt-1">
            {TRANSACTION_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryOverride(cat)}
                className={`text-xs px-3 py-1 rounded-full border ${
                  (categoryOverride || transaction.category) === cat
                    ? "bg-indigo-500 border-indigo-500 text-white"
                    : "border-gray-500 text-gray-300 hover:border-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-right">
            <button
              onClick={handleAdd}
              disabled={!transaction || transaction.amount <= 0}
              className="bg-green-500 hover:bg-green-600 px-4 py-1.5 rounded-full text-sm font-semibold"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Raw output */}
      {rawResponse && (
        <details className="bg-gray-800 rounded border border-gray-700 p-2 text-xs">
          <summary className="cursor-pointer text-indigo-400 font-medium">
            Raw OCR Output
          </summary>
          <pre className="mt-1 text-gray-300 whitespace-pre-wrap max-h-32 overflow-y-auto">
            {rawResponse}
          </pre>
        </details>
      )}

      {/* Retry option */}
      {!transaction && selectedFile && !loading && !error && (
        <div className="bg-gray-800 border border-gray-700 p-2 rounded text-xs flex justify-between items-center">
          <p className="text-gray-300">Could not extract. Retry?</p>
          <button
            onClick={() => sendToOCRBackend(selectedFile)}
            className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-full"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default OCRReceiptScanner;
