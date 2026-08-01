import React, { useState, useEffect } from 'react';
import { X, Clock, Server, AlertCircle } from 'lucide-react';

export const TraceExplorerModal = ({ requestId, onClose }) => {
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/traces/${requestId}`)
      .then(res => res.json())
      .then(data => {
        setTraceData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch trace", err);
        setLoading(false);
      });
  }, [requestId]);

  if (!requestId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Distributed Trace Explorer
            </h2>
            <p className="text-sm text-gray-500 font-mono mt-1">Request: {requestId}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-gray-500">Loading trace data...</div>
          ) : !traceData?.flat_spans?.length ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
              No trace data found for this request.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <WaterfallChart spans={traceData.flat_spans} roots={traceData.trace_tree} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WaterfallChart = ({ spans, roots }) => {
  // Find global min and max times to establish the scale
  const minTime = Math.min(...spans.map(s => s.start_time));
  const maxTime = Math.max(...spans.map(s => s.end_time));
  const totalDuration = maxTime - minTime;

  // Flatten the tree into an array with depth information for rendering
  const flattenedTree = [];
  const flatten = (node, depth) => {
    flattenedTree.push({ ...node, depth });
    if (node.children) {
      node.children.forEach(child => flatten(child, depth + 1));
    }
  };
  roots.forEach(root => flatten(root, 0));

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        <div className="col-span-4 pl-2">Service / Endpoint</div>
        <div className="col-span-8 relative">
          Timeline ({totalDuration.toFixed(0)}ms)
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"></div>
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300"></div>
        </div>
      </div>

      {/* Spans */}
      <div className="divide-y divide-gray-100">
        {flattenedTree.map((span, idx) => {
          const leftPercent = totalDuration > 0 ? ((span.start_time - minTime) / totalDuration) * 100 : 0;
          const widthPercent = totalDuration > 0 ? (span.response_time_ms / totalDuration) * 100 : 100;
          
          const isError = span.level === 'ERROR' || span.status_code >= 500;
          const barColor = isError ? 'bg-rose-500' : 'bg-indigo-500';
          const bgColor = isError ? 'bg-rose-50/30' : 'hover:bg-gray-50';

          return (
            <div key={span.id || idx} className={`grid grid-cols-12 gap-4 px-4 py-3 items-center ${bgColor} transition-colors group`}>
              
              {/* Service Info */}
              <div className="col-span-4 flex items-start gap-2" style={{ paddingLeft: `${span.depth * 20}px` }}>
                <Server className={`w-4 h-4 mt-0.5 ${isError ? 'text-rose-500' : 'text-gray-400'}`} />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-900 truncate" title={span.service_name}>
                    {span.service_name}
                  </span>
                  <span className="text-xs text-gray-500 font-mono truncate" title={span.endpoint}>
                    {span.endpoint}
                  </span>
                </div>
              </div>

              {/* Waterfall Timeline */}
              <div className="col-span-8 relative h-8 flex items-center">
                <div className="relative w-[calc(100%-50px)] h-full flex items-center">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-px h-full bg-gray-400"></div>
                    ))}
                  </div>

                  {/* Duration Bar */}
                  <div 
                    className={`absolute h-4 rounded-sm ${barColor} shadow-sm group-hover:brightness-110 transition-all`}
                    style={{ 
                      left: `${Math.max(0, leftPercent)}%`, 
                      width: `${Math.max(0.5, widthPercent)}%`, // min-width 0.5% so very fast spans are visible
                    }}
                  />
                  
                  {/* Duration Label */}
                  <div 
                    className="absolute text-[10px] font-mono text-gray-600 font-semibold ml-2 whitespace-nowrap"
                    style={{ left: `${Math.min(100, leftPercent + widthPercent)}%` }}
                  >
                    {span.response_time_ms.toFixed(0)}ms
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
