import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const MetricsCharts = ({ metrics = [] }) => {
  // Sort chronologically so it flows right to left naturally
  const chartData = [...metrics].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map(m => {
    const d = new Date(m.timestamp);
    return {
      time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`,
      cpu: Number(m.cpu_usage || m.cpuUsage || 0),
      mem: Number(m.memory_usage_mb || m.memoryUsageMb || 0)
    };
  });

  if (chartData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-72 flex flex-col">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">CPU Usage (%)</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 500 }} 
                tickMargin={10} 
                minTickGap={20} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fill: '#9ca3af', fontSize: 11 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '6px', fontSize: '12px', color: '#fff' }}
                itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="linear" 
                dataKey="cpu" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorCpu)" 
                strokeWidth={2} 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm h-72 flex flex-col">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Memory Usage (MB)</h3>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 500 }} 
                tickMargin={10} 
                minTickGap={20} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                domain={['auto', 'auto']}
                tick={{ fill: '#9ca3af', fontSize: 11 }} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '6px', fontSize: '12px', color: '#fff' }}
                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="linear" 
                dataKey="mem" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorMem)" 
                strokeWidth={2} 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
