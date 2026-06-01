'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Category, Trip } from '@/app/types/trips';
import { useTripMutations } from '@/app/hooks/useTripMutations';
import { TripSidebar } from '@/app/components/trips/TripSidebar';
import { TripDetail } from '@/app/components/trips/TripDetail';

export default function Home() {
  const t = useTranslations('page');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const { data: trips = [] } = useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: () => fetch('/api/trips').then((r) => r.json()),
    select: (data) => data.map((t) => ({ ...t, items: t.items ?? [] })),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  });

  const {
    createTripMutation,
    addItemMutation,
    togglePackedMutation,
    toggleBroughtBackMutation,
    deleteTripMutation,
    deleteItemMutation,
    updateQuantityMutation,
  } = useTripMutations(setSelectedTrip, selectedTrip?.id);

  const currentTrip = trips.find((t) => t.id === selectedTrip?.id) ?? selectedTrip;

  return (
    <div className="h-dvh bg-gray-100 flex overflow-hidden">
      <aside
        className={`
          w-full md:w-80 md:flex md:flex-col md:border-r md:border-gray-200 bg-white shrink-0
          ${selectedTrip ? 'hidden md:flex' : 'flex flex-col'}
        `}
      >
        <TripSidebar
          trips={trips}
          selectedTripId={selectedTrip?.id}
          onSelectTrip={setSelectedTrip}
          onCreateTrip={(vars) => createTripMutation.mutate(vars)}
          createTripPending={createTripMutation.isPending}
          onDeleteTrip={(trip) => deleteTripMutation.mutate(trip)}
        />
      </aside>

      <main
        className={`flex-1 flex flex-col overflow-hidden ${selectedTrip ? 'flex' : 'hidden md:flex'}`}
      >
        {currentTrip ? (
          <TripDetail
            trip={currentTrip}
            categories={categories}
            onBack={() => setSelectedTrip(null)}
            onAddItem={({ name, quantity, categoryId }) =>
              addItemMutation.mutate({ tripId: currentTrip.id, name, quantity, categoryId })
            }
            addItemPending={addItemMutation.isPending}
            onTogglePacked={(item) => togglePackedMutation.mutate({ tripId: currentTrip.id, item })}
            onToggleBroughtBack={(item) =>
              toggleBroughtBackMutation.mutate({ tripId: currentTrip.id, item })
            }
            onDeleteItem={(item) => deleteItemMutation.mutate({ tripId: currentTrip.id, item })}
            onUpdateQuantity={(item, quantity) =>
              updateQuantityMutation.mutate({ tripId: currentTrip.id, item, quantity })
            }
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>{t('emptyState')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
