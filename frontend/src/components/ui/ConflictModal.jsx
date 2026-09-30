import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';

export default function ConflictModal() {
  const { conflictModal, closeConflictModal, resolveConflictAndAdd } = useCart();
  const { showSuccess, showError } = useToast();

  if (!conflictModal.isOpen) return null;

  const handleClearAndAdd = async () => {
    try {
      const res = await resolveConflictAndAdd();
      if (res?.success) {
        showSuccess('Previous cart cleared and new service added!');
      }
    } catch (err) {
      showError(err.message || 'Failed to update cart');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-slide-up">
        <button
          onClick={closeConflictModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-amber-600 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Different Merchant Service</h3>
            <p className="text-xs text-slate-500">Single Provider Cart Guard</p>
          </div>
        </div>

        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          Your cart currently contains services from <strong className="text-slate-900">{conflictModal.existingMerchantName}</strong>. ServiceHub orders are processed per individual service provider.
        </p>

        <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-xs text-amber-800 mb-6 flex items-start gap-2">
          <Trash2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>Adding this item will clear your existing cart items.</span>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={closeConflictModal}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleClearAndAdd}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
          >
            Clear Cart & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
