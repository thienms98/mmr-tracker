"use client";

import { useState } from "react";

interface Props {
  onSelectAccountId: (accountId: string) => void;
}

interface SearchResult {
  account_id: number;
  personaname: string;
  avatarfull: string;
}

export default function SearchBar({ onSelectAccountId }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  async function handleSearch(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    // Nếu gõ toàn số thì coi như đang nhập account ID trực tiếp, không cần search
    if (/^\d+$/.test(value.trim())) {
      setResults([]);
      return;
    }
    const res = await fetch(`/api/players/search?q=${encodeURIComponent(value)}`);
    if (res.ok) {
      setResults(await res.json());
    }
  }

  return (
    <div className="relative">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Nhập Steam ID / Account ID hoặc tên..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && /^\d+$/.test(query.trim())) {
            onSelectAccountId(query.trim());
          }
        }}
      />

      {results.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded mt-1 shadow">
          {results.map((r) => (
            <li
              key={r.account_id}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              onClick={() => {
                setQuery(r.personaname);
                setResults([]);
                onSelectAccountId(String(r.account_id));
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={r.avatarfull} alt="" className="w-6 h-6 rounded" />
              {r.personaname}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
