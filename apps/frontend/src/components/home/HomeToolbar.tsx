"use client";
import Link from "next/link";
import Kbd from "@/components/ui/Kbd";

const START_ACTIONS = [
  { href: "/cases/new", key: "c", label: "New case", hint: "One client's ID documents → one filled form", primary: true },
  { href: "/batches/new", key: "b", label: "New batch", hint: "One Excel + each client's documents → many forms", primary: false },
  { href: "/forms/new", key: "f", label: "Add form", hint: "A new blank form → mapped for you", primary: false },
];

/** Top strip of Home: where you are, the privacy promise, and the three ways to start (each with a key; the keys work on every page, see AppSidebar). */
export default function HomeToolbar() {

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h1 className="text-[15px] font-semibold leading-tight">Overview</h1>
        <p className="text-[11px] text-muted">Every case and batch, newest first</p>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        {START_ACTIONS.map((action) => (
          <Link key={action.href} href={action.href} title={action.hint}
            className={`group inline-flex h-8 items-center gap-2 rounded-lg pl-3 pr-1.5 text-xs font-medium transition-[background-color,transform,box-shadow] duration-150 active:scale-[0.97] ${
              action.primary ? "bg-ink text-white shadow-sm hover:bg-black" : "border border-line bg-white text-ink hover:border-ink/30 hover:shadow-sm"}`}>
            <span className={action.primary ? "text-brand-500" : "text-muted group-hover:text-ink"} aria-hidden>+</span>
            {action.label}
            <Kbd onDark={action.primary}>{action.key.toUpperCase()}</Kbd>
          </Link>
        ))}
      </div>
    </div>
  );
}
