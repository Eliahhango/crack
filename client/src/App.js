import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    removeAds: true,
    unlockPremium: true,
    bypassSecurity: true,
    removeAnalytics: true,
    optimizationLevel: 100,
    customMods: [],
    advancedOptions: {
      bypassRootDetection: true,
      bypassEmulatorDetection: true,
      bypassDebugDetection: true,
      bypassHookDetection: true,
      removeFirebase: true,
      removeCrashlytics: true,
      removeGooglePlayServices: true,
      enableDebugMode: true,
      forcePremiumFeatures: true,
      removeAllAds: true,
      disableAllTracking: true
    }
  });
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [customModInput, setCustomModInput] = useState('');
  const fileInputRef = useRef(null);
  const [vpnFile, setVpnFile] = useState(null);
  const [vpnDetails, setVpnDetails] = useState(null);
  const [vpnError, setVpnError] = useState(null);
  const [proxyInput, setProxyInput] = useState('');
  const [proxyResult, setProxyResult] = useState(null);
  const [proxyError, setProxyError] = useState(null);
  const [generatedProxies, setGeneratedProxies] = useState([]);
  const [proxyCount, setProxyCount] = useState(10);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedProtocol, setSelectedProtocol] = useState('http');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setError('No file selected');
      setFile(null);
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
      setError('File size exceeds 100MB limit');
      setFile(null);
      return;
    }

    if (selectedFile.name.endsWith('.apk')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid APK file');
      setFile(null);
    }
  };

  const handleOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const handleAdvancedOptionChange = (option) => {
    setOptions(prev => ({
      ...prev,
      advancedOptions: {
        ...prev.advancedOptions,
        [option]: !prev.advancedOptions[option]
      }
    }));
  };

  const handleOptimizationChange = (e) => {
    setOptions(prev => ({
      ...prev,
      optimizationLevel: parseInt(e.target.value)
    }));
  };

  const handleCustomModAdd = () => {
    if (customModInput.trim()) {
      setOptions(prev => ({
        ...prev,
        customMods: [...prev.customMods, customModInput.trim()]
      }));
      setCustomModInput('');
    }
  };

  const handleCustomModRemove = (index) => {
    setOptions(prev => ({
      ...prev,
      customMods: prev.customMods.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an APK file');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('apk', file);
    formData.append('options', JSON.stringify(options));

    try {
      const response = await fetch('http://localhost:3001/api/mod', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setHistory(prev => [{
          timestamp: new Date().toISOString(),
          filename: file.name,
          features: data.features,
          fileHash: data.fileHash
        }, ...prev]);
      } else {
        setError(data.error || 'Failed to process APK');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(`Server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (result && result.downloadUrl) {
      window.location.href = `http://localhost:3001${result.downloadUrl}`;
    }
  };

  const handleVpnFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setVpnFile(selectedFile);
      setVpnError(null);
    }
  };

  const handleVpnSniff = async (e) => {
    e.preventDefault();
    if (!vpnFile) {
      setVpnError('Please select a VPN file');
      return;
    }

    const formData = new FormData();
    formData.append('vpnFile', vpnFile);

    try {
      const response = await fetch('/api/sniff-vpn', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setVpnDetails(data.details);
        setVpnError(null);
      } else {
        setVpnError(data.error || 'Failed to analyze VPN file');
      }
    } catch (err) {
      setVpnError('Server error: ' + err.message);
    }
  };

  const handleProxyCheck = async (e) => {
    e.preventDefault();
    if (!proxyInput) {
      setProxyError('Please enter a proxy');
      return;
    }

    try {
      const response = await fetch('/api/check-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proxy: proxyInput,
          timeout: 5000
        })
      });

      const data = await response.json();

      if (data.success) {
        setProxyResult(data);
        setProxyError(null);
      } else {
        setProxyError(data.error || 'Failed to check proxy');
      }
    } catch (err) {
      setProxyError('Server error: ' + err.message);
    }
  };

  const handleGenerateProxies = async () => {
    try {
      const response = await fetch(`/api/generate-proxies?count=${proxyCount}&country=${selectedCountry}&protocol=${selectedProtocol}`);
      const data = await response.json();

      if (data.success) {
        setGeneratedProxies(data.proxies);
        setProxyError(null);
      } else {
        setProxyError(data.error || 'Failed to generate proxies');
      }
    } catch (err) {
      setProxyError('Server error: ' + err.message);
    }
  };

  return (
    <div className="app">
      <div className="elitechwiz-caption">EliTechWiz Destroyer 👾</div>
      <header className="app-header">
        <h1>🔥 Advanced APK Cracker Pro 🔥</h1>
        <p>Unleash the full potential of any Android app!</p>
      </header>

      <div className="tabs">
        <button 
          className={activeTab === 'upload' ? 'active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          🚀 Upload & Crack
        </button>
        <button 
          className={activeTab === 'vpn' ? 'active' : ''}
          onClick={() => setActiveTab('vpn')}
        >
          🔍 VPN Sniffer
        </button>
        <button 
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          📜 History
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Advanced Settings
        </button>
        <button 
          className={activeTab === 'proxy' ? 'active' : ''}
          onClick={() => setActiveTab('proxy')}
        >
          🔄 Proxy Tools
        </button>
      </div>

      {activeTab === 'upload' && (
        <div className="upload-section">
          <div className="file-upload">
            <input
              type="file"
              accept=".apk"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              📁 Select APK
            </button>
            {file && <p className="file-name">Selected: {file.name}</p>}
          </div>

          <div className="options-section">
            <h3>Basic Options</h3>
            <div className="options-grid">
              <label>
                <input
                  type="checkbox"
                  checked={options.removeAds}
                  onChange={() => handleOptionChange('removeAds')}
                />
                Remove All Ads
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={options.unlockPremium}
                  onChange={() => handleOptionChange('unlockPremium')}
                />
                Unlock Premium Features
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={options.bypassSecurity}
                  onChange={() => handleOptionChange('bypassSecurity')}
                />
                Bypass Security Checks
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={options.removeAnalytics}
                  onChange={() => handleOptionChange('removeAnalytics')}
                />
                Remove Analytics
              </label>
            </div>

            <div className="optimization-slider">
              <h3>Optimization Level</h3>
              <input
                type="range"
                min="0"
                max="100"
                value={options.optimizationLevel}
                onChange={handleOptimizationChange}
              />
              <span>{options.optimizationLevel}%</span>
            </div>

            <div className="custom-mods">
              <h3>Custom Modifications</h3>
              <div className="custom-mods-input">
                <input
                  type="text"
                  value={customModInput}
                  onChange={(e) => setCustomModInput(e.target.value)}
                  placeholder="Pattern->Replacement"
                />
                <button onClick={handleCustomModAdd}>Add</button>
              </div>
              <div className="custom-mods-list">
                {options.customMods.map((mod, index) => (
                  <div key={index} className="custom-mod-item">
                    <span>{mod}</span>
                    <button onClick={() => handleCustomModRemove(index)}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button 
            className="crack-btn"
            onClick={handleSubmit}
            disabled={!file || loading}
          >
            {loading ? 'Cracking... 🔥' : 'Crack APK! 💪'}
          </button>

          {error && <p className="error">{error}</p>}

          {result && (
            <div className="result">
              <h3>🎉 Cracking Successful!</h3>
              <div className="features-list">
                {result.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    ✅ {feature}
                  </div>
                ))}
              </div>
              <button 
                className="download-btn"
                onClick={handleDownload}
              >
                Download Modified APK
              </button>
              <div className="file-hash">
                <p>File Hash (SHA-256):</p>
                <code>{result.fileHash}</code>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'vpn' && (
        <div className="vpn-section">
          <h2>🔍 VPN File Sniffer</h2>
          <div className="file-upload">
            <input
              type="file"
              accept=".ovpn,.conf,.txt"
              onChange={handleVpnFileChange}
              style={{ display: 'none' }}
              id="vpn-file-input"
            />
            <button 
              className="upload-btn"
              onClick={() => document.getElementById('vpn-file-input').click()}
            >
              📁 Select VPN File
            </button>
            {vpnFile && <p className="file-name">Selected: {vpnFile.name}</p>}
          </div>

          {vpnError && <p className="error">{vpnError}</p>}

          <button 
            className="crack-btn"
            onClick={handleVpnSniff}
            disabled={!vpnFile}
          >
            Analyze VPN File
          </button>

          {vpnDetails && (
            <div className="vpn-details">
              <h3>🔍 Analysis Results</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{vpnDetails.type}</span>
                </div>
                {vpnDetails.server && (
                  <div className="detail-item">
                    <span className="detail-label">Server:</span>
                    <span className="detail-value">{vpnDetails.server}</span>
                  </div>
                )}
                {vpnDetails.port && (
                  <div className="detail-item">
                    <span className="detail-label">Port:</span>
                    <span className="detail-value">{vpnDetails.port}</span>
                  </div>
                )}
                {vpnDetails.username && (
                  <div className="detail-item">
                    <span className="detail-label">Username:</span>
                    <span className="detail-value">{vpnDetails.username}</span>
                  </div>
                )}
                {vpnDetails.password && (
                  <div className="detail-item">
                    <span className="detail-label">Password:</span>
                    <span className="detail-value">{vpnDetails.password}</span>
                  </div>
                )}
                {vpnDetails.method && (
                  <div className="detail-item">
                    <span className="detail-label">Method:</span>
                    <span className="detail-value">{vpnDetails.method}</span>
                  </div>
                )}
                {vpnDetails.protocol && (
                  <div className="detail-item">
                    <span className="detail-label">Protocol:</span>
                    <span className="detail-value">{vpnDetails.protocol}</span>
                  </div>
                )}
                {vpnDetails.obfs && (
                  <div className="detail-item">
                    <span className="detail-label">Obfuscation:</span>
                    <span className="detail-value">{vpnDetails.obfs}</span>
                  </div>
                )}
              </div>
              <div className="raw-content">
                <h4>Raw Content:</h4>
                <pre>{vpnDetails.raw}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-section">
          <h2>📜 Cracking History</h2>
          {history.length === 0 ? (
            <p>No history yet</p>
          ) : (
            <div className="history-list">
              {history.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-header">
                    <span className="timestamp">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <span className="filename">{item.filename}</span>
                  </div>
                  <div className="file-hash">
                    <p>Hash:</p>
                    <code>{item.fileHash}</code>
                  </div>
                  <div className="features-list">
                    {item.features.map((feature, i) => (
                      <div key={i} className="feature-item">
                        ✅ {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="settings-section">
          <h2>⚙️ Advanced Settings</h2>
          <div className="advanced-options">
            <h3>Security Bypass</h3>
            <div className="options-grid">
              <label>
                <input
                  type="checkbox"
                  checked={options.advancedOptions.bypassRootDetection}
                  onChange={() => handleAdvancedOptionChange('bypassRootDetection')}
                />
                Bypass Root Detection
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={options.advancedOptions.bypassEmulatorDetection}
                  onChange={() => handleAdvancedOptionChange('bypassEmulatorDetection')}
                />
                Bypass Emulator Detection
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={options.advancedOptions.bypassDebugDetection}
                  onChange={() => handleAdvancedOptionChange('bypassDebugDetection')}
                />
                Bypass Debug Detection
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={options.advancedOptions.bypassHookDetection}
                  onChange={() => handleAdvancedOptionChange('bypassHookDetection')}
                />
                Bypass Hook Detection
              </label>
            </div>

            <h3>Service Removal</h3>
            <div className="options-grid">
              <label>
                <input
                  type="checkbox"
                  checked={options.advancedOptions.removeFirebase}
                  onChange={() => handleAdvancedOptionChange('removeFirebase')}
                />
                Remove Firebase
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={options.advancedOptions.removeCrashlytics}
                  onChange={() => handleAdvancedOptionChange('removeCrashlytics')}
                />
                Remove Crashlytics
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={options.advancedOptions.removeGooglePlayServices}
                  onChange={() => handleAdvancedOptionChange('removeGooglePlayServices')}
                />
                Remove Google Play Services
              </label>
            </div>

            <h3>Advanced Features</h3>
            <div className="options-grid">
              <label>
                <input
                  type="checkbox"
                  checked={options.advancedOptions.enableDebugMode}
                  onChange={() => handleAdvancedOptionChange('enableDebugMode')}
                />
                Enable Debug Mode
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={options.advancedOptions.forcePremiumFeatures}
                  onChange={() => handleAdvancedOptionChange('forcePremiumFeatures')}
                />
                Force Premium Features
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={options.advancedOptions.removeAllAds}
                  onChange={() => handleAdvancedOptionChange('removeAllAds')}
                />
                Remove All Ads
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={options.advancedOptions.disableAllTracking}
                  onChange={() => handleAdvancedOptionChange('disableAllTracking')}
                />
                Disable All Tracking
              </label>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'proxy' && (
        <div className="proxy-section">
          <div className="proxy-checker">
            <h2>🔍 Proxy Checker</h2>
            <div className="proxy-input">
              <input
                type="text"
                placeholder="Enter proxy (host:port)"
                value={proxyInput}
                onChange={(e) => setProxyInput(e.target.value)}
              />
              <button 
                className="check-btn"
                onClick={handleProxyCheck}
                disabled={!proxyInput}
              >
                Check Proxy
              </button>
            </div>

            {proxyError && <p className="error">{proxyError}</p>}

            {proxyResult && (
              <div className="proxy-result">
                <h3>Proxy Status</h3>
                <div className="result-grid">
                  <div className="result-item">
                    <span className="result-label">Proxy:</span>
                    <span className="result-value">{proxyResult.proxy}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Status:</span>
                    <span className={`result-value ${proxyResult.status}`}>
                      {proxyResult.status}
                    </span>
                  </div>
                  {proxyResult.latency && (
                    <div className="result-item">
                      <span className="result-label">Latency:</span>
                      <span className="result-value">{proxyResult.latency}ms</span>
                    </div>
                  )}
                  {proxyResult.error && (
                    <div className="result-item">
                      <span className="result-label">Error:</span>
                      <span className="result-value error">{proxyResult.error}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="proxy-generator">
            <h2>🔄 Proxy Generator</h2>
            <div className="generator-controls">
              <div className="control-group">
                <label>Count:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={proxyCount}
                  onChange={(e) => setProxyCount(e.target.value)}
                />
              </div>
              <div className="control-group">
                <label>Country:</label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                >
                  <option value="all">All Countries</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="ca">Canada</option>
                  <option value="de">Germany</option>
                  <option value="fr">France</option>
                  <option value="jp">Japan</option>
                  <option value="sg">Singapore</option>
                  <option value="au">Australia</option>
                  <option value="br">Brazil</option>
                  <option value="in">India</option>
                </select>
              </div>
              <div className="control-group">
                <label>Protocol:</label>
                <select
                  value={selectedProtocol}
                  onChange={(e) => setSelectedProtocol(e.target.value)}
                >
                  <option value="http">HTTP</option>
                  <option value="socks4">SOCKS4</option>
                  <option value="socks5">SOCKS5</option>
                </select>
              </div>
            </div>

            <button 
              className="generate-btn"
              onClick={handleGenerateProxies}
            >
              Generate Proxies
            </button>

            {generatedProxies.length > 0 && (
              <div className="proxies-list">
                <h3>Generated Proxies</h3>
                <div className="proxies-grid">
                  {generatedProxies.map((proxy, index) => (
                    <div key={index} className="proxy-item">
                      <div className="proxy-details">
                        <span className="proxy-ip">{proxy.ip}:{proxy.port}</span>
                        <span className="proxy-country">{proxy.country}</span>
                        <span className="proxy-protocol">{proxy.protocol}</span>
                      </div>
                      <button 
                        className="copy-btn"
                        onClick={() => navigator.clipboard.writeText(`${proxy.ip}:${proxy.port}`)}
                      >
                        Copy
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 