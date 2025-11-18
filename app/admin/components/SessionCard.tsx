// components/SessionCard.tsx
import React from 'react';

type Props = {
  sessionId: string;
  createdAt: string;
};

export default function SessionCard({ sessionId, createdAt }: Props) {
  return (
    <div className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm truncate">Session: {sessionId}</h3>
          <p className="text-xs text-gray-500 mt-1">{new Date(createdAt).toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  );
}
