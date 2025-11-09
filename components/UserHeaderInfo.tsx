'use client';

import { useSession } from 'next-auth/react';

export default function UserHeaderInfo() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? 'Guest';
  // Read role via a safe cast to avoid TS complaining if augmentation isn't picked up
  const roleVal = (session?.user as unknown as { role?: string })?.role;
  const userRole = typeof roleVal === 'string' ? roleVal : 'guest';

  return (
    <div className="flex items-center space-x-2">
      <span>{userName}</span>
      {userRole === 'admin' && (
        <span className="px-2 py-1 bg-purple-600 text-white rounded-md text-xs">
          Super Admin
        </span>
      )}
    </div>
  );
}
