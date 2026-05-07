'use client';

import { useState } from 'react';

interface Props {
  onSubmit: (vars: { name: string; quantity: number }) => void;
  isPending: boolean;
}

export function AddItemForm({ onSubmit, isPending }: Props) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name, quantity });
    setName('');
    setQuantity(1);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add an item…"
        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
        required
      />
      <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-3 text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors text-lg leading-none"
        >
          −
        </button>
        <span className="w-8 text-center text-gray-900 font-medium select-none">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => q + 1)}
          className="px-3 py-3 text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors text-lg leading-none"
        >
          +
        </button>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-12 h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 text-white text-2xl font-medium rounded-xl transition-colors flex items-center justify-center"
      >
        +
      </button>
    </form>
  );
}
