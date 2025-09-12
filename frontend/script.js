const BACKEND_URL = 'https://parkinson-disease-detection-using.onrender.com/predict';


// Smooth scroll for anchor links (keep if already present)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length > 1) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// --- Healthy demo values: a real healthy row from dataset (paste here) ---
// These values are typical healthy sample rows from the Kaggle dataset
// If your deployed model uses a different model/scaler, you may need to run the Kaggle script
// I provided earlier to extract a guaranteed healthy row from *your deployed* model.
document.getElementById('fillDemo').addEventListener('click', () => {
  const set = (id, val) => document.getElementById(id).value = val;
  set('fo', 119.992);
  set('fhi', 157.302);
  set('flo', 113.819);
  set('jitter', 0.00784);
  set('shimmer', 0.0432);
  set('hnr', 21.03);
  set('dfa', 0.703);
});

// --- Form submit / prediction handler ---
document.getElementById('patientDataForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const resultBox = document.getElementById('result');
  resultBox.className = 'result'; // reset classes
  resultBox.textContent = 'Running prediction...';

  try {
    // Collect input values (ensure the IDs match your HTML)
    const payload = {
      fo: parseFloat(document.getElementById('fo').value),
      fhi: parseFloat(document.getElementById('fhi').value),
      flo: parseFloat(document.getElementById('flo').value),
      jitter: parseFloat(document.getElementById('jitter').value),
      shimmer: parseFloat(document.getElementById('shimmer').value),
      hnr: parseFloat(document.getElementById('hnr').value),
      dfa: parseFloat(document.getElementById('dfa').value)
    };

    // Basic validation
    for (const k in payload) {
      if (isNaN(payload[k])) {
        resultBox.textContent = `Please enter numeric value for ${k}`;
        return;
      }
    }

    const resp = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Server error' }));
      resultBox.textContent = `Error: ${err.error || 'Unable to predict'}`;
      return;
    }

    const data = await resp.json();

    // Build result UI: prediction + probability
    const prob = (typeof data.probability === 'number') ? (data.probability * 100).toFixed(1) : 'N/A';
    const label = data.prediction === 1
      ? `Parkinson’s likely (model positive, ${prob}%)`
      : `Parkinson’s unlikely (model negative, ${prob}%)`;

    // show main label
    resultBox.innerHTML = `<strong>Prediction:</strong> ${label}`;

    // add feature status breakdown if available
    if (data.feature_status) {
      const fs = data.feature_status;
      let html = '<div style="margin-top:10px"><strong>Feature analysis:</strong><ul style="text-align:left; margin-top:6px">';
      const prettyNames = {
        fo: 'MDVP:Fo (Hz)',
        fhi: 'MDVP:Fhi (Hz)',
        flo: 'MDVP:Flo (Hz)',
        jitter: 'Jitter (%)',
        shimmer: 'Shimmer',
        hnr: 'HNR',
        dfa: 'DFA'
      };
      for (const k in fs) {
        const status = fs[k];
        html += `<li style="margin:4px 0;">${prettyNames[k] || k}: <strong>${status}</strong></li>`;
      }
      html += '</ul></div>';
      resultBox.innerHTML += html;
    }

    // style result box success/bad
    resultBox.classList.add(data.prediction === 1 ? 'bad' : 'ok');
    resultBox.classList.remove('hide');

  } catch (err) {
    resultBox.textContent = 'Could not connect to backend.';
    console.error(err);
  }
});

