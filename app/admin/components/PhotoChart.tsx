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
import { TrendingUp } from "lucide-react";

export default function PhotoChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/photo-graphs")
      .then((res) => res.json())
      .then((res) => setData(res.data.photo));
  }, []);

  return (
    <div className="bg-white border border-gray-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Photo Analytics</h3>
          <p className="text-sm text-gray-500 mt-1">Total photo uploads over time</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <TrendingUp className="w-4 h-4 text-blue-600" />
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="colorPhoto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
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
              stroke="#4f46e5" 
              strokeWidth={2.5}
              dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#4f46e5' }}
              fill="url(#colorPhoto)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
