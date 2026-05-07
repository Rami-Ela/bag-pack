'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Item, Trip, TripType } from '@/app/types/trips';

const TRIPS_KEY = ['trips'] as const;

export type CreateTripVars = {
  name: string;
  destination: string | null;
  tripType: TripType;
  startDate: string | null;
  endDate: string | null;
};

export function useTripMutations(
  setSelectedTrip: (trip: Trip | null) => void,
  selectedTripId: string | null | undefined,
) {
  const queryClient = useQueryClient();

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

  const createTripMutation = useMutation({
    mutationFn: (vars: CreateTripVars) =>
      fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars),
      }).then((r) => r.json()),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: TRIPS_KEY });
      const prev = queryClient.getQueryData<Trip[]>(TRIPS_KEY);
      const tempId = `temp-${Date.now()}`;
      const tempTrip: Trip = { id: tempId, ...vars, items: [] };
      queryClient.setQueryData<Trip[]>(TRIPS_KEY, (old = []) => [tempTrip, ...old]);
      setSelectedTrip(tempTrip);
      return { prev, tempId };
    },
    onSuccess: (trip, _vars, ctx) => {
      queryClient.setQueryData<Trip[]>(TRIPS_KEY, (old = []) =>
        old.map((t) => (t.id === ctx?.tempId ? trip : t))
      );
      setSelectedTrip(trip);
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(TRIPS_KEY, ctx?.prev);
      setSelectedTrip(null);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: TRIPS_KEY }),
  });

  const addItemMutation = useMutation({
    mutationFn: (vars: { tripId: string; name: string; quantity: number }) =>
      fetch(`/api/trips/${vars.tripId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: vars.name, quantity: vars.quantity }),
      }).then((r) => r.json()),
    ...optimistic(TRIPS_KEY, (trips, vars) =>
      trips.map((t) =>
        t.id === vars.tripId
          ? {
              ...t,
              items: [
                ...t.items,
                { id: `temp-${Date.now()}`, name: vars.name, quantity: vars.quantity, packed: false, broughtBack: false },
              ],
            }
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
    ...optimistic(TRIPS_KEY, (trips, { tripId, item }) =>
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
    ...optimistic(TRIPS_KEY, (trips, { tripId, item }) =>
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
      TRIPS_KEY,
      (trips, trip) => trips.filter((t) => t.id !== trip.id),
      (trip) => { if (selectedTripId === trip.id) setSelectedTrip(null); },
    ),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (vars: { tripId: string; item: Item }) =>
      fetch(`/api/trips/${vars.tripId}/items/${vars.item.id}`, { method: 'DELETE' }),
    ...optimistic(TRIPS_KEY, (trips, { tripId, item }) =>
      trips.map((t) =>
        t.id === tripId ? { ...t, items: t.items.filter((i) => i.id !== item.id) } : t
      )
    ),
  });

  return {
    createTripMutation,
    addItemMutation,
    togglePackedMutation,
    toggleBroughtBackMutation,
    deleteTripMutation,
    deleteItemMutation,
  };
}
