"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Film } from "lucide-react";

export default function StripPhotoChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/photo-graphs")
      .then((res) => res.json())
      .then((res) => setData(res.data.stripPhotoOriginal));
  }, []);

  return (
    <div className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Strip Photo Original</h3>
          <p className="text-sm text-gray-500 mt-1">Original strip photos</p>
        </div>
        <div className="p-2 bg-purple-50 rounded-lg">
          <Film className="w-4 h-4 text-purple-600" />
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="colorStrip" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9333ea" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              stroke="#e5e7eb"
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              stroke="#e5e7eb"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#9333ea" 
              strokeWidth={2.5}
              dot={{ fill: '#9333ea', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#9333ea' }}
              fill="url(#colorStrip)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
