import React, { useState, useRef } from "react";
import {
  Download,
  CheckCircle,
  RefreshCw,
  Eye,
  Code,
  FileDown,
} from "lucide-react";
import { GenerationResult } from "../services/geminiService";
import html2pdf from "html2pdf.js";

interface Props {
  result: GenerationResult;
  onRestart: () => void;
}

export default function Step5Result({ result, onRestart }: Props) {
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadHtml = () => {
    const blob = new Blob([result.htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-cv.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // Create a hidden iframe to render the HTML properly with its own isolated styles
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      // Use a standard A4 width in pixels (approx 794px at 96 DPI)
      iframe.style.width = "794px";
      iframe.style.height = "2000px"; // Large initial height
      iframe.style.border = "none";

      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!doc) throw new Error("Could not access iframe document");

      doc.open();
      doc.write(result.htmlContent);
      doc.close();

      // Wait for images, fonts, and layout to render completely
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Ensure body has correct dimensions for capturing
      doc.body.style.width = "794px"; // Match iframe width
      doc.body.style.margin = "0";
      doc.body.style.padding = "0";
      // Force background color to white to prevent transparent backgrounds
      doc.body.style.backgroundColor = "#ffffff";
      
      // Calculate exact height needed
      const scrollHeight = doc.body.scrollHeight;
      iframe.style.height = `${scrollHeight}px`;

      const opt = {
        margin: 0,
        filename: "optimized-cv.pdf",
        image: { type: "jpeg" as const, quality: 1 },
        enableLinks: true,
        html2canvas: {
          scale: 2, // Higher scale for better resolution
          useCORS: true,
          windowWidth: 794, // Match iframe width
          window: iframe.contentWindow, // Crucial: use iframe's window context for styles
          scrollY: 0,
          scrollX: 0,
          logging: false,
        },
        jsPDF: {
          unit: "mm" as const,
          format: "a4",
          orientation: "portrait" as const,
        },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().set(opt).from(doc.body).save();

      // Clean up
      document.body.removeChild(iframe);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try downloading as HTML instead.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto py-4 lg:h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-800 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
            Your Optimized CV is Ready
          </h2>
          <p className="text-zinc-500 mt-1 text-sm">
            We've tailored your CV to match the job description using your
            template.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={onRestart}
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 hover:border-zinc-300 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Start Over
          </button>
          <button
            onClick={handleDownloadHtml}
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm font-medium hover:bg-zinc-50 hover:border-zinc-300 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <Code className="w-3.5 h-3.5" />
            HTML
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="w-full md:w-auto px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
          >
            {isGeneratingPdf ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:flex-1 lg:min-h-0">
        <div className="lg:col-span-1 flex flex-col lg:min-h-0">
          <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-[0_8px_30px_rgb(79,70,229,0.06)] border border-indigo-100 flex flex-col h-full overflow-y-auto">
            <h3 className="text-lg font-bold tracking-tight text-zinc-800 mb-4 shrink-0">
              Match Analysis
            </h3>
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-zinc-600 text-sm font-medium">Match Score</span>
              <span
                className={`text-2xl font-black tracking-tighter ${
                  result.matchScore >= 80
                    ? "text-emerald-500"
                    : result.matchScore >= 60
                      ? "text-amber-500"
                      : "text-rose-500"
                }`}
              >
                {result.matchScore}%
              </span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-2 mb-6 overflow-hidden shrink-0">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  result.matchScore >= 80
                    ? "bg-emerald-500"
                    : result.matchScore >= 60
                      ? "bg-amber-500"
                      : "bg-rose-500"
                }`}
                style={{ width: `${result.matchScore}%` }}
              ></div>
            </div>
            <h4 className="text-xs font-bold text-zinc-800 mb-2 uppercase tracking-wider shrink-0">
              What we optimized
            </h4>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              {result.explanation}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col h-[500px] lg:h-full lg:min-h-0">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(79,70,229,0.06)] border border-indigo-100 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-indigo-100 bg-zinc-50/50 shrink-0">
              <h3 className="text-sm font-bold text-zinc-800 tracking-tight">
                Output Preview
              </h3>
              <div className="flex bg-zinc-200/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("preview")}
                  className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                    viewMode === "preview"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
                <button
                  onClick={() => setViewMode("code")}
                  className={`px-3 py-1 text-xs font-bold rounded-md flex items-center gap-1.5 transition-all ${
                    viewMode === "code"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  HTML Code
                </button>
              </div>
            </div>

            <div className="flex-1 bg-zinc-100/50 relative min-h-0">
              {viewMode === "preview" ? (
                <iframe
                  srcDoc={result.htmlContent}
                  title="CV Preview"
                  className="absolute inset-0 w-full h-full border-0 bg-white"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full overflow-auto p-6 bg-zinc-900 text-zinc-100 font-mono text-xs leading-relaxed">
                  <pre className="whitespace-pre-wrap">
                    <code>{result.htmlContent}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
