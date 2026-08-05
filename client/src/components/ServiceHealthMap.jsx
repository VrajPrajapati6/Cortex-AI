import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api.config';

const ServiceHealthMap = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health/services`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setServices(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching service health:', err);
      setError('Failed to load service health map.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (services.length === 0) {
    return (
      <div className="bg-[#0f1219] border border-gray-800 rounded-xl p-5 mb-6 h-40 flex items-center justify-center text-gray-400 font-mono text-xs">
        {loading ? "Loading Service Map..." : "Waiting for initial telemetry... (may take up to 60s)"}
      </div>
    );
  }

  if (error) {
    return <div className="text-rose-400 p-4 border border-rose-900/30 rounded-lg bg-rose-900/10 text-xs font-mono">{error}</div>;
  }

  return (
    <div className="bg-[#0f1219] border border-gray-800 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white tracking-wide">Live Service Map</h2>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-sm shadow-emerald-500/50"></span> 
            <span className="text-gray-200 font-medium">Healthy</span>
          </div>
          <div className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 shadow-sm shadow-amber-500/50"></span> 
            <span className="text-gray-200 font-medium">Degraded</span>
          </div>
          <div className="flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2 shadow-sm shadow-rose-500/50"></span> 
            <span className="text-gray-200 font-medium">Critical</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map(svc => {
          let statusColor = 'bg-emerald-500';
          let borderColor = 'border-emerald-500/30';
          let bgColor = 'bg-emerald-500/5';
          let statusText = 'HEALTHY';
          let textColor = 'text-emerald-400';
          
          if (svc.health_status === 'CRITICAL') {
            statusColor = 'bg-rose-500 animate-pulse';
            borderColor = 'border-rose-500/40';
            bgColor = 'bg-rose-500/10';
            statusText = 'CRITICAL';
            textColor = 'text-rose-400';
          } else if (svc.health_status === 'DEGRADED') {
            statusColor = 'bg-amber-500';
            borderColor = 'border-amber-500/40';
            bgColor = 'bg-amber-500/10';
            statusText = 'DEGRADED';
            textColor = 'text-amber-400';
          }

          return (
            <div key={svc.service_name} className={`rounded-lg border p-4 flex flex-col transition-all duration-300 ${borderColor} ${bgColor}`}>
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-semibold text-sm tracking-tight">{svc.service_name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold tracking-wider ${textColor}`}>
                    {statusText}
                  </span>
                  <span className={`w-3 h-3 rounded-full shadow-lg ${statusColor}`}></span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div className="text-gray-400">Availability</div>
                <div className={`text-right font-mono font-medium ${svc.availability < 99 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                  {svc.availability}%
                </div>
                
                <div className="text-gray-400">Error Rate</div>
                <div className="text-right text-gray-200 font-mono font-medium">
                  {svc.error_rate.toFixed(1)}%
                </div>
                
                <div className="text-gray-400">P95 Latency</div>
                <div className="text-right text-gray-200 font-mono font-medium">
                  {svc.p95_latency.toFixed(0)}ms
                </div>

                <div className="text-gray-400">Baseline</div>
                <div className="text-right text-gray-400 font-mono">
                  {svc.baseline_p95}ms
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceHealthMap;
