"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { AlertCircle, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";

type ResourceAccessGateProps = {
  isConfigured: boolean;
};

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-[#101726] px-4 py-3 text-sm text-[#eef4ff] placeholder:text-[#6f8096] transition focus:border-[#567398] focus:outline-none focus:ring-4 focus:ring-[#567398]/20";

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
      <div className="mx-auto w-full max-w-xl rounded-[30px] border border-[#7b3a3a]/35 bg-[#1b1218]/90 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-9">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#7b3a3a]/40 bg-[#2c171f] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#ffc8d0]">
          <AlertCircle size={14} />
          Configuration Required
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white">
          Resource library is not ready yet
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#d7b3ba]">
          Set `INTERNAL_RESOURCES_PASSWORD` on the Next.js app before using this page.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-[30px] border border-white/10 bg-[#101826]/92 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-9">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#223046] bg-[#121c2c] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#8fa3be]">
        <ShieldCheck size={14} />
        Internal Access
      </div>

      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white">
        Unlock the resource library
      </h1>
      <p className="mt-3 text-sm leading-7 text-[#92a2b8]">
        Enter the shared team password to open company resources, SOPs, guides,
        proposal formats, and strategy documents.
      </p>

      {errorMessage && (
        <div className="mt-6 rounded-2xl border border-[#5f2631] bg-[#25141a] px-4 py-3 text-sm text-[#f0b4bf]">
          {errorMessage}
        </div>
      )}

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label
            htmlFor="resource-password"
            className="block text-sm font-medium text-[#d8deea]"
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
            <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-[#7e90a9]">
              <KeyRound size={18} />
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending || isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#8ea2bf] px-4 py-3 text-sm font-semibold text-[#0d1522] transition hover:bg-[#a5b7d0] disabled:cursor-not-allowed disabled:bg-[#627389] disabled:text-[#ced6df]"
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
