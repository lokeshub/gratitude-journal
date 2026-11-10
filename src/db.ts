import { openDB } from 'idb';

export type GratitudeEntry = {
  id: string;
  title: string;
  description: string;
  image?: string;
  memoryDate: string;
  createdAt: string;
  updatedAt: string;
};

const dbPromise = openDB('gratitude-journal', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('entries')) {
      db.createObjectStore('entries', { keyPath: 'id' });
    }
  }
});

export async function getEntries(): Promise<GratitudeEntry[]> {
  const db = await dbPromise;
  return (await db.getAll('entries')).sort((a, b) =>
    b.memoryDate.localeCompare(a.memoryDate) || b.createdAt.localeCompare(a.createdAt)
  );
}
export async function saveEntry(entry: GratitudeEntry) {
  const db = await dbPromise;
  await db.put('entries', entry);
}
export async function removeEntry(id: string) {
  const db = await dbPromise;
  await db.delete('entries', id);
}