"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

interface IssueCountContextValue {
  count: number | null;
}

const IssueCountContext = createContext<IssueCountContextValue>({ count: null });

let issueCountRequest: Promise<number | null> | null = null;

async function fetchIssueCount() {
  if (!issueCountRequest) {
    issueCountRequest = fetch("/api/issues/count", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) =>
        data && typeof (data as { count?: number }).count === "number"
          ? (data as { count: number }).count
          : null,
      )
      .catch(() => null)
      .finally(() => {
        issueCountRequest = null;
      });
  }

  return issueCountRequest;
}

export function IssueCountProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadIssueCount() {
      const nextCount = await fetchIssueCount();
      if (active) setCount(nextCount);
    }

    void loadIssueCount();
    return () => {
      active = false;
    };
  }, [pathname]);

  return <IssueCountContext.Provider value={{ count }}>{children}</IssueCountContext.Provider>;
}

export function useIssueCount() {
  return useContext(IssueCountContext);
}
