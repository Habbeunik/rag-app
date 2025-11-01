"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface ProcessingPageProps {
  files: File[];
}

type ProcessingStage = "extracting" | "chunking" | "embedding" | "complete";

export default function ProcessingPage({ files }: ProcessingPageProps) {
  const [stage, setStage] = useState<ProcessingStage>("extracting");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stages: ProcessingStage[] = [
      "extracting",
      "chunking",
      "embedding",
      "complete",
    ];
    let currentStageIndex = 0;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          currentStageIndex++;
          if (currentStageIndex < stages.length) {
            setStage(stages[currentStageIndex]);
            return 0;
          }
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const stages = [
    {
      id: "extracting" as ProcessingStage,
      label: "Extracting text from PDF",
      icon: "📄",
    },
    {
      id: "chunking" as ProcessingStage,
      label: "Analyzing document structure",
      icon: "📊",
    },
    {
      id: "embedding" as ProcessingStage,
      label: "Creating AI embeddings",
      icon: "🧠",
    },
    {
      id: "complete" as ProcessingStage,
      label: "Ready to chat!",
      icon: "✨",
    },
  ];

  const getCurrentStageIndex = () => stages.findIndex((s) => s.id === stage);

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
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 mb-6">
              <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Processing Document
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              {files[0]?.name}
            </p>
          </div>

          {/* Progress Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700 p-8">
            <div className="space-y-4">
              {stages.map((stageInfo, index) => {
                const isActive = stageInfo.id === stage;
                const isComplete = index < getCurrentStageIndex();

                return (
                  <div
                    key={stageInfo.id}
                    className={`
                      flex items-center justify-between p-5 rounded-xl transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800"
                          : isComplete
                          ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800"
                          : "bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`
                          text-3xl transition-transform
                          ${isActive ? "scale-110 animate-pulse" : ""}
                        `}
                      >
                        {stageInfo.icon}
                      </div>
                      <span
                        className={`
                          text-base font-medium transition-colors
                          ${
                            isActive || isComplete
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-500 dark:text-slate-400"
                          }
                        `}
                      >
                        {stageInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {isActive && (
                        <>
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300 min-w-[3ch] text-right">
                            {progress}%
                          </span>
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                        </>
                      )}
                      {isComplete && (
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Overall Progress
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(
                    ((getCurrentStageIndex() + progress / 100) /
                      stages.length) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${
                      ((getCurrentStageIndex() + progress / 100) /
                        stages.length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Info Message */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              This usually takes 10-30 seconds depending on document size
            </p>
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
