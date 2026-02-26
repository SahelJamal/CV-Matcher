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
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);

  const getResponsiveHtml = () => {
    let html = result.htmlContent;
    
    // Inject viewport meta if missing
    if (!html.includes('viewport')) {
      if (html.includes('<head>')) {
        html = html.replace('<head>', '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">');
      } else if (html.includes('<html>')) {
        html = html.replace('<html>', '<html>\n<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">\n</head>');
      } else {
        html = '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">\n</head>\n' + html;
      }
    }

    // Inject mobile-friendly CSS
    const mobileCss = `
      <style>
        /* Mobile Preview Optimizations */
        @media screen and (max-width: 768px) {
          html, body {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 12px !important;
            overflow-x: hidden !important;
            box-sizing: border-box !important;
          }
          
          /* Force all elements to respect container width */
          * {
            max-width: 100% !important;
            box-sizing: border-box !important;
          }

          /* Increase base font sizes for readability */
          body, p, li, span, div, td, th, a {
            font-size: 18px !important;
            line-height: 1.6 !important;
          }
          
          h1 { font-size: 28px !important; line-height: 1.3 !important; margin-bottom: 12px !important; }
          h2 { font-size: 24px !important; line-height: 1.3 !important; margin-bottom: 10px !important; }
          h3 { font-size: 20px !important; line-height: 1.3 !important; margin-bottom: 8px !important; }

          /* Convert multi-column layouts to single column */
          table { display: block !important; width: 100% !important; }
          thead { display: none !important; }
          tbody, tr, td, th { display: block !important; width: 100% !important; text-align: left !important; }
          
          .flex, .grid, [style*="display: flex"], [style*="display: grid"] {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            gap: 12px !important;
          }
          
          /* Adjust margins and padding for mobile */
          section, div {
            padding-left: 0 !important;
            padding-right: 0 !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
        }
      </style>
    `;

    if (html.includes('</head>')) {
      return html.replace('</head>', mobileCss + '</head>');
    } else if (html.includes('<body>')) {
      return html.replace('<body>', mobileCss + '<body>');
    }
    return mobileCss + html;
  };

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

  const handleDownloadWord = () => {
    setIsGeneratingWord(true);
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(result.htmlContent, 'text/html');

      // Add Word XML namespaces to html tag
      doc.documentElement.setAttribute('xmlns:o', 'urn:schemas-microsoft-com:office:office');
      doc.documentElement.setAttribute('xmlns:w', 'urn:schemas-microsoft-com:office:word');
      doc.documentElement.setAttribute('xmlns', 'http://www.w3.org/TR/REC-html40');

      // Ensure meta charset exists
      if (!doc.querySelector('meta[charset]')) {
        const meta = doc.createElement('meta');
        meta.setAttribute('charset', 'utf-8');
        doc.head.insertBefore(meta, doc.head.firstChild);
      }

      // Style existing links so Word recognizes them
      const links = doc.querySelectorAll('a');
      links.forEach(link => {
        if (!link.style.color) link.style.color = '#0563C1';
        if (!link.style.textDecoration) link.style.textDecoration = 'underline';
      });

      // Find all text nodes to auto-linkify plain text emails and URLs
      const walk = document.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
      let node;
      const textNodes: Node[] = [];
      while ((node = walk.nextNode())) {
        if (
          node.parentNode &&
          node.parentNode.nodeName !== 'A' &&
          node.parentNode.nodeName !== 'STYLE' &&
          node.parentNode.nodeName !== 'SCRIPT'
        ) {
          textNodes.push(node);
        }
      }

      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const nakedUrlRegex = /(www\.[^\s]+|linkedin\.com\/in\/[^\s]+|github\.com\/[^\s]+)/g;

      textNodes.forEach(textNode => {
        let text = textNode.nodeValue || '';
        
        const hasEmail = emailRegex.test(text);
        const hasUrl = urlRegex.test(text);
        const hasNakedUrl = nakedUrlRegex.test(text);

        if (hasEmail || hasUrl || hasNakedUrl) {
          // Reset regex state
          emailRegex.lastIndex = 0;
          urlRegex.lastIndex = 0;
          nakedUrlRegex.lastIndex = 0;

          const escapeHtml = (unsafe: string) => {
            return unsafe
                 .replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;");
          };
          
          let safeText = escapeHtml(text);
          
          if (hasEmail) {
            safeText = safeText.replace(emailRegex, '<a href="mailto:$1" style="color:#0563C1;text-decoration:underline;">$1</a>');
          }
          if (hasUrl) {
            safeText = safeText.replace(urlRegex, '<a href="$1" style="color:#0563C1;text-decoration:underline;">$1</a>');
          } else if (hasNakedUrl) {
            safeText = safeText.replace(nakedUrlRegex, '<a href="https://$1" style="color:#0563C1;text-decoration:underline;">$1</a>');
          }

          const span = doc.createElement('span');
          span.innerHTML = safeText;
          if (textNode.parentNode) {
            textNode.parentNode.replaceChild(span, textNode);
          }
        }
      });

      const sourceHTML = doc.documentElement.outerHTML;
      
      const blob = new Blob(['\ufeff', sourceHTML], {
        type: 'application/msword'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "optimized-cv.doc";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate Word document:", error);
      alert("Failed to generate Word document. Please try downloading as HTML instead.");
    } finally {
      setIsGeneratingWord(false);
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
            onClick={handleDownloadWord}
            disabled={isGeneratingWord}
            className="w-full md:w-auto px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
          >
            {isGeneratingWord ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            Download Word
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

        <div className="lg:col-span-2 flex flex-col h-[70vh] min-h-[600px] lg:h-full lg:min-h-0">
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
                  srcDoc={getResponsiveHtml()}
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
