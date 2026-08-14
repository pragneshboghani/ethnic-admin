"use client";

import AuthorActions from "@/actions/AuthorActions";
import AuthorForm from "@/components/author/AuthorForm";
import { AuthorInitialData } from "@/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const AuthorUpdatePage = () => {
  const params = useParams();
  const id = Number(params.id);

  const [author, setAuthor] = useState<AuthorInitialData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAuthor = async () => {
      try {
        setLoading(true);
        const res = await AuthorActions.getAuthorById(id);
        if (res?.success === false) {
          setErrorMessage(res.message || "You are not allowed to update this user");
          setAuthor(null);
          return;
        }

        setAuthor(res?.data || res);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getAuthor();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-[var(--text-muted)]">Loading author details...</p>
      </div>
    );
  }

  if (errorMessage || !author) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-6">
        <p className="text-sm text-[var(--text-muted)]">
          {errorMessage || "User not found"}
        </p>
      </div>
    );
  }

  return <AuthorForm mode="update" initialData={author} />;
};

export default AuthorUpdatePage;
