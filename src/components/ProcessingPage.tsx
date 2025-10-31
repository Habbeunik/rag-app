'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

interface ProcessingPageProps {
  files: File[];
}

type ProcessingStage = 'extracting' | 'chunking' | 'embedding' | 'complete';

export default function ProcessingPage({ files }: ProcessingPageProps) {
  const [stage, setStage] = useState<ProcessingStage>('extracting');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stages: ProcessingStage[] = ['extracting', 'chunking', 'embedding', 'complete'];
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
      id: 'extracting' as ProcessingStage,
      label: 'Extracting text',
    },
    {
      id: 'chunking' as ProcessingStage,
      label: 'Analyzing content',
    },
    {
      id: 'embedding' as ProcessingStage,
      label: 'Creating embeddings',
    },
    {
      id: 'complete' as ProcessingStage,
      label: 'Complete',
    },
  ];

  const getCurrentStageIndex = () =>
    stages.findIndex((s) => s.id === stage);

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex items-center justify-end p-6">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <div className="text-center mb-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-muted-foreground" strokeWidth={1.5} />
            <h1 className="text-4xl font-bold mb-4 tracking-tight">
              Processing {files[0]?.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              This will take a moment
            </p>
          </div>

          <div className="space-y-3">
            {stages.map((stageInfo, index) => {
              const isActive = stageInfo.id === stage;
              const isComplete = index < getCurrentStageIndex();

              return (
                <div
                  key={stageInfo.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card transition-all"
                >
                  <span
                    className={cn(
                      'text-base transition-colors',
                      isActive || isComplete
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    {stageInfo.label}
                  </span>
                  <div className="flex items-center gap-3">
                    {isActive && (
                      <>
                        <span className="text-sm text-muted-foreground">
                          {progress}%
                        </span>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    )}
                    {isComplete && (
                      <span className="text-sm">✓</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {stage === 'extracting' && (
            <div className="mt-6 h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-foreground rounded-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
