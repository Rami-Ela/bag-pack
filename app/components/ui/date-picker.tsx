'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Sélectionnez une date',
  minDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(value) : undefined;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(format(selectedDate, 'yyyy-MM-dd'));
    }
    setOpen(false);
  };

  const minDateObj = minDate ? new Date(minDate) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left flex items-center gap-2 transition-colors">
        <CalendarIcon className="h-4 w-4 shrink-0 text-gray-500" />
        <span className="text-gray-700">{date ? format(date, 'PPP', { locale: fr }) : placeholder}</span>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          disabled={(date) => minDateObj ? date < minDateObj : false}
          locale={fr}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
