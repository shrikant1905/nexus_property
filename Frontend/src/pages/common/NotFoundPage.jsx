import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
        <AlertCircle size={32} />
      </div>
      <h1 className="text-3xl font-extrabold text-white">404 - Page Not Found</h1>
      <p className="text-slate-400 text-sm mt-2 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/login"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#009bf2] text-white font-medium text-sm hover:bg-[#0082cb] transition-colors"
      >
        <ArrowLeft size={16} /> Back to Login
      </Link>
    </div>
  );
}
