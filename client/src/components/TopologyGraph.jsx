import React, { useState, useEffect } from 'react';

const fixedPositions = {
  'User Service': { x: 100, y: 150 },
  'Order Service': { x: 300, y: 150 },
  'Payment Service': { x: 500, y: 150 },
  'Redis': { x: 750, y: 50 },
  'PostgreSQL': { x: 750, y: 250 },
};

const getStatusColor = (status) => {
  if (status === 'CRITICAL') return '#f43f5e'; // rose-500
  if (status === 'DEGRADED') return '#f59e0b'; // amber-500
  return '#10b981'; // emerald-500
};

export const TopologyGraph = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopology = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/health/topology');
      if (res.ok) {
        const data = await res.json();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      }
    } catch (err) {
      console.error('Error fetching topology:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopology();
    const interval = setInterval(fetchTopology, 5000); // 5s fast refresh for active propagation
    return () => clearInterval(interval);
  }, []);

  if (loading && nodes.length === 0) {
    return (
      <div className="bg-[#0f1219] border border-gray-800 rounded-xl p-5 mb-6 h-80 flex items-center justify-center text-gray-500 animate-pulse">
        Initializing Dynamic Topology...
      </div>
    );
  }

  return (
    <div className="bg-[#0f1219] border border-gray-800 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white tracking-wide">Live Service Dependency Graph</h2>
        <div className="flex items-center space-x-4 text-xs text-gray-400">
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> Healthy</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span> Degraded</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1"></span> Critical</div>
          <div className="flex items-center"><span className="w-4 h-1 rounded-full bg-rose-500 mr-1"></span> Active Failure Edge</div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg width="900" height="350" className="mx-auto block" style={{ background: 'transparent' }}>
          
          <defs>
            <marker id="arrow-normal" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#374151" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
            </marker>
          </defs>

          {edges.map((edge, idx) => {
            const sourcePos = fixedPositions[edge.source];
            const targetPos = fixedPositions[edge.target];
            const sourceExists = nodes.some(n => n.service_name === edge.source);
            const targetExists = nodes.some(n => n.service_name === edge.target);
            
            if (!sourcePos || !targetPos || !sourceExists || !targetExists) return null;

            const isActive = edge.activePropagationCount > 0;
            const strokeColor = isActive ? '#f43f5e' : '#374151'; // rose-500 vs gray-700
            // Limit stroke width so the arrow marker doesn't scale out of control
            const strokeWidth = isActive ? Math.min(4, 2 + edge.activePropagationCount * 0.2) : 2;
            const marker = isActive ? "url(#arrow-active)" : "url(#arrow-normal)";

            return (
              <g key={`edge-${idx}`}>
                <path
                  d={`M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  markerEnd={marker}
                  className={isActive ? 'animate-pulse transition-all duration-300' : 'transition-all duration-300'}
                />
                {isActive && (
                  <text 
                    x={(sourcePos.x + targetPos.x) / 2} 
                    y={(sourcePos.y + targetPos.y) / 2 - 10} 
                    fill="#f43f5e" 
                    fontSize="12" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    {edge.activePropagationCount} errors
                  </text>
                )}
              </g>
            );
          })}

          {nodes.map((node) => {
            const pos = fixedPositions[node.service_name];
            if (!pos) return null;
            
            const color = getStatusColor(node.health_status);
            const isCritical = node.health_status === 'CRITICAL';
            
            return (
              <g key={node.service_name} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle
                  r={22}
                  fill="#111827"
                  stroke={color}
                  strokeWidth={isCritical ? 4 : 2}
                  className={isCritical ? 'animate-pulse transition-colors duration-500' : 'transition-colors duration-500'}
                />
                {isCritical && (
                  <circle r={28} fill="none" stroke={color} strokeWidth="1" className="animate-ping opacity-75" />
                )}
                
                <text
                  y="40"
                  textAnchor="middle"
                  fill="#e5e7eb"
                  fontSize="13"
                  fontWeight="600"
                >
                  {node.service_name}
                </text>
                
                <text
                  y="55"
                  textAnchor="middle"
                  fill={node.availability < 99 ? '#f87171' : '#9ca3af'}
                  fontSize="11"
                  fontWeight="400"
                >
                  {node.availability}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default TopologyGraph;
