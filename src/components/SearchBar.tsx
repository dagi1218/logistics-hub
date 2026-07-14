"use client";

import React from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function SearchBar() {
  // 1. Initialize our hooks
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // 2. The function that runs every time the user types a letter
  const handleSearch = (term: string) => {
    // URLSearchParams is a native Web API that safely formats query strings (like ?query=Bole)
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set("query", term); // If there is text, set the ?query= parameter
    } else {
      params.delete("query"); // If they delete the text, remove the parameter completely
    }

    // 3. Update the URL silently (replace avoids filling up the browser's back button history)
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative w-72">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {/* Search Icon SVG */}
        <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-zinc-200 rounded-lg leading-5 bg-zinc-50 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-colors"
        placeholder="Search customers or addresses..."
        onChange={(e) => handleSearch(e.target.value)}
        // defaultValue ensures the input stays populated if someone shares the URL with the query attached
        defaultValue={searchParams.get("query")?.toString()} 
      />
    </div>
  );
}