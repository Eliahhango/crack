import React, { useState } from 'react';
import axios from 'axios';
import './ProxyTools.css';

const ProxyTools = () => {
  const [proxy, setProxy] = useState('');
  const [proxyCount, setProxyCount] = useState(10);
  const [country, setCountry] = useState('US');
  const [protocol, setProtocol] = useState('http');
  const [checkResult, setCheckResult] = useState(null);
  const [generatedProxies, setGeneratedProxies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleProxyCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/proxy/check', { proxy });
      setCheckResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check proxy');
    } finally {
      setLoading(false);
    }
  };

  const handleProxyGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/proxy/generate', {
        count: proxyCount,
        country,
        protocol
      });
      setGeneratedProxies(response.data.proxies);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate proxies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="proxy-tools">
      <div className="elitechwiz-caption">EliTechWiz Destroyer 👾</div>
      <h2>🔒 Advanced Proxy Tools</h2>
      
      <div className="proxy-section">
        <h3>🔍 Proxy Checker</h3>
        <form onSubmit={handleProxyCheck}>
          <input
            type="text"
            value={proxy}
            onChange={(e) => setProxy(e.target.value)}
            placeholder="Enter proxy (ip:port)"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Checking...' : 'Check Proxy'}
          </button>
        </form>
        
        {checkResult && (
          <div className="check-result">
            <p>📍 IP: {checkResult.ip}</p>
            <p>🌍 Country: {checkResult.country}</p>
            <p>⚡ Speed: {checkResult.speed}ms</p>
            <p>🔒 Protocol: {checkResult.protocol}</p>
            <p>🟢 Status: {checkResult.status}</p>
          </div>
        )}
      </div>

      <div className="proxy-section">
        <h3>⚡ Proxy Generator</h3>
        <form onSubmit={handleProxyGenerate}>
          <input
            type="number"
            value={proxyCount}
            onChange={(e) => setProxyCount(e.target.value)}
            placeholder="Number of proxies"
            min="1"
            max="100"
            required
          />
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="US">🇺🇸 United States</option>
            <option value="UK">🇬🇧 United Kingdom</option>
            <option value="DE">🇩🇪 Germany</option>
            <option value="JP">🇯🇵 Japan</option>
            <option value="CA">🇨🇦 Canada</option>
          </select>
          <select value={protocol} onChange={(e) => setProtocol(e.target.value)}>
            <option value="http">HTTP</option>
            <option value="socks4">SOCKS4</option>
            <option value="socks5">SOCKS5</option>
          </select>
          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Proxies'}
          </button>
        </form>

        {generatedProxies.length > 0 && (
          <div className="proxy-list">
            <h4>✨ Generated Proxies</h4>
            <div className="proxy-grid">
              {generatedProxies.map((proxy, index) => (
                <div key={index} className="proxy-item">
                  {proxy}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default ProxyTools; 