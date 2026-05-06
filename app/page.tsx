'use client';

import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

interface Item {
  id: string;
  name: string;
  quantity: number;
  packed: boolean;
  broughtBack: boolean;
}

interface Trip {
  id: string;
  name: string;
  destination: string | null;
  items: Item[];
}

export default function Home() {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [newTripName, setNewTripName] = useState('');
  const [newTripDestination, setNewTripDestination] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [tab, setTab] = useState<'packing' | 'return'>('packing');
  const queryClient = useQueryClient();

  const { data: trips = [] } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: () => fetch('/api/trips').then((r) => r.json()),
  });

  const currentTrip = trips.find((t) => t.id === selectedTrip?.id) ?? selectedTrip;

  // ─── Optimistic helper ────────────────────────────────────────────────────
  // Returns { onMutate, onError, onSettled } with snapshot/rollback/invalidate
  // wired up. `updater` describes how the cache changes; optional `before` runs
  // inside onMutate before the cache write (e.g. to sync local state).

  function optimistic<V>(
    queryKey: readonly unknown[],
    updater: (trips: Trip[], vars: V) => Trip[],
    before?: (vars: V) => void,
  ) {
    return {
      onMutate: async (vars: V) => {
        await queryClient.cancelQueries({ queryKey });
        const prev = queryClient.getQueryData<Trip[]>(queryKey);
        before?.(vars);
        queryClient.setQueryData<Trip[]>(queryKey, (old = []) => updater(old, vars));
        return { prev };
      },
      onError: (_e: unknown, _v: V, ctx?: { prev?: Trip[] }) => {
        queryClient.setQueryData(queryKey, ctx?.prev);
      },
      onSettled: () => queryClient.invalidateQueries({ queryKey }),
    };
  }

  // ─── Mutations ────────────────────────────────────────────────────────────

  // createTrip is the one exception: it needs a tempId swap in onSuccess.
  const createTripMutation = useMutation({
    mutationFn: (vars: { name: string; destination: string | null }) =>
      fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars),
      }).then((r) => r.json()),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ['trips'] });
      const prev = queryClient.getQueryData<Trip[]>(['trips']);
      const tempId = `temp-${Date.now()}`;
      const tempTrip: Trip = { id: tempId, ...vars, items: [] };
      queryClient.setQueryData<Trip[]>(['trips'], (old = []) => [tempTrip, ...old]);
      setSelectedTrip(tempTrip);
      return { prev, tempId };
    },
    onSuccess: (trip, _vars, ctx) => {
      queryClient.setQueryData<Trip[]>(['trips'], (old = []) =>
        old.map((t) => (t.id === ctx?.tempId ? trip : t))
      );
      setSelectedTrip(trip);
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(['trips'], ctx?.prev);
      setSelectedTrip(null);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  });

  const addItemMutation = useMutation({
    mutationFn: (vars: { tripId: string; name: string; quantity: number }) =>
      fetch(`/api/trips/${vars.tripId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: vars.name, quantity: vars.quantity }),
      }).then((r) => r.json()),
    ...optimistic(['trips'], (trips, vars) =>
      trips.map((t) =>
        t.id === vars.tripId
          ? { ...t, items: [...t.items, { id: `temp-${Date.now()}`, name: vars.name, quantity: vars.quantity, packed: false, broughtBack: false }] }
          : t
      )
    ),
  });

  const togglePackedMutation = useMutation({
    mutationFn: (vars: { tripId: string; item: Item }) =>
      fetch(`/api/trips/${vars.tripId}/items/${vars.item.id}/packed`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packed: !vars.item.packed }),
      }),
    ...optimistic(['trips'], (trips, { tripId, item }) =>
      trips.map((t) =>
        t.id === tripId
          ? { ...t, items: t.items.map((i) => (i.id === item.id ? { ...i, packed: !i.packed } : i)) }
          : t
      )
    ),
  });

  const toggleBroughtBackMutation = useMutation({
    mutationFn: (vars: { tripId: string; item: Item }) =>
      fetch(`/api/trips/${vars.tripId}/items/${vars.item.id}/brought-back`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ broughtBack: !vars.item.broughtBack }),
      }),
    ...optimistic(['trips'], (trips, { tripId, item }) =>
      trips.map((t) =>
        t.id === tripId
          ? { ...t, items: t.items.map((i) => (i.id === item.id ? { ...i, broughtBack: !i.broughtBack } : i)) }
          : t
      )
    ),
  });

  const deleteTripMutation = useMutation({
    mutationFn: (trip: Trip) => fetch(`/api/trips/${trip.id}`, { method: 'DELETE' }),
    ...optimistic(
      ['trips'],
      (trips, trip) => trips.filter((t) => t.id !== trip.id),
      (trip) => { if (selectedTrip?.id === trip.id) setSelectedTrip(null); },
    ),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (vars: { tripId: string; item: Item }) =>
      fetch(`/api/trips/${vars.tripId}/items/${vars.item.id}`, { method: 'DELETE' }),
    ...optimistic(['trips'], (trips, { tripId, item }) =>
      trips.map((t) =>
        t.id === tripId ? { ...t, items: t.items.filter((i) => i.id !== item.id) } : t
      )
    ),
  });

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const createTrip = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTripName.trim()) return;
    createTripMutation.mutate(
      { name: newTripName, destination: newTripDestination || null },
      { onSuccess: () => { setNewTripName(''); setNewTripDestination(''); } }
    );
  };

  const addItem = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedTrip || !newItemName.trim()) return;
    addItemMutation.mutate(
      { tripId: selectedTrip.id, name: newItemName, quantity: newItemQuantity },
      { onSuccess: () => { setNewItemName(''); setNewItemQuantity(1); } }
    );
  };

  const togglePacked = (item: Item) => {
    if (!selectedTrip) return;
    togglePackedMutation.mutate({ tripId: selectedTrip.id, item });
  };

  const toggleBroughtBack = (item: Item) => {
    if (!selectedTrip) return;
    toggleBroughtBackMutation.mutate({ tripId: selectedTrip.id, item });
  };

  const deleteTrip = (trip: Trip) => deleteTripMutation.mutate(trip);

  const deleteItem = (item: Item) => {
    if (!selectedTrip) return;
    deleteItemMutation.mutate({ tripId: selectedTrip.id, item });
  };

  // ─── Trip list view ───────────────────────────────────────────────────────

  const TripList = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-900 mb-4">🎒 Bag Pack</h1>
        <form onSubmit={createTrip} className="space-y-2">
          <input
            type="text"
            value={newTripName}
            onChange={(e) => setNewTripName(e.target.value)}
            placeholder="Trip name"
            className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
            required
          />
          <input
            type="text"
            value={newTripDestination}
            onChange={(e) => setNewTripDestination(e.target.value)}
            placeholder="Destination (optional)"
            className="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={createTripMutation.isPending}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
          >
            + New Trip
          </button>
        </form>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 bg-gray-50">
        {trips.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-8">No trips yet</p>
        )}
        {trips.map((trip) => (
          <div
            key={trip.id}
            className={`flex items-center gap-1 rounded-xl mb-2 border transition-colors ${
              selectedTrip?.id === trip.id
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200'
            }`}
          >
            <button
              onClick={() => setSelectedTrip(trip)}
              className="flex-1 text-left px-4 py-4"
            >
              <p className={`font-semibold text-base ${selectedTrip?.id === trip.id ? 'text-blue-700' : 'text-gray-800'}`}>
                {trip.name}
              </p>
              {trip.destination && (
                <p className="text-sm text-gray-400 mt-0.5">📍 {trip.destination}</p>
              )}
              <p className="text-sm text-gray-400 mt-0.5">{trip.items.length} items</p>
            </button>
            <button
              onClick={() => deleteTrip(trip)}
              className="px-4 py-4 text-gray-300 hover:text-red-500 active:text-red-600 transition-colors text-lg"
            >
              ✕
            </button>
          </div>
        ))}
      </nav>
    </div>
  );

  // ─── Trip detail view ─────────────────────────────────────────────────────

  const CheckIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 12 10" fill="none">
      <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const TripDetail = currentTrip && (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setSelectedTrip(null)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-lg"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{currentTrip.name}</h2>
            {currentTrip.destination && (
              <p className="text-sm text-gray-500">📍 {currentTrip.destination}</p>
            )}
          </div>
        </div>
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('packing')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'packing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            🧳 Packing
          </button>
          <button
            onClick={() => setTab('return')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === 'return' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            🏠 Return
          </button>
        </div>
      </div>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-2">
        {currentTrip.items.length === 0 ? (
          <p className="text-center text-gray-400 mt-16 text-sm">No items yet. Add one below!</p>
        ) : tab === 'return' && currentTrip.items.every((i) => !i.packed) ? (
          <p className="text-center text-gray-400 mt-16 text-sm">No packed items yet.</p>
        ) : (
          (tab === 'return' ? currentTrip.items.filter((i) => i.packed) : currentTrip.items).map((item) => {
            const checked = tab === 'packing' ? item.packed : item.broughtBack;
            const toggle = tab === 'packing' ? togglePacked : toggleBroughtBack;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-white px-4 py-4 rounded-xl border border-gray-200"
              >
                <button
                  onClick={() => toggle(item)}
                  className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${
                    checked
                      ? tab === 'packing'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-blue-500 border-blue-500 text-white'
                      : 'border-gray-300'
                  }`}
                >
                  {checked && <CheckIcon />}
                </button>
                <span className={`flex-1 font-medium transition-colors ${
                  checked ? 'text-gray-300 line-through' : 'text-gray-900'
                }`}>
                  {item.name}
                  {item.quantity > 1 && (
                    <span className="ml-2 text-sm font-normal" style={{ textDecoration: 'none' }}>× {item.quantity}</span>
                  )}
                </span>
                {tab === 'packing' && (
                  <button
                    onClick={() => deleteItem(item)}
                    className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 active:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add item form — only on packing tab */}
      {tab === 'packing' && (
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={addItem} className="flex gap-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add an item…"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500"
              required
            />
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setNewItemQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-3 text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors text-lg leading-none"
              >
                −
              </button>
              <span className="w-8 text-center text-gray-900 font-medium select-none">
                {newItemQuantity}
              </span>
              <button
                type="button"
                onClick={() => setNewItemQuantity((q) => q + 1)}
                className="px-3 py-3 text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors text-lg leading-none"
              >
                +
              </button>
            </div>
            <button
              type="submit"
              disabled={addItemMutation.isPending}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 text-white text-2xl font-medium rounded-xl transition-colors flex items-center justify-center"
            >
              +
            </button>
          </form>
        </div>
      )}
    </div>
  );

  // ─── Layout ───────────────────────────────────────────────────────────────

  return (
    <div className="h-dvh bg-gray-100 flex overflow-hidden">
      {/* Sidebar — always visible on desktop, hidden on mobile when a trip is selected */}
      <aside
        className={`
          w-full md:w-80 md:flex md:flex-col md:border-r md:border-gray-200 bg-white flex-shrink-0
          ${selectedTrip ? 'hidden md:flex' : 'flex flex-col'}
        `}
      >
        {TripList}
      </aside>

      {/* Main — always visible on desktop, shown on mobile only when a trip is selected */}
      <main
        className={`
          flex-1 flex flex-col overflow-hidden
          ${selectedTrip ? 'flex' : 'hidden md:flex'}
        `}
      >
        {TripDetail ?? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a trip or create a new one</p>
          </div>
        )}
      </main>
    </div>
  );
}
