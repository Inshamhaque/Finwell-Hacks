import React, { useState, useRef } from "react";
import axios from "axios";

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

/**
 * @typedef {Object} ExtractedTransaction
 * @property {number} amount
 * @property {string} description
 * @property {string} date
 * @property {string} category
 * @property {string} merchant
 *
 * @param {object} props
 * @param {string} props.activeAccountId - The currently selected bank account ID.
 * @param {(tx: ExtractedTransaction) => void} props.onTransactionExtracted - Callback when tx is added.
 */
const OCRReceiptScanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [categoryOverride, setCategoryOverride] = useState("");
  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // When file is selected
  const handleFileChange = async (e) => {
    setError("");
    setTransaction(null);
    setRawResponse("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    setSelectedFile(file);
    await sendToOCRBackend(file);
  };

  // Call backend OCR endpoint
  const sendToOCRBackend = async (file) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("receipt", file);

      const res = await axios.post("http://localhost:3000/ocr", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = res.data;
      setRawResponse(data.raw || "");

      if (data.transaction) {
        setTransaction(data.transaction);
      } else {
        setError("Could not extract structured transaction. Please edit manually.");
      }
    } catch (err) {
      console.error("OCR backend failed:", err);
      setError("Failed to process receipt. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add transaction -> send to backend
  const handleAdd = async () => {
    if (!transaction) return;
    // if (!activeAccountId) {
    //   setError("No account selected.");
    //   return;
    // }

    const finalTx = {
      ...transaction,
      category: categoryOverride || transaction.category,
    };

    try {
      const token = localStorage.getItem("token");
      const selectedAccountId = localStorage.setItem("selectedAccountId")
      if(!selectedAccountId){
        setError("account not selected");
      }
      if (!token) {
        setError("Not authenticated.");
        return;
      }

      const res = await axios.post(
        "http://localhost:3000/user/transaction",
        {
          // "5bc0b1bf-fb4b-41af-a683-d869cbdadb61"
          fromAccountId:selectedAccountId,
          category: finalTx.category,
          date: finalTx.date,
          amount: finalTx.amount,
          description: finalTx.description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      

      console.log("Transaction added:", res.data);
      setTransaction(null);
      setSelectedFile(null);
      setCategoryOverride("");
      setRawResponse("");
    } catch (err) {
      console.error("Failed to add transaction:", err);
      setError("Failed to add transaction.");
    }
  };

  return (
    <div className="w-screen h-screen mx-auto bg-gradient-to-br from-slate-900 via-indigo-900 to-black p-6 shadow-xl text-white space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold">Receipt OCR via OpenAI</h2>
          <p className="text-sm text-gray-300 mt-1">
            Upload a receipt image. We'll extract amount, date, merchant, and category.
          </p>
        </div>
      </div>

      {/* Upload */}
      <div className="flex gap-3">
        <button
          onClick={handleUploadClick}
          disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg py-3 text-sm"
        >
          Upload Receipt
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-sm">
          Processing... please wait. This uses OpenAI Vision & parsing.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-600/30 p-2 rounded text-sm flex gap-2">
          <span>⚠️</span> <span>{error}</span>
        </div>
      )}

      {/* Preview */}
      {selectedFile && (
        <div className="flex gap-4 items-center bg-slate-800/30 p-3 rounded">
          <div className="w-16 h-16 bg-slate-700 rounded overflow-hidden flex-shrink-0">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="receipt"
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <div className="font-medium">{selectedFile.name}</div>
            <div className="text-xs text-gray-400">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
        </div>
      )}

      {/* Transaction fields */}
      {transaction && (
        <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={transaction.amount}
                onChange={(e) =>
                  setTransaction({
                    ...transaction,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full bg-slate-800 px-3 py-2 rounded border border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Date</label>
              <input
                type="date"
                value={transaction.date}
                onChange={(e) =>
                  setTransaction({ ...transaction, date: e.target.value })
                }
                className="w-full bg-slate-800 px-3 py-2 rounded border border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">
              Merchant / Description
            </label>
            <input
              type="text"
              value={transaction.description}
              onChange={(e) =>
                setTransaction({
                  ...transaction,
                  description: e.target.value,
                  merchant: e.target.value,
                })
              }
              className="w-full bg-slate-800 px-3 py-2 rounded border border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Category</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {TRANSACTION_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryOverride(cat)}
                  className={`text-xs px-3 py-1 rounded-full font-medium border ${
                    (categoryOverride || transaction.category) === cat
                      ? "bg-indigo-500 border-indigo-500"
                      : "border-gray-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              disabled={!transaction || transaction.amount <= 0}
              className="bg-green-500 hover:bg-green-400 px-6 py-2 rounded font-semibold disabled:opacity-50"
            >
              Add Transaction
            </button>
          </div>
        </div>
      )}

      {/* Raw output */}
      {rawResponse && (
        <details className="bg-slate-800/60 p-3 rounded">
          <summary className="text-xs text-gray-300 cursor-pointer">
            Raw model output
          </summary>
          <pre className="mt-2 text-xs max-h-48 overflow-auto whitespace-pre-wrap">
            {rawResponse}
          </pre>
        </details>
      )}
    </div>
  );
};

export default OCRReceiptScanner;
