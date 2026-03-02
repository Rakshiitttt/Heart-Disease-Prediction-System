import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Heart, Info, AlertCircle, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

const App = () => {
  const [formData, setFormData] = useState({
    Age: 58,
    Sex: 1,
    Chest_pain_type: 4,
    BP: 152,
    Cholesterol: 239,
    FBS_over_120: 0,
    EKG_results: 0,
    Max_HR: 158,
    Exercise_angina: 1,
    ST_depression: 3.6,
    Slope_of_ST: 2,
    Number_of_vessels_fluro: 2,
    Thallium: 7
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/predict', formData);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to get prediction. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1>Clinical Heart AI</h1>
          <p>Advanced diagnostic prediction using XAI (Explainable AI) and LightGBM</p>
        </motion.div>
      </header>

      <main className="main-content">
        <motion.section 
          className="card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="result-title"><Activity /> Patient Metrics</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Age</label>
              <input type="number" name="Age" value={formData.Age} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Sex (1: Male, 0: Female)</label>
              <select name="Sex" value={formData.Sex} onChange={handleChange}>
                <option value={1}>Male</option>
                <option value={0}>Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>Chest Pain Type (1-4)</label>
              <select name="Chest_pain_type" value={formData.Chest_pain_type} onChange={handleChange}>
                <option value={1}>Typical Angina</option>
                <option value={2}>Atypical Angina</option>
                <option value={3}>Non-anginal Pain</option>
                <option value={4}>Asymptomatic</option>
              </select>
            </div>
            <div className="form-group">
              <label>BP (Blood Pressure)</label>
              <input type="number" name="BP" value={formData.BP} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Cholesterol</label>
              <input type="number" name="Cholesterol" value={formData.Cholesterol} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>FBS &gt; 120 (1: True, 0: False)</label>
              <select name="FBS_over_120" value={formData.FBS_over_120} onChange={handleChange}>
                <option value={1}>True</option>
                <option value={0}>False</option>
              </select>
            </div>
            <div className="form-group">
              <label>EKG Results (0-2)</label>
              <select name="EKG_results" value={formData.EKG_results} onChange={handleChange}>
                <option value={0}>Normal</option>
                <option value={1}>ST-T Wave Abnormality</option>
                <option value={2}>L. Ventricular Hypertrophy</option>
              </select>
            </div>
            <div className="form-group">
              <label>Max Heart Rate</label>
              <input type="number" name="Max_HR" value={formData.Max_HR} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Exercise Angina (1: Yes, 0: No)</label>
              <select name="Exercise_angina" value={formData.Exercise_angina} onChange={handleChange}>
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
            </div>
            <div className="form-group">
              <label>ST Depression (e.g. 1.5)</label>
              <input type="number" step="0.1" name="ST_depression" value={formData.ST_depression} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Slope of ST (1-3)</label>
              <select name="Slope_of_ST" value={formData.Slope_of_ST} onChange={handleChange}>
                <option value={1}>Upsloping</option>
                <option value={2}>Flat</option>
                <option value={3}>Downsloping</option>
              </select>
            </div>
            <div className="form-group">
              <label>Vessels Fluro (0-3)</label>
              <input type="number" name="Number_of_vessels_fluro" value={formData.Number_of_vessels_fluro} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Thallium (3, 6, 7)</label>
              <select name="Thallium" value={formData.Thallium} onChange={handleChange}>
                <option value={3}>Normal</option>
                <option value={6}>Fixed Defect</option>
                <option value={7}>Reversable Defect</option>
              </select>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Analyzing Clinical Bio-Markers...
                </>
              ) : (
                <>
                  Run Analysis <ArrowRight />
                </>
              )}
            </button>
          </form>
        </motion.section>

        <aside className="result-card">
          <AnimatePresence mode="wait">
            {!result && !error && (
              <motion.div 
                className="card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="result-title"><Info /> Analysis Ready</h2>
                <p style={{ color: 'var(--text-dim)' }}>Enter patient vitals to the left to generate an AI-assisted diagnostic prediction.</p>
              </motion.div>
            )}

            {error && (
              <motion.div 
                className="card"
                style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="result-title text-red-400"><AlertCircle /> Error</h2>
                <p style={{ color: '#fca5a5' }}>{error}</p>
              </motion.div>
            )}

            {result && (
              <motion.div 
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="result-title"><CheckCircle /> Diagnostic Report</h2>
                
                <div className={`status-badge ${result.prediction === 'Presence' ? 'status-positive' : 'status-negative'}`}>
                  {result.prediction === 'Presence' ? 'Higher Risk Detected' : 'Lower Risk Detected'}
                </div>

                <div style={{ margin: '1rem 0' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Risk Confidence Level</span>
                  <div className="probability-bar">
                    <motion.div 
                      className="probability-fill" 
                      initial={{ width: 0 }}
                      animate={{ width: `${result.probability * 100}%` }}
                    />
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '1.5rem' }}>
                    {(result.probability * 100).toFixed(1)}%
                  </span>
                </div>

                <div className="insights">
                  <div className="insight-item">
                    <Info size={18} />
                    <span>The model utilized clinical features including HR Reserve and BP categories for this evaluation.</span>
                  </div>
                  {result.probability > 0.7 && (
                     <div className="insight-item" style={{ backgroundColor: 'rgba(239,68,68,0.05)' }}>
                        <AlertCircle size={18} />
                        <span>High confidence presence of indicators consistent with heart disease. Immediate consultation advised.</span>
                     </div>
                  )}
                  {result.probability < 0.3 && (
                     <div className="insight-item" style={{ backgroundColor: 'rgba(16,185,129,0.05)' }}>
                        <CheckCircle size={18} style={{ color: '#10b981' }} />
                        <span>Bio-markers are within statistically healthy ranges for the given profile.</span>
                     </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </main>
    </div>
  );
};

export default App;
