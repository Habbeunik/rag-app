import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

export default class ErrorBoundary extends Component<
	Props,
	State
> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(
		error: Error
	): State {
		return { hasError: true, error };
	}

	public componentDidCatch(
		error: Error,
		errorInfo: ErrorInfo
	) {
		console.error(
			'ErrorBoundary caught an error:',
			error,
			errorInfo
		);
	}

	private handleRetry = () => {
		this.setState({ hasError: false, error: undefined });
	};

	private handleGoHome = () => {
		window.location.reload();
	};

	public render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="h-full flex items-center justify-center bg-[#0d1117] p-4">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						className="max-w-md w-full glass-card text-center">
						<div className="p-6">
							<motion.div
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{
									delay: 0.2,
									type: 'spring',
									stiffness: 200,
								}}
								className="w-16 h-16 bg-[#ff5f56]/20 rounded-full flex items-center justify-center mx-auto mb-4">
								<AlertCircle
									className="text-[#ff5f56]"
									size={32}
								/>
							</motion.div>

							<h2 className="text-xl font-semibold text-[#e6edf3] mb-2">
								Something went wrong
							</h2>

							<p className="text-sm text-[#7d8590] mb-6 leading-relaxed">
								We encountered an unexpected error. This
								might be a temporary issue.
							</p>

							{this.state.error && (
								<details className="mb-6 text-left">
									<summary className="text-xs text-[#7d8590] cursor-pointer hover:text-[#e6edf3] transition-colors">
										Error details
									</summary>
									<pre className="mt-2 p-3 bg-[#0d1117] rounded text-xs text-[#ff5f56] overflow-auto">
										{this.state.error.message}
									</pre>
								</details>
							)}

							<div className="flex gap-3 justify-center">
								<motion.button
									onClick={this.handleRetry}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="btn-primary flex items-center gap-2">
									<RefreshCw size={16} />
									Try Again
								</motion.button>

								<motion.button
									onClick={this.handleGoHome}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="btn-secondary flex items-center gap-2">
									<Home size={16} />
									Go Home
								</motion.button>
							</div>
						</div>
					</motion.div>
				</div>
			);
		}

		return this.props.children;
	}
}
