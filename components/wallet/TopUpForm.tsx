"use client";

import { useState } from "react";

interface TopUpFormProps {
  clubId: string;
  action: (formData: FormData) => Promise<{ success: boolean; error?: string; url?: string }>;
}

export default function TopUpForm({ clubId, action }: TopUpFormProps) {
  const [amount, setAmount] = useState(50);

  return (
    <form action={action} className="space-y-6">
      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-bold text-gray-400 mb-2"
        >
          Bedrag
        </label>
        <div className="relative rounded-xl shadow-sm group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-gray-400 sm:text-lg font-bold group-focus-within:text-blue-400 transition-colors">€</span>
          </div>
          <input
            type="number"
            name="amount"
            id="amount"
            className="block w-full pl-10 pr-12 py-4 sm:text-lg bg-white/5 border-none rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-bold"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="5"
            step="5"
            required
          />
          <input type="hidden" name="clubId" value={clubId} />
        </div>

        {/* Quick Amounts */}
        <div className="flex gap-2 mt-3">
          {[20, 50, 100].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className="flex-1 py-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/50 text-sm font-bold text-gray-300 hover:text-blue-400 transition-all"
            >
              +€{val}
            </button>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 px-4 rounded-xl font-bold shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:scale-[1.02] transition-all duration-200"
      >
        Wallet opwaarderen
      </button>
    </form>
  );
}
