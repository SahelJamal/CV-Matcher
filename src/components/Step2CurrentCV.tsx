import React, { useState, useEffect } from "react";
import { FileText, Upload, Save, Trash2 } from "lucide-react";

interface SavedCVData {
  text: string;
  pdfBase64: string | null;
  name?: string;
}

interface Props {
  onNext: (text: string, pdfBase64: string | null) => void;
  onBack: () => void;
}

export default function Step2CurrentCV({ onNext, onBack }: Props) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState("");
  const [savedCV, setSavedCV] = useState<SavedCVData | null>(null);
  const [useSaved, setUseSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("savedCurrentCv");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedCV(parsed);
        setUseSaved(true);
      } catch (e) {
        console.error("Failed to parse saved CV");
      }
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFileName(selected.name);
      setUseSaved(false);
      if (selected.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1];
          setPdfBase64(base64);
          setFile(selected);
          setText("");
          setError("");
        };
        reader.onerror = () => setError("Failed to read PDF.");
        reader.readAsDataURL(selected);
      } else if (
        selected.type === "text/plain" ||
        selected.name.endsWith(".txt")
      ) {
        try {
          const content = await selected.text();
          setText(content);
          setFile(selected);
          setPdfBase64(null);
          setError("");
        } catch (err) {
          setError("Failed to read text file.");
        }
      } else {
        setError("Please upload a PDF or Text file.");
        setFile(null);
      }
    }
  };

  const handleSaveDefault = () => {
    if ((text.trim() || pdfBase64) && (fileName || text.trim())) {
      const cvData: SavedCVData = {
        text,
        pdfBase64,
        name: fileName || "Pasted Text CV",
      };
      localStorage.setItem("savedCurrentCv", JSON.stringify(cvData));
      setSavedCV(cvData);
      alert("Current CV saved as default!");
    }
  };

  const handleRemoveDefault = () => {
    localStorage.removeItem("savedCurrentCv");
    setSavedCV(null);
    setUseSaved(false);
  };

  const handleNext = () => {
    if (useSaved && savedCV) {
      onNext(savedCV.text, savedCV.pdfBase64);
      return;
    }

    if (!text.trim() && !pdfBase64) {
      setError("Please provide your current CV content.");
      return;
    }
    onNext(text, pdfBase64);
  };

  const isReady = (useSaved && savedCV) || text.trim() || pdfBase64;

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(79,70,229,0.06)] border border-indigo-100 w-full max-w-4xl h-full max-h-[calc(100vh-8rem)] my-auto overflow-hidden">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-2 sm:mb-4 shrink-0 shadow-inner shadow-indigo-100/50">
        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-800 mb-1 sm:mb-2 shrink-0 text-center">
        Your Current CV
      </h2>
      <p className="text-zinc-500 text-center mb-4 sm:mb-6 max-w-md text-xs sm:text-sm shrink-0 hidden sm:block">
        Paste your current CV text or upload a PDF/Text file. We'll extract your
        experience and skills.
      </p>

      {savedCV && (
        <div className="w-full max-w-2xl mb-3 sm:mb-4 p-2 sm:p-3 border border-indigo-200 bg-indigo-50/50 rounded-xl flex items-center justify-between transition-all hover:border-indigo-300 hover:shadow-sm hover:shadow-indigo-100 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <input
              type="radio"
              id="use-saved-cv"
              checked={useSaved}
              onChange={() => setUseSaved(true)}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 focus:ring-indigo-500 border-indigo-300"
            />
            <label
              htmlFor="use-saved-cv"
              className="text-xs sm:text-sm font-medium text-zinc-700 cursor-pointer"
            >
              Use saved default:{" "}
              <span className="text-indigo-600 font-semibold truncate max-w-[100px] sm:max-w-[200px] inline-block align-bottom">{savedCV.name || "CV"}</span>
            </label>
          </div>
          <button
            onClick={handleRemoveDefault}
            className="p-1 sm:p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
            title="Remove default CV"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      <div
        className={`w-full max-w-3xl flex flex-col md:flex-row gap-3 sm:gap-6 transition-opacity duration-300 flex-1 min-h-0 ${useSaved ? "opacity-50 grayscale" : "opacity-100"}`}
      >
        <div className="flex flex-col flex-1 md:flex-1 min-h-0">
          <label className="block text-xs sm:text-sm font-semibold text-zinc-800 mb-1 sm:mb-2 shrink-0">
            Paste Text
          </label>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setFile(null);
              setPdfBase64(null);
              setFileName("");
              setUseSaved(false);
            }}
            onClick={() => setUseSaved(false)}
            placeholder="Paste your CV content here..."
            className="w-full flex-1 p-3 sm:p-4 border-2 border-indigo-200 rounded-2xl focus:ring-0 focus:border-indigo-500 bg-zinc-50/50 hover:bg-indigo-50/50 transition-all resize-none text-xs sm:text-sm text-zinc-700 placeholder:text-zinc-400 min-h-[100px] md:min-h-[120px]"
          />
        </div>

        <div className="flex flex-col shrink-0 md:flex-1 md:min-h-0">
          <label className="block text-xs sm:text-sm font-semibold text-zinc-800 mb-1 sm:mb-2 shrink-0">
            Or Upload File
          </label>
          <label
            htmlFor="cv-upload"
            className="flex flex-row md:flex-col items-center justify-center w-full md:flex-1 border-2 border-dashed border-indigo-200 rounded-2xl cursor-pointer bg-zinc-50/50 hover:bg-indigo-50/50 hover:border-indigo-400 transition-all group p-3 md:p-0 min-h-[60px] md:min-h-[120px]"
            onClick={() => setUseSaved(false)}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full shadow-sm shadow-indigo-100 flex items-center justify-center mr-3 md:mr-0 md:mb-3 group-hover:scale-110 transition-transform shrink-0">
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <div className="flex flex-col items-start md:items-center justify-center">
              <p className="mb-0 md:mb-1 text-xs sm:text-sm text-zinc-600 text-center">
                <span className="font-semibold text-indigo-600">
                  Click to upload
                </span>
              </p>
              <p className="text-[10px] sm:text-xs text-zinc-400 font-medium">PDF or TXT</p>
            </div>
            <input
              id="cv-upload"
              type="file"
              accept=".pdf,.txt,text/plain,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      {error && (
        <p className="text-rose-500 mt-2 sm:mt-4 text-xs sm:text-sm font-medium shrink-0 text-center">{error}</p>
      )}

      {!useSaved && (file || text.trim()) && (
        <div className="mt-2 sm:mt-4 flex flex-col items-center gap-2 sm:gap-3 shrink-0 w-full">
          {file && (
            <p className="text-indigo-700 text-xs sm:text-sm font-medium bg-indigo-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-indigo-200 text-center truncate max-w-[200px] sm:max-w-md">
              Selected: {file.name}
            </p>
          )}
          <button
            onClick={handleSaveDefault}
            disabled={!text.trim() && !pdfBase64}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all shadow-sm w-full max-w-[200px] sm:max-w-xs"
          >
            <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Save as default CV
          </button>
        </div>
      )}

      <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6 w-full max-w-md shrink-0">
        <button
          onClick={onBack}
          className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm sm:text-base font-semibold hover:bg-zinc-50 hover:border-zinc-300 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isReady}
          className="flex-[2] px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm sm:text-base font-semibold hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
