"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/controls/field";
import { Trash } from "lucide-react";

export interface RepoItem {
  name: string;
  desc: string;
  lang: string;
  stars: string;
  forks: string;
}

export function RepoEditor({
  items,
  onChange,
  max = 3,
}: {
  items: RepoItem[];
  onChange: (items: RepoItem[]) => void;
  max?: number;
}) {
  const set = (i: number, key: keyof RepoItem, v: string) =>
    onChange(items.map((it, j) => (j === i ? { ...it, [key]: v } : it)));
  const add = () => {
    if (items.length < max) onChange([...items, { name: "", desc: "", lang: "", stars: "", forks: "" }]);
  };
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));

  return (
    <div className="grid gap-3">
      {items.map((it, i) => (
        <div key={i} className="grid gap-2 rounded-md border p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{i + 1}</span>
            <Button variant="ghost" size="icon-sm" onClick={() => remove(i)} aria-label={`Remove repo ${i + 1}`}>
              <Trash className="size-4" />
            </Button>
          </div>
          <Field label="Repo">
            <Input value={it.name} onChange={(e) => set(i, "name", e.target.value)} placeholder="owner/repo" />
          </Field>
          <Field label="Description">
            <Input value={it.desc} onChange={(e) => set(i, "desc", e.target.value)} placeholder="Short description" />
          </Field>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Lang">
              <Input value={it.lang} onChange={(e) => set(i, "lang", e.target.value)} placeholder="—" />
            </Field>
            <Field label="Stars">
              <Input value={it.stars} onChange={(e) => set(i, "stars", e.target.value)} placeholder="0" />
            </Field>
            <Field label="Forks">
              <Input value={it.forks} onChange={(e) => set(i, "forks", e.target.value)} placeholder="0" />
            </Field>
          </div>
        </div>
      ))}
      {items.length < max && (
        <Button variant="outline" size="sm" onClick={add}>
          Add repo
        </Button>
      )}
    </div>
  );
}