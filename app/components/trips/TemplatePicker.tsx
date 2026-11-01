"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Template } from "@/app/types/trips";

interface Props {
  templates: Template[];
  value: string | null;
  onChange: (value: string | null) => void;
}

// Selecting the active template again clears it, which creates an empty trip.
export function TemplatePicker({ templates, value, onChange }: Props) {
  const t = useTranslations("templatePicker");

  if (templates.length === 0) {
    return (
      <Link
        href="/templates"
        className="block text-xs text-blue-600 hover:underline pl-1"
      >
        {t("empty")}
      </Link>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {templates.map((template) => (
        <button
          key={template.id}
          type="button"
          onClick={() => onChange(value === template.id ? null : template.id)}
          className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg border text-xs font-medium transition-colors ${
            value === template.id
              ? "bg-blue-50 border-blue-400 text-blue-700"
              : "bg-white border-gray-200 text-gray-500"
          }`}
        >
          <span className="text-lg leading-none">{template.emoji}</span>
          <span className="w-full truncate text-center">{template.name}</span>
        </button>
      ))}
    </div>
  );
}
