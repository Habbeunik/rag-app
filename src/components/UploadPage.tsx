"use client";

import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { extractPDFText } from "@/lib/pdf-utils";
import {
  Upload,
  X,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface UploadPageProps {
  onFilesUploaded: (files: File[], documentId?: string) => void;
}

export default function UploadPage({ onFilesUploaded }: UploadPageProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError("");
      if (acceptedFiles.length > 0) {
        setFiles([acceptedFiles[0]]);
      }
      if (rejectedFiles.length > 0) {
        setError("Invalid file. Please upload a PDF file up to 10MB.");
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
      },
      multiple: false,
      maxSize: 10 * 1024 * 1024,
    });

  const removeFile = () => {
    setFiles([]);
    setProcessingStatus("");
    setError("");
  };

  const processPDF = async (file: File): Promise<string> => {
    setProcessingStatus("Extracting text from PDF...");
    const text = await extractPDFText(file);

    setProcessingStatus("Creating embeddings and processing...");
    const response = await fetch("/api/process-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        filename: file.name,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to process PDF");
    }

    const result = await response.json();
    return result.data.documentId;
  };

  const handleSubmit = async () => {
    if (files.length > 0) {
      setIsProcessing(true);
      setProcessingStatus("Processing PDF...");
      setError("");

      try {
        const file = files[0];
        const documentId = await processPDF(file);
        setProcessingStatus("Success! Opening chat...");

        setTimeout(() => {
          onFilesUploaded(files, documentId);
        }, 800);
      } catch (err) {
        console.error("Error processing PDF:", err);
        setError(err instanceof Error ? err.message : "Failed to process PDF");
        setIsProcessing(false);
        setProcessingStatus("");
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      {/* Header with Theme Toggle */}
      <div className="flex justify-end p-4 sm:p-6">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600 dark:bg-blue-500 mb-6 shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              PDF Chat
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Upload a PDF and chat with your document using AI
            </p>
          </div>

          {/* Upload Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 p-8">
            <div
              {...getRootProps()}
              className={`
                relative border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer
                transition-all duration-200 group
                ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]"
                    : isDragReject
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload
                className={`
                  mx-auto mb-6 transition-all
                  ${
                    isDragActive
                      ? "text-blue-600 dark:text-blue-400 scale-110"
                      : "text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:scale-105"
                  }
                `}
                size={56}
                strokeWidth={1.5}
              />
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                {isDragActive
                  ? "Drop your PDF here!"
                  : isDragReject
                  ? "Invalid file type"
                  : "Drag & drop PDF here"}
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
                or click to browse your files
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300">
                <FileText size={18} />
                <span>PDF files up to 10MB</span>
              </div>
              {!isDragActive && !files.length && (
                <p className="mt-6 text-sm text-slate-500 dark:text-slate-500">
                  📝 New uploads replace the previous document
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Selected File */}
            {files.length > 0 && (
              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="shrink-0 w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate text-lg">
                      {files[0].name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {formatFileSize(files[0].size)}
                    </p>
                  </div>
                  <button
                    onClick={removeFile}
                    disabled={isProcessing}
                    className="shrink-0 p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Remove file"
                  >
                    <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>

                {/* Processing Status */}
                {processingStatus && (
                  <div className="flex items-center justify-center gap-3 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    {isProcessing ? (
                      <>
                        <div className="shrink-0 w-5 h-5 border-3 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          {processingStatus}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="shrink-0 w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                          {processingStatus}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Process Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="
                    w-full py-5 px-6 rounded-xl font-bold text-lg
                    bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                    dark:bg-blue-500 dark:hover:bg-blue-600
                    text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                    transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-blue-600
                    focus:outline-none focus:ring-4 focus:ring-blue-500/50
                  "
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Start Chatting with PDF
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-3xl mb-2">🤖</div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                AI-Powered
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Intelligent responses
              </p>
            </div>
            <div className="p-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Fast Processing
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Quick analysis
              </p>
            </div>
            <div className="p-5 bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                Privacy First
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Secure processing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Built by{" "}
          <a
            href="https://abbeykumapayi.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            Abbey Kumapayi
          </a>
        </p>
      </div>
    </div>
  );
}
