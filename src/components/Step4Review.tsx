import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import {
  generateOptimizedCV,
  GenerationResult,
} from "../services/geminiService";

import { TemplateData } from "./Step1Template";

interface Props {
  templateData: TemplateData;
  currentCvText: string;
  currentCvPdfBase64: string | null;
  jobDescription: string;
  onNext: (result: GenerationResult) => void;
  onBack: () => void;
}

export default function Step4Review({
  templateData,
  currentCvText,
  currentCvPdfBase64,
  jobDescription,
  onNext,
  onBack,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const result = await generateOptimizedCV(
        templateData,
        currentCvText,
        currentCvPdfBase64,
        jobDescription,
      );
      onNext(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate CV. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-5 sm:p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(79,70,229,0.06)] border border-indigo-100 w-full max-w-2xl my-auto">
      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 shrink-0 shadow-inner shadow-indigo-100/50">
        <Sparkles className="w-6 h-6 text-indigo-600" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-zinc-800 mb-2 shrink-0 text-center">
        Ready to Optimize
      </h2>
      <p className="text-zinc-500 text-center mb-6 max-w-md text-sm shrink-0">
        We have all the information needed. Click generate to create your
        ATS-optimized CV using the provided template.
      </p>

      <div className="w-full bg-zinc-50/50 rounded-2xl p-6 mb-6 border border-indigo-100 shrink-0">
        <h3 className="text-base font-semibold text-zinc-800 mb-4">
          Summary of Inputs
        </h3>
        <ul className="space-y-3 text-sm text-zinc-600 font-medium">
          <li className="flex items-center">
            <span className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-[10px] shadow-sm shadow-indigo-500/20">
              ✓
            </span>
            Template CV ({templateData.base64 ? "Document" : "Text/HTML"})
          </li>
          <li className="flex items-center">
            <span className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-[10px] shadow-sm shadow-indigo-500/20">
              ✓
            </span>
            Current CV ({currentCvPdfBase64 ? "PDF" : "Text"})
          </li>
          <li className="flex items-center">
            <span className="w-5 h-5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-[10px] shadow-sm shadow-indigo-500/20">
              ✓
            </span>
            Job Description ({jobDescription.split(" ").length} words)
          </li>
        </ul>
      </div>

      {error && (
        <div className="w-full bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 text-sm font-medium border border-rose-100 shrink-0 text-center">
          {error}
        </div>
      )}

      <div className="flex gap-4 w-full shrink-0">
        <button
          onClick={onBack}
          disabled={isGenerating}
          className="flex-1 px-6 py-3.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl font-semibold hover:bg-zinc-50 hover:border-zinc-300 transition-all disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex-[2] px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Optimized CV"
          )}
        </button>
      </div>
    </div>
  );
}
