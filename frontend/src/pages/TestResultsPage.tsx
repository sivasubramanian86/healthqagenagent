import React from 'react';

const rows = [
  { id: '1', type: 'Patient', status: 'Pass', date: '2025-09-01' },
  { id: '2', type: 'Observation', status: 'Fail', date: '2025-09-02' }
];

export default function TestResultsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Test Results</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Resource Type</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.id}</td>
                <td className="p-2">{r.type}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
