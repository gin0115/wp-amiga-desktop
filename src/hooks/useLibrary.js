import { useQuery } from '@tanstack/react-query';

const MANIFEST_URL = './library/manifest.json';

async function fetchManifest() {
  const res = await fetch(MANIFEST_URL);
  if (!res.ok) {
    if (res.status === 404) return { version: 1, items: [] };
    throw new Error(`Library manifest fetch failed: ${res.status}`);
  }
  return res.json();
}

export function useLibrary() {
  return useQuery({
    queryKey: ['library', 'manifest'],
    queryFn: fetchManifest,
    staleTime: Infinity,
    retry: false,
  });
}
