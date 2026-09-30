import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
        <FileQuestion className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
      <p className="text-slate-500 text-xs leading-relaxed">
        The page you are looking for may have been moved, renamed, or no longer exists.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md inline-flex items-center gap-2 transition"
      >
        <Home className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>
    </div>
  );
}
