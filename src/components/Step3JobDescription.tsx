import React, { useState } from "react";
import { Briefcase } from "lucide-react";

interface Props {
  onNext: (jobDescription: string) => void;
  onBack: () => void;
}

export default function Step3JobDescription({ onNext, onBack }: Props) {
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!jobDescription.trim()) {
      setError("Please provide the job description.");
      return;
    }
    onNext(jobDescription);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(79,70,229,0.06)] border border-indigo-100 w-full max-w-2xl h-full max-h-[calc(100vh-8rem)] my-auto overflow-hidden">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-2 sm:mb-4 shrink-0 shadow-inner shadow-indigo-100/50">
        <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-800 mb-1 sm:mb-2 shrink-0 text-center">
        Target Job Description
      </h2>
      <p className="text-zinc-500 text-center mb-4 sm:mb-6 max-w-md text-xs sm:text-sm shrink-0 hidden sm:block">
        Paste the job description you are applying for. We'll identify keywords
        and required skills to optimize your CV.
      </p>

      <div className="w-full flex-1 min-h-0 flex flex-col">
        <label className="block text-xs sm:text-sm font-semibold text-zinc-800 mb-1 sm:mb-2 shrink-0">
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => {
            setJobDescription(e.target.value);
            setError("");
          }}
          placeholder="Paste the full job description here..."
          className="w-full flex-1 p-3 sm:p-4 border-2 border-indigo-200 rounded-2xl focus:ring-0 focus:border-indigo-500 bg-zinc-50/50 hover:bg-indigo-50/50 transition-all resize-none text-xs sm:text-sm text-zinc-700 placeholder:text-zinc-400 min-h-[120px] md:min-h-[160px]"
        />
      </div>

      {error && (
        <p className="text-rose-500 mt-2 sm:mt-4 text-xs sm:text-sm font-medium shrink-0 text-center">{error}</p>
      )}

      <div className="flex gap-3 sm:gap-4 mt-4 sm:mt-6 w-full shrink-0">
        <button
          onClick={onBack}
          className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-sm sm:text-base font-semibold hover:bg-zinc-50 hover:border-zinc-300 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!jobDescription.trim()}
          className="flex-[2] px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl text-sm sm:text-base font-semibold hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/25"
        >
          Review & Generate
        </button>
      </div>
    </div>
  );
}
