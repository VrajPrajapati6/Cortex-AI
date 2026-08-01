import { useState, useEffect } from 'react';
import axios from 'axios';

const ServiceHealthMap = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/health/services');
      setServices(response.data);
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

  if (loading && services.length === 0) {
    return <div className="text-gray-400 p-4 border border-gray-800 rounded-lg animate-pulse">Loading Service Map...</div>;
  }

  if (error) {
    return <div className="text-red-400 p-4 border border-red-900/30 rounded-lg bg-red-900/10">{error}</div>;
  }

  return (
    <div className="bg-[#0f1219] border border-gray-800 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white tracking-wide">Live Service Map</h2>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span> Healthy</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span> Degraded</div>
          <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1"></span> Critical</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map(svc => {
          let statusColor = 'bg-emerald-500';
          let borderColor = 'border-emerald-500/20';
          let bgColor = 'bg-emerald-500/5';
          
          if (svc.health_status === 'CRITICAL') {
            statusColor = 'bg-rose-500 animate-pulse';
            borderColor = 'border-rose-500/30';
            bgColor = 'bg-rose-500/10';
          } else if (svc.health_status === 'DEGRADED') {
            statusColor = 'bg-amber-500';
            borderColor = 'border-amber-500/30';
            bgColor = 'bg-amber-500/10';
          }

          return (
            <div key={svc.service_name} className={`rounded-lg border p-4 flex flex-col transition-all duration-300 ${borderColor} ${bgColor}`}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-gray-200 font-medium">{svc.service_name}</span>
                <span className={`w-3 h-3 rounded-full shadow-lg ${statusColor}`}></span>
              </div>
              
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div className="text-gray-500">Availability</div>
                <div className={`text-right font-mono ${svc.availability < 99 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {svc.availability}%
                </div>
                
                <div className="text-gray-500">Error Rate</div>
                <div className="text-right text-gray-300 font-mono">
                  {svc.error_rate.toFixed(1)}%
                </div>
                
                <div className="text-gray-500">P95 Latency</div>
                <div className="text-right text-gray-300 font-mono">
                  {svc.p95_latency.toFixed(0)}ms
                </div>

                <div className="text-gray-500">Baseline</div>
                <div className="text-right text-gray-500 font-mono">
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
