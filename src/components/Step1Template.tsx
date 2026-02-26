import React, { useState, useEffect } from "react";
import { Upload, FileCode, Save, Trash2 } from "lucide-react";

export interface TemplateData {
  text: string | null;
  base64: string | null;
  mimeType: string;
  name?: string;
}

interface Props {
  onNext: (data: TemplateData) => void;
}

export default function Step1Template({ onNext }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState("");
  const [savedTemplate, setSavedTemplate] = useState<TemplateData | null>(null);
  const [useSaved, setUseSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("savedCvTemplate");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedTemplate(parsed);
        setUseSaved(true);
      } catch (e) {
        console.error("Failed to parse saved template");
      }
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
      setUseSaved(false);
      const type = selected.type || "application/octet-stream";
      setMimeType(type);
      setError("");

      if (
        type === "application/pdf" ||
        type.includes("image/") ||
        selected.name.endsWith(".docx") ||
        selected.name.endsWith(".doc")
      ) {
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = (reader.result as string).split(",")[1];
          setBase64(b64);
          setText(null);
        };
        reader.onerror = () => setError("Failed to read file.");
        reader.readAsDataURL(selected);
      } else {
        try {
          const content = await selected.text();
          setText(content);
          setBase64(null);
        } catch (err) {
          setError("Failed to read text file.");
        }
      }
    }
  };

  const handleSaveDefault = () => {
    if ((text || base64) && fileName) {
      const templateData: TemplateData = {
        text,
        base64,
        mimeType,
        name: fileName,
      };
      localStorage.setItem("savedCvTemplate", JSON.stringify(templateData));
      setSavedTemplate(templateData);
      alert("Template saved as default!");
    }
  };

  const handleRemoveDefault = () => {
    localStorage.removeItem("savedCvTemplate");
    setSavedTemplate(null);
    setUseSaved(false);
  };

  const handleNext = () => {
    if (useSaved && savedTemplate) {
      onNext(savedTemplate);
      return;
    }

    if (!file) return;
    if (!text && !base64) {
      setError("File is still processing or failed to load.");
      return;
    }
    onNext({ text, base64, mimeType, name: fileName });
  };

  const isReady = (useSaved && savedTemplate) || (file && (text || base64));

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(79,70,229,0.06)] border border-indigo-100 w-full max-w-2xl h-full max-h-[calc(100vh-8rem)] my-auto overflow-hidden">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-2 sm:mb-4 shrink-0 shadow-inner shadow-indigo-100/50">
        <FileCode className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-800 mb-1 sm:mb-2 shrink-0 text-center">
        Upload Template CV
      </h2>
      <p className="text-zinc-500 text-center mb-4 sm:mb-6 max-w-md text-xs sm:text-sm shrink-0 hidden sm:block">
        Upload the CV template you want to use (HTML, PDF, Word, etc.). We'll
        extract its structure and styling.
      </p>

      {savedTemplate && (
        <div className="w-full max-w-md mb-3 sm:mb-4 p-2 sm:p-3 border border-indigo-200 bg-indigo-50/50 rounded-xl flex items-center justify-between transition-all hover:border-indigo-300 hover:shadow-sm hover:shadow-indigo-100 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <input
              type="radio"
              id="use-saved"
              checked={useSaved}
              onChange={() => setUseSaved(true)}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300"
            />
            <label
              htmlFor="use-saved"
              className="text-xs sm:text-sm font-medium text-zinc-700 cursor-pointer"
            >
              Use saved default:{" "}
              <span className="text-indigo-600 font-semibold truncate max-w-[100px] sm:max-w-[200px] inline-block align-bottom">
                {savedTemplate.name || "Template"}
              </span>
            </label>
          </div>
          <button
            onClick={handleRemoveDefault}
            className="p-1 sm:p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
            title="Remove default template"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      <div
        className={`w-full max-w-md transition-opacity duration-300 flex-1 min-h-[80px] sm:min-h-[120px] max-h-[160px] sm:max-h-[200px] ${useSaved ? "opacity-50 grayscale" : "opacity-100"}`}
      >
        <label
          htmlFor="template-upload"
          className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-indigo-200 rounded-2xl cursor-pointer bg-zinc-50/50 hover:bg-indigo-50/50 hover:border-indigo-400 transition-all group"
          onClick={() => setUseSaved(false)}
        >
          <div className="flex flex-col items-center justify-center pt-2 pb-2 sm:pt-4 sm:pb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm shadow-indigo-100 flex items-center justify-center mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <p className="mb-0.5 sm:mb-1 text-xs sm:text-sm text-zinc-600 text-center px-4">
              <span className="font-semibold text-indigo-600">
                Click to upload
              </span>{" "}
              <span className="hidden sm:inline">or drag and drop</span>
            </p>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">
              Any file type (PDF, HTML, DOCX)
            </p>
          </div>
          <input
            id="template-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {error && (
        <p className="text-rose-500 mt-2 sm:mt-4 text-xs sm:text-sm font-medium shrink-0 text-center">{error}</p>
      )}

      {!useSaved && file && (
        <div className="mt-2 sm:mt-4 flex flex-col items-center gap-2 sm:gap-3 shrink-0 w-full">
          <p className="text-indigo-700 text-xs sm:text-sm font-medium bg-indigo-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-indigo-200 text-center truncate max-w-[200px] sm:max-w-md">
            Selected: {file.name}
          </p>
          <button
            onClick={handleSaveDefault}
            disabled={!text && !base64}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all shadow-sm w-full max-w-[200px] sm:max-w-xs"
          >
            <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Save as default template
          </button>
        </div>
      )}

      <button
        onClick={handleNext}
        disabled={!isReady}
        className="mt-4 sm:mt-6 w-full max-w-md px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm sm:text-base font-semibold hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25 shrink-0"
      >
        Continue to Current CV
      </button>
    </div>
  );
}
