'use client';

import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  [key: string]: unknown;
}

interface ChartRendererProps {
  type?: 'pie' | 'bar';
  data?: ChartData[];
  category?: 'technology' | 'health' | 'finance' | 'default';
}

const COLORS = {
  technology: ['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'],
  health: ['#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4'],
  finance: ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
  default: ['#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1'],
};

export function ChartRenderer({ type = 'pie', data = [], category = 'default' }: ChartRendererProps) {
  if (!data || data.length === 0) return null;

  const palette = COLORS[category] || COLORS.default;

  const renderCustomTooltip = (props: unknown) => {
    const { active, payload, label } = props as {
      active?: boolean;
      payload?: readonly { name?: unknown; value?: unknown; color?: unknown }[];
      label?: string;
    };
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100">
          <p className="text-sm font-bold text-slate-800">{String(payload[0].name || label)}</p>
          <p className="text-lg font-black" style={{ color: String(payload[0].color || palette[0]) }}>
            {String(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (type === 'pie') {
    return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip content={renderCustomTooltip} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
            <Tooltip content={renderCustomTooltip} cursor={{ fill: '#F1F5F9' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}
