"use client";
import { useEffect, useState } from 'react';

/**
 * Temporary test page to confirm Supabase connection.
 * Fetches users from the Supabase database and displays them.
 * Delete this file after confirming your connection works.
 */
export default function SupabaseTest() {
  const [users, setUsers] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setUsers(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Error fetching users');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1>Supabase Connection Test</h1>
      <p>This page fetches users from your Supabase database.</p>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && (
        <pre style={{ background: '#f4f4f4', padding: 16, borderRadius: 8 }}>
          {JSON.stringify(users, null, 2)}
        </pre>
      )}
      <p style={{ marginTop: 24, color: '#888' }}>
        (You can delete <code>app/supabase-test/page.tsx</code> after testing.)
      </p>
    </div>
  );
}
