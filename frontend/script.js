import React, { useState } from "react";

const App = () => {
  const [fo, setFo] = useState("");
  const [fhi, setFhi] = useState("");
  const [flo, setFlo] = useState("");
  const [jitter, setJitter] = useState("");
  const [shimmer, setShimmer] = useState("");
  const [hnr, setHnr] = useState("");
  const [dfa, setDfa] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [probability, setProbability] = useState(null);

  // Healthy ranges
  const featureGuidelines = {
    fo: { low: 100, high: 200, label: "Average Vocal Frequency (Fo)" },
    fhi: { low: 120, high: 260, label: "Max Vocal Frequency (Fhi)" },
    flo: { low: 80, high: 140, label: "Min Vocal Frequency (Flo)" },
    jitter: { low: 0, high: 0.01, label: "Voice Jitter (%)" },
    shimmer: { low: 0, high: 0.04, label: "Voice Shimmer" },
    hnr: { low: 20, high: 35, label: "Harmonics-to-Noise Ratio (HNR)" },
    dfa: { low: 0.6, high: 0.9, label: "Signal Complexity (DFA)" },
  };

  function evaluateFeature(value, feature) {
    const { low, high, label } = featureGuidelines[feature];
    if (value === "") return `${label}: Not provided`;
    const num = parseFloat(value);
    if (num < low) return `${label}: Low (${num})`;
    if (num > high) return `${label}: High (${num})`;
    return `${label}: Normal (${num})`;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputData = {
      fo: parseFloat(fo),
      fhi: parseFloat(fhi),
      flo: parseFloat(flo),
      jitter: parseFloat(jitter),
      shimmer: parseFloat(shimmer),
      hnr: parseFloat(hnr),
      dfa: parseFloat(dfa),
    };

    try {
      const response = await fetch("https://parkinson-disease-detection-using.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData),
      });

      const data = await response.json();
      if (data.error) {
        setPrediction(null);
        alert("Error: " + data.error);
      } else {
        setPrediction(data.prediction);
        setProbability(data.probability || null); // if you later add predict_proba
      }
    } catch (err) {
      alert("Could not connect to backend.");
    }
  };

  const handleAutofill = () => {
    setFo("145");
    setFhi("210");
    setFlo("100");
    setJitter("0.007");
    setShimmer("0.03");
    setHnr("25");
    setDfa("0.75");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          Parkinson’s Disease Detection
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="number" placeholder="Fo (Hz)" value={fo} onChange={(e) => setFo(e.target.value)} className="w-full p-2 border rounded" />
          <input type="number" placeholder="Fhi (Hz)" value={fhi} onChange={(e) => setFhi(e.target.value)} className="w-full p-2 border rounded" />
          <input type="number" placeholder="Flo (Hz)" value={flo} onChange={(e) => setFlo(e.target.value)} className="w-full p-2 border rounded" />
          <input type="number" placeholder="Jitter (%)" value={jitter} onChange={(e) => setJitter(e.target.value)} className="w-full p-2 border rounded" />
          <input type="number" placeholder="Shimmer" value={shimmer} onChange={(e) => setShimmer(e.target.value)} className="w-full p-2 border rounded" />
          <input type="number" placeholder="HNR" value={hnr} onChange={(e) => setHnr(e.target.value)} className="w-full p-2 border rounded" />
          <input type="number" placeholder="DFA" value={dfa} onChange={(e) => setDfa(e.target.value)} className="w-full p-2 border rounded" />

          <div className="flex justify-between">
            <button type="button" onClick={handleAutofill} className="bg-gray-300 px-4 py-2 rounded-lg shadow hover:bg-gray-400">
              Autofill Demo
            </button>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600">
              Predict
            </button>
          </div>
        </form>

        {prediction !== null && (
          <div
            className={`mt-6 p-4 rounded-xl text-center font-bold ${
              prediction === 1 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
            }`}
          >
            {prediction === 1 ? "Parkinson’s Detected" : "Healthy"}
            {probability && <p className="text-sm mt-2">Confidence: {(probability * 100).toFixed(1)}%</p>}
          </div>
        )}

        {prediction !== null && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">Feature Analysis:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>{evaluateFeature(fo, "fo")}</li>
              <li>{evaluateFeature(fhi, "fhi")}</li>
              <li>{evaluateFeature(flo, "flo")}</li>
              <li>{evaluateFeature(jitter, "jitter")}</li>
              <li>{evaluateFeature(shimmer, "shimmer")}</li>
              <li>{evaluateFeature(hnr, "hnr")}</li>
              <li>{evaluateFeature(dfa, "dfa")}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
