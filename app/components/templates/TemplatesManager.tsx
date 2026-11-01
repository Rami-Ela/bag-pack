"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Category, Template } from "@/app/types/trips";
import { fetchJson } from "@/lib/fetch-json";
import { TemplateEditor, TemplateDraft } from "./TemplateEditor";

const TEMPLATES_KEY = ["templates"] as const;

async function sendJson(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${url} failed with ${res.status}`);
}

export function TemplatesManager() {
  const t = useTranslations("templates");
  const queryClient = useQueryClient();
  // null: list view; 'new': creating; Template: editing that template.
  const [editing, setEditing] = useState<Template | "new" | null>(null);

  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: TEMPLATES_KEY,
    queryFn: () => fetchJson<Template[]>("/api/templates"),
  });
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetchJson<Category[]>("/api/categories"),
  });

  const onDone = () => {
    queryClient.invalidateQueries({ queryKey: TEMPLATES_KEY });
    setEditing(null);
  };

  const saveMutation = useMutation({
    mutationFn: (draft: TemplateDraft) =>
      editing && editing !== "new"
        ? sendJson(`/api/templates/${editing.id}`, "PUT", draft)
        : sendJson("/api/templates", "POST", draft),
    onSuccess: onDone,
  });

  const deleteMutation = useMutation({
    mutationFn: (template: Template) =>
      sendJson(`/api/templates/${template.id}`, "DELETE"),
    onSuccess: onDone,
  });

  if (editing) {
    return (
      <TemplateEditor
        key={editing === "new" ? "new" : editing.id}
        initial={editing === "new" ? null : editing}
        categories={categories}
        isSaving={saveMutation.isPending}
        hasError={saveMutation.isError || deleteMutation.isError}
        onSave={(draft) => saveMutation.mutate(draft)}
        onCancel={() => {
          saveMutation.reset();
          setEditing(null);
        }}
        onDelete={
          editing === "new"
            ? undefined
            : () => {
                if (
                  window.confirm(t("confirmDelete", { name: editing.name }))
                ) {
                  deleteMutation.mutate(editing);
                }
              }
        }
      />
    );
  }

  return (
    <div className="min-h-dvh bg-gray-100 p-4">
      <div className="max-w-xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{t("title")}</h1>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            {t("back")}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setEditing("new")}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {t("create")}
        </button>

        {!isLoading && templates.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-8">{t("empty")}</p>
        )}

        <ul className="space-y-2">
          {templates.map((template) => (
            <li key={template.id}>
              <button
                type="button"
                onClick={() => setEditing(template)}
                className="w-full flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm text-left hover:bg-gray-50"
              >
                <span className="text-2xl leading-none">{template.emoji}</span>
                <span className="flex-1 font-medium text-gray-900 truncate">
                  {template.name}
                </span>
                <span className="text-sm text-gray-400">
                  {t("itemCount", { count: template.items.length })}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
