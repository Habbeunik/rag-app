'use client';

import { motion } from 'framer-motion';
import {
	FileText,
	Loader2,
	CheckCircle2,
	Zap,
	Database,
	Brain,
	MessageSquare,
	Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProcessingPageProps {
	files: File[];
}

type ProcessingStage =
	| 'extracting'
	| 'chunking'
	| 'embedding'
	| 'complete';

export default function ProcessingPage({
	files,
}: ProcessingPageProps) {
	const [stage, setStage] =
		useState<ProcessingStage>('extracting');
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		// Simulate processing stages
		const stages: ProcessingStage[] = [
			'extracting',
			'chunking',
			'embedding',
			'complete',
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
			id: 'extracting',
			label: 'Extracting Text',
			desc: 'Reading PDF content and extracting text',
			icon: FileText,
			color: 'from-[#1f6feb] to-[#0969da]',
		},
		{
			id: 'chunking',
			label: 'Chunking Data',
			desc: 'Breaking content into semantic segments',
			icon: Database,
			color: 'from-[#a5d6ff] to-[#1f6feb]',
		},
		{
			id: 'embedding',
			label: 'Creating Embeddings',
			desc: 'Generating vector representations',
			icon: Brain,
			color: 'from-[#d2a8ff] to-[#a5d6ff]',
		},
		{
			id: 'complete',
			label: 'Ready to Chat',
			desc: 'Processing complete, ready for questions',
			icon: MessageSquare,
			color: 'from-[#ffa657] to-[#d2a8ff]',
		},
	];

	const getCurrentStageIndex = () =>
		stages.findIndex((s) => s.id === stage);

	return (
		<div className="h-full flex flex-col bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]">
			{/* Main Content */}
			<div className="flex-1 p-4 overflow-y-auto">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-center mb-8">
						<div className="flex items-center justify-center gap-4 mb-4">
							<motion.div
								animate={{ rotate: 360 }}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: 'linear',
								}}
								className="p-3 bg-gradient-to-br from-[#1f6feb] to-[#0969da] rounded-xl shadow-lg">
								<Zap className="text-white" size={24} />
							</motion.div>
							<h1 className="text-3xl font-bold bg-gradient-to-r from-[#e6edf3] to-[#a5d6ff] bg-clip-text text-transparent">
								Processing Documents
							</h1>
						</div>
						<p className="text-base text-[#7d8590] max-w-2xl mx-auto leading-relaxed">
							We&apos;re analyzing your documents and
							preparing them for intelligent conversation.
							This usually takes just a few moments.
						</p>
					</motion.div>

					{/* Files List */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="glass-card mb-6 p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-gradient-to-br from-[#1f6feb] to-[#0969da] rounded-lg">
								<FileText
									className="text-white"
									size={18}
								/>
							</div>
							<h3 className="text-lg font-bold text-[#e6edf3]">
								Processing Files ({files.length})
							</h3>
						</div>
						<div className="space-y-3">
							{files.map((file, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{
										duration: 0.4,
										delay: index * 0.1,
									}}
									className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#0d1117] to-[#161b22] rounded-xl border border-[#21262d] hover:border-[#27ca3f]/40 transition-all duration-300">
									<div className="p-2 bg-gradient-to-br from-[#1f6feb]/20 to-[#0969da]/20 rounded-lg">
										<FileText
											className="text-[#1f6feb]"
											size={16}
										/>
									</div>
									<span className="text-sm font-semibold text-[#e6edf3] flex-1">
										{file.name}
									</span>
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{
											duration: 0.3,
											delay: 0.5 + index * 0.1,
										}}>
										<CheckCircle2
											className="text-[#27ca3f]"
											size={16}
										/>
									</motion.div>
								</motion.div>
							))}
						</div>
					</motion.div>

					{/* Processing Stages */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						className="glass-card p-6">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 bg-gradient-to-br from-[#d2a8ff] to-[#a5d6ff] rounded-lg">
								<Sparkles
									className="text-white"
									size={18}
								/>
							</div>
							<h3 className="text-lg font-bold text-[#e6edf3]">
								Processing Pipeline
							</h3>
						</div>

						<div className="space-y-4">
							{stages.map((stageInfo, index) => {
								const isActive = stageInfo.id === stage;
								const isComplete =
									index < getCurrentStageIndex();
								const IconComponent = stageInfo.icon;

								return (
									<motion.div
										key={stageInfo.id}
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{
											duration: 0.4,
											delay: index * 0.1,
										}}
										className={`
											p-4 rounded-xl border transition-all duration-500 relative overflow-hidden
											${
												isActive
													? 'bg-gradient-to-r from-[#1f6feb]/10 to-[#0969da]/5 border-[#1f6feb]/40 shadow-lg scale-105'
													: isComplete
													? 'bg-gradient-to-r from-[#27ca3f]/10 to-[#27ca3f]/5 border-[#27ca3f]/40'
													: 'bg-gradient-to-r from-[#0d1117] to-[#161b22] border-[#21262d] hover:border-[#30363d]'
											}
										`}>
										{/* Animated background for active stage */}
										{isActive && (
											<div className="absolute inset-0 bg-gradient-to-r from-[#1f6feb]/5 to-[#0969da]/5 animate-pulse"></div>
										)}

										<div className="flex items-center gap-4 relative z-10">
											<motion.div
												animate={
													isActive
														? { scale: [1, 1.1, 1] }
														: { scale: 1 }
												}
												transition={{
													duration: 2,
													repeat: isActive ? Infinity : 0,
												}}
												className={`
													w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg
													${
														isComplete
															? 'bg-gradient-to-br from-[#27ca3f] to-[#1a7f37]'
															: isActive
															? `bg-gradient-to-br ${stageInfo.color}`
															: 'bg-gradient-to-br from-[#21262d] to-[#30363d]'
													}
												`}>
												{isComplete ? (
													<motion.div
														initial={{ scale: 0 }}
														animate={{ scale: 1 }}
														transition={{ duration: 0.3 }}>
														<CheckCircle2
															className="text-white"
															size={20}
														/>
													</motion.div>
												) : isActive ? (
													<motion.div
														animate={{ rotate: 360 }}
														transition={{
															duration: 2,
															repeat: Infinity,
															ease: 'linear',
														}}>
														<Loader2
															className="text-white"
															size={20}
														/>
													</motion.div>
												) : (
													<IconComponent
														className="text-[#7d8590]"
														size={20}
													/>
												)}
											</motion.div>

											<div className="flex-1">
												<div className="flex items-center gap-3 mb-2">
													<p
														className={`font-bold text-base ${
															isActive
																? 'text-[#1f6feb]'
																: isComplete
																? 'text-[#27ca3f]'
																: 'text-[#7d8590]'
														}`}>
														{stageInfo.label}
													</p>
													{isActive && (
														<motion.span
															initial={{ scale: 0 }}
															animate={{ scale: 1 }}
															className="text-sm font-bold text-[#1f6feb] bg-gradient-to-r from-[#1f6feb]/20 to-[#0969da]/20 px-3 py-1 rounded-full border border-[#1f6feb]/30">
															{progress}%
														</motion.span>
													)}
												</div>
												<p className="text-sm text-[#7d8590] leading-relaxed">
													{stageInfo.desc}
												</p>
											</div>
										</div>

										{isActive && (
											<motion.div
												initial={{ width: 0 }}
												animate={{ width: `${progress}%` }}
												transition={{
													duration: 0.5,
													ease: 'easeOut',
												}}
												className={`h-2 bg-gradient-to-r ${stageInfo.color} rounded-full mt-4 shadow-lg`}
											/>
										)}
									</motion.div>
								);
							})}
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
