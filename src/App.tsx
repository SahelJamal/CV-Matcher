import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Step1Template, { TemplateData } from "./components/Step1Template";
import Step2CurrentCV from "./components/Step2CurrentCV";
import Step3JobDescription from "./components/Step3JobDescription";
import Step4Review from "./components/Step4Review";
import Step5Result from "./components/Step5Result";
import LoginPage from "./components/LoginPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import { GenerationResult } from "./services/geminiService";
import { Sparkles, LogOut, User as UserIcon } from "lucide-react";

const steps = [
  { id: 1, title: "Template" },
  { id: 2, title: "Current CV" },
  { id: 3, title: "Job Desc" },
  { id: 4, title: "Review" },
  { id: 5, title: "Result" },
];

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [currentCvText, setCurrentCvText] = useState("");
  const [currentCvPdfBase64, setCurrentCvPdfBase64] = useState<string | null>(
    null,
  );
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleNextStep1 = (data: TemplateData) => {
    setTemplateData(data);
    setCurrentStep(2);
  };

  const handleNextStep2 = (text: string, pdfBase64: string | null) => {
    setCurrentCvText(text);
    setCurrentCvPdfBase64(pdfBase64);
    setCurrentStep(3);
  };

  const handleNextStep3 = (desc: string) => {
    setJobDescription(desc);
    setCurrentStep(4);
  };

  const handleNextStep4 = (res: GenerationResult) => {
    setResult(res);
    setCurrentStep(5);
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setTemplateData(null);
    setCurrentCvText("");
    setCurrentCvPdfBase64(null);
    setJobDescription("");
    setResult(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      handleRestart();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="text-zinc-400 text-sm font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-zinc-50 font-sans text-zinc-700 selection:bg-indigo-500 selection:text-white flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100 shrink-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleRestart}
          >
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
              CV Matcher
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center space-x-2">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center h-7 px-3 rounded-full text-xs font-semibold transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-500/20"
                          : isCompleted
                            ? "bg-indigo-100 text-indigo-700"
                            : "text-zinc-400"
                      }`}
                    >
                      {step.id}. {step.title}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-3 h-[1px] mx-1 transition-colors duration-300 ${
                          isCompleted ? "bg-indigo-300" : "bg-zinc-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="h-6 w-[1px] bg-zinc-200 hidden md:block" />

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Authenticated</span>
                <span className="text-xs font-semibold text-zinc-700 truncate max-w-[120px]">
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full">
              Step {currentStep} of 5
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 w-full overflow-y-auto flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full min-h-full flex flex-col justify-start items-center"
          >
            {currentStep === 1 && <Step1Template onNext={handleNextStep1} />}
            {currentStep === 2 && (
              <Step2CurrentCV onNext={handleNextStep2} onBack={handleBack} />
            )}
            {currentStep === 3 && (
              <Step3JobDescription
                onNext={handleNextStep3}
                onBack={handleBack}
              />
            )}
            {currentStep === 4 && templateData && (
              <Step4Review
                templateData={templateData}
                currentCvText={currentCvText}
                currentCvPdfBase64={currentCvPdfBase64}
                jobDescription={jobDescription}
                onNext={handleNextStep4}
                onBack={handleBack}
              />
            )}
            {currentStep === 5 && result && (
              <Step5Result result={result} onRestart={handleRestart} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
