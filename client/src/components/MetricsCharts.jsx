import React, { useState } from 'react';
import { Cpu, HardDrive } from 'lucide-react';

const SvgAreaChart = ({ data, dataKey, color, unit, height = 200 }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-500 font-mono">
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

        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="3 3" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1e293b" strokeDasharray="3 3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1e293b" />

        {/* Area fill */}
        <path d={areaD} fill={`url(#gradient-${dataKey})`} />

        {/* Line stroke */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Interactive Data Dots */}
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

      {/* Tooltip Overlay */}
      {hoveredPoint && (
        <div 
          className="absolute z-20 bg-slate-900 border border-slate-700/90 text-xs font-mono p-2 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: '35%' }}
        >
          <div className="text-slate-400 text-[10px]">{hoveredPoint.label}</div>
          <div className="font-bold text-white mt-0.5">
            {hoveredPoint.value} {unit}
          </div>
        </div>
      )}
    </div>
  );
};

export const MetricsCharts = ({ metrics = [] }) => {
  const formattedData = metrics.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    cpu: item.cpuUsage,
    memory: item.memoryUsageMb
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* CPU Usage Chart */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">CPU Usage Trend</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Last 30 Telemetry Snapshots (%)</span>
        </div>

        <SvgAreaChart data={formattedData} dataKey="cpu" color="#06b6d4" unit="%" />
      </div>

      {/* Memory Usage Chart */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Memory Allocation</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">MB Used</span>
        </div>

        <SvgAreaChart data={formattedData} dataKey="memory" color="#a855f7" unit="MB" />
      </div>

    </div>
  );
};
