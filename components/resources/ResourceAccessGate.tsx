"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { AlertCircle, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";

type ResourceAccessGateProps = {
  isConfigured: boolean;
};

const inputClassName =
  "w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-selected)] px-4 py-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-faint)] transition focus:border-[#c4d0de] focus:outline-none focus:ring-4 focus:ring-[#c4d0de]/20";

const ResourceAccessGate = ({ isConfigured }: ResourceAccessGateProps) => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/resources/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setErrorMessage(result.message || "Unable to unlock the resource library.");
        return;
      }

      setPassword("");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setErrorMessage("Unable to unlock the resource library.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-[30px] border border-[#e2c1c1]/35 bg-[var(--status-purple-bg)]/90 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-9">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e2c1c1]/40 bg-[var(--status-purple-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8e0b1e]">
          <AlertCircle size={14} />
          Configuration Required
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--text-strong)]">
          Resource library is not ready yet
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#6f2a37]">
          Set `INTERNAL_RESOURCES_PASSWORD` on the Next.js app before using this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-[30px] border border-[var(--border)] bg-[var(--bg-inset)]/92 p-7 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-9">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#c1cee1] bg-[var(--bg-selected)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#2a476f]">
        <ShieldCheck size={14} />
        Internal Access
      </div>

      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-[var(--text-strong)]">
        Unlock the resource library
      </h1>
      <p className="mt-3 text-sm leading-7 text-[#2a476f]">
        Enter the shared team password to open company resources, SOPs, guides,
        proposal formats, and strategy documents.
      </p>

      {errorMessage && (
        <div className="mt-6 rounded-2xl border border-[#e5bdc5] bg-[var(--status-purple-bg)] px-4 py-3 text-sm text-[#7f1a2c]">
          {errorMessage}
        </div>
      )}

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="resource-password"
            className="block text-sm font-medium text-[#2a416f]"
          >
            Shared Password
          </label>
          <div className="relative">
            <input
              id="resource-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your team password"
              autoComplete="current-password"
              required
              className={`${inputClassName} pr-12`}
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-[#2a476f]">
              <KeyRound size={18} />
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--bg-selected)] px-4 py-3 text-sm font-semibold text-[#2a446f] transition hover:bg-[var(--bg-selected)] disabled:cursor-not-allowed disabled:bg-[var(--bg-selected)] disabled:text-[#2a4a6f]"
        >
          {isPending || isSubmitting ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Unlocking...
            </>
          ) : (
            "Unlock Resources"
          )}
        </button>
      </form>
    </div>
  );
};

export default ResourceAccessGate;
