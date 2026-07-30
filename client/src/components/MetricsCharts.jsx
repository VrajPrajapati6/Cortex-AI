import React, { useState } from 'react';
import { Cpu, HardDrive } from 'lucide-react';

const SvgAreaChart = ({ data, dataKey, color, unit, height = 200 }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-gray-400 font-mono">
        Waiting for telemetry snapshots...
      </div>
    );
  }

  const values = data.map((d) => d[dataKey] || 0);
  const maxVal = Math.max(...values, 10);
  const minVal = 0;
  
  const width = 600;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = height - padding - ((d[dataKey] - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, value: d[dataKey], label: d.time };
  });

  const pathD = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="relative w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e5e7eb" strokeDasharray="3 3" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#e5e7eb" strokeDasharray="3 3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />

        <path d={areaD} fill={`url(#gradient-${dataKey})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={hoveredPoint?.index === idx ? '5' : '3'}
            fill={color}
            className="cursor-pointer transition-all duration-150"
            onMouseEnter={() => setHoveredPoint({ ...p, index: idx })}
            onMouseLeave={() => setHoveredPoint(null)}
          />
        ))}
      </svg>

      {hoveredPoint && (
        <div 
          className="absolute z-20 bg-slate-900 text-white text-xs font-mono p-2 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: '35%' }}
        >
          <div className="text-gray-400 text-[10px]">{hoveredPoint.label}</div>
          <div className="font-bold mt-0.5">
            {hoveredPoint.value} {unit}
          </div>
        </div>
      )}
    </div>
  );
};

export const MetricsCharts = ({ metrics = [] }) => {
  const chartData = [...metrics].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map((m) => {
    const d = new Date(m.timestamp);
    return {
      time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`,
      cpu: Number(m.cpu_usage || m.cpuUsage || 0),
      mem: Number(m.memory_usage_mb || m.memoryUsageMb || 0)
    };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            CPU Usage (%)
          </h3>
        </div>
        <SvgAreaChart data={chartData} dataKey="cpu" color="#10b981" unit="%" />
      </div>

      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600" />
            Memory Usage (MB)
          </h3>
        </div>
        <SvgAreaChart data={chartData} dataKey="mem" color="#3b82f6" unit="MB" />
      </div>
    </div>
  );
};
