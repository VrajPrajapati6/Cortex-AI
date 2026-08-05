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
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((d, i) => {
    const x = paddingLeft + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = height - paddingBottom - ((d[dataKey] - minVal) / (maxVal - minVal)) * chartHeight;
    return { x, y, value: d[dataKey], label: d.time };
  });

  const pathD = points.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="relative w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="#334155" strokeDasharray="3 3" />
        <line x1={paddingLeft} y1={paddingTop + chartHeight / 2} x2={width - paddingRight} y2={paddingTop + chartHeight / 2} stroke="#334155" strokeDasharray="3 3" />
        <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="#334155" />

        {/* Y-axis Labels */}
        <text x={paddingLeft - 5} y={paddingTop + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
          {Math.round(maxVal)}
        </text>
        <text x={paddingLeft - 5} y={paddingTop + chartHeight / 2 + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
          {Math.round((maxVal + minVal) / 2)}
        </text>
        <text x={paddingLeft - 5} y={height - paddingBottom + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
          {minVal}
        </text>

        {/* X-axis Labels */}
        {data.length > 0 && (
          <>
            <text x={paddingLeft} y={height - 10} textAnchor="start" className="text-[10px] fill-slate-400 font-mono">
              {data[0].time}
            </text>
            <text x={paddingLeft + chartWidth / 2} y={height - 10} textAnchor="middle" className="text-[10px] fill-slate-400 font-mono">
              {data[Math.floor(data.length / 2)].time}
            </text>
            <text x={width - paddingRight} y={height - 10} textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
              {data[data.length - 1].time}
            </text>
          </>
        )}

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
          className="absolute z-20 bg-slate-950 border border-slate-700 text-white text-xs font-mono p-2 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: '35%' }}
        >
          <div className="text-slate-400 text-[10px]">{hoveredPoint.label}</div>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <div className="bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-800 shadow-md flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            CPU Usage (%)
          </h3>
        </div>
        <SvgAreaChart data={chartData} dataKey="cpu" color="#10b981" unit="%" />
      </div>

      <div className="bg-slate-900 p-4 sm:p-5 rounded-xl border border-slate-800 shadow-md flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-400" />
            Memory Usage (MB)
          </h3>
        </div>
        <SvgAreaChart data={chartData} dataKey="mem" color="#3b82f6" unit="MB" />
      </div>
    </div>
  );
};
