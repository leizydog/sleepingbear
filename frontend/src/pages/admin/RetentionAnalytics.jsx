import React, { useState, useEffect } from 'react';
import { mlAPI } from '../../services/api';
import Icon from '../../components/atoms/Icon';
import DataTable from '../../components/organisms/DataTable';

const RetentionAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [atRiskTenants, setAtRiskTenants] = useState([]);
  const [allPredictions, setAllPredictions] = useState([]);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState(null);
  const [riskThreshold, setRiskThreshold] = useState(70);

  useEffect(() => {
    loadData();
  }, [selectedRiskLevel, riskThreshold]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, atRiskRes, predictionsRes] = await Promise.all([
        mlAPI.getRetentionStats(),
        mlAPI.getAtRiskTenants(riskThreshold),
        mlAPI.predictAll(selectedRiskLevel)
      ]);

      setStats(statsRes);
      setAtRiskTenants(atRiskRes.at_risk_tenants || []);
      setAllPredictions(predictionsRes.predictions || []);
    } catch (error) {
      console.error('Failed to load retention data:', error);
    } finally {
      setLoading(false);
    }
  };

  const RiskPill = ({ level }) => {
    const colors = {
      High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[level] || colors.Low}`}>
        {level}
      </span>
    );
  };

  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">{title}</p>
          <p className={`text-4xl font-extrabold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color.replace('text-', 'bg-').replace('700', '100')} dark:opacity-80`}>
          <Icon name={icon} size={24} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-bold">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Retention Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">AI-powered tenant retention predictions</p>
        </div>
        <button 
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
        >
          <Icon name="RefreshCw" size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon="Users" 
          title="Total Tenants" 
          value={stats?.total_tenants || 0}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard 
          icon="AlertTriangle" 
          title="At Risk" 
          value={stats?.risk_distribution?.high_risk?.count || 0}
          subtitle={`${stats?.risk_distribution?.high_risk?.percentage || 0}% of total`}
          color="text-red-600 dark:text-red-400"
        />
        <StatCard 
          icon="TrendingUp" 
          title="Will Retain" 
          value={stats?.predicted_to_retain || 0}
          subtitle={`${((stats?.predicted_to_retain / stats?.total_tenants) * 100 || 0).toFixed(1)}% retention rate`}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard 
          icon="Activity" 
          title="Avg Risk Score" 
          value={stats?.averages?.risk_score || 0}
          subtitle="Out of 100"
          color="text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Risk Distribution */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Risk Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          {['high_risk', 'medium_risk', 'low_risk'].map((risk) => {
            const data = stats?.risk_distribution?.[risk];
            const label = risk.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            const colors = {
              high_risk: 'bg-red-500',
              medium_risk: 'bg-yellow-500',
              low_risk: 'bg-green-500'
            };
            
            return (
              <div key={risk} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className={`h-3 rounded-full ${colors[risk]} mb-3`} style={{ width: `${data?.percentage || 0}%` }}></div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.count || 0}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">{label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{data?.percentage || 0}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex gap-4 items-center">
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Filter:</span>
        {[null, 'High', 'Medium', 'Low'].map(level => (
          <button
            key={level || 'all'}
            onClick={() => setSelectedRiskLevel(level)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              selectedRiskLevel === level 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {level || 'All'}
          </button>
        ))}
        
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Risk Threshold:</label>
          <input 
            type="number" 
            value={riskThreshold}
            onChange={(e) => setRiskThreshold(parseInt(e.target.value))}
            min="0" 
            max="100"
            className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* At-Risk Tenants Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            At-Risk Tenants (Score ≥ {riskThreshold})
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {atRiskTenants.length} tenants require immediate attention
          </p>
        </div>
        
        <DataTable 
          data={atRiskTenants}
          columns={[
            { 
              header: 'Tenant', 
              render: (r) => (
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{r.full_name || r.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.email}</p>
                </div>
              ),
              className: 'p-4'
            },
            { 
              header: 'Risk Score', 
              render: (r) => (
                <div className="text-center">
                  <div className="inline-block">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{r.risk_score}</div>
                    <div className="text-xs text-gray-500">/ 100</div>
                  </div>
                </div>
              ),
              className: 'p-4 text-center'
            },
            { 
              header: 'Risk Level', 
              render: (r) => <RiskPill level={r.risk_level} />,
              className: 'p-4 text-center'
            },
            { 
              header: 'Churn Probability', 
              render: (r) => (
                <div className="text-center">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {(r.churn_probability * 100).toFixed(1)}%
                  </span>
                </div>
              ),
              className: 'p-4 text-center'
            },
            { 
              header: 'Recommendation', 
              accessor: 'recommendation',
              className: 'p-4 text-sm text-gray-700 dark:text-gray-300'
            },
            {
              header: 'Action',
              render: (r) => (
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700">
                  Contact
                </button>
              ),
              className: 'p-4 text-center'
            }
          ]}
        />
      </div>

      {/* All Predictions Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Tenant Predictions</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Showing {allPredictions.length} predictions
          </p>
        </div>
        
        <DataTable 
          data={allPredictions}
          columns={[
            { 
              header: 'Tenant', 
              render: (r) => (
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{r.full_name || r.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.email}</p>
                </div>
              ),
              className: 'p-4'
            },
            { 
              header: 'Risk Score', 
              render: (r) => {
                const color = r.risk_score >= 70 ? 'text-red-600' : r.risk_score >= 40 ? 'text-yellow-600' : 'text-green-600';
                return <span className={`font-bold text-lg ${color}`}>{r.risk_score}</span>;
              },
              className: 'p-4 text-center'
            },
            { 
              header: 'Risk Level', 
              render: (r) => <RiskPill level={r.risk_level} />,
              className: 'p-4 text-center'
            },
            { 
              header: 'Will Retain?', 
              render: (r) => (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  r.will_retain 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {r.will_retain ? 'Yes' : 'No'}
                </span>
              ),
              className: 'p-4 text-center'
            },
            { 
              header: 'Retention Probability', 
              render: (r) => `${(r.retention_probability * 100).toFixed(1)}%`,
              className: 'p-4 text-center font-bold text-gray-900 dark:text-white'
            }
          ]}
        />
      </div>
    </div>
  );
};

export default RetentionAnalytics;