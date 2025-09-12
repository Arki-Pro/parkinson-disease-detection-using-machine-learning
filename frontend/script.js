// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length > 1) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Demo filler values (reasonable ranges from Kaggle dataset)
document.getElementById('fillDemo').addEventListener('click', () => {
  const set = (id, val) => document.getElementById(id).value = val;
  set('fo', 145.5);
  set('fhi', 160.2);
  set('flo', 135.8);
  set('jitter', 0.0051);
  set('shimmer', 0.03);
  set('hnr', 21.7);
  set('dfa', 0.73);
});

fetch('https://parkinson-disease-detection-using.onrender.com/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        fo: foValue,
        fhi: fhiValue,
        flo: floValue,
        jitter: jitterValue,
        shimmer: shimmerValue,
        hnr: hnrValue,
        dfa: dfaValue
    })
})
.then(res => res.json())
.then(data => {
    // Show model prediction
    document.getElementById('prediction').innerText = data.prediction ? 'Parkinson\'s' : 'Healthy';
    
    // Show feature-wise status
    let statusDiv = document.getElementById('feature-status');
    statusDiv.innerHTML = ''; // clear previous
    for (let [key, value] of Object.entries(data.feature_status)) {
        let p = document.createElement('p');
        p.innerText = `${key.toUpperCase()}: ${value}`;
        statusDiv.appendChild(p);
    }
})
.catch(err => console.error(err));

// Predict handler
document.getElementById('patientDataForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const resultBox = document.getElementById('result');
  resultBox.className = 'result'; // reset classes
  resultBox.textContent = 'Running prediction...';

  try {
    // Collect input values
    const payload = {
      fo: parseFloat(document.getElementById('fo').value),
      fhi: parseFloat(document.getElementById('fhi').value),
      flo: parseFloat(document.getElementById('flo').value),
      jitter: parseFloat(document.getElementById('jitter').value),
      shimmer: parseFloat(document.getElementById('shimmer').value),
      hnr: parseFloat(document.getElementById('hnr').value),
      dfa: parseFloat(document.getElementById('dfa').value)
    };

    // Replace below URL with your Render backend URL
    const BACKEND_URL = 'https://parkinson-disease-detection-using.onrender.com/predict';

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
    const label = data.prediction === 1
      ? "Parkinson’s likely (model positive)"
      : "Parkinson’s unlikely (model negative)";

    resultBox.textContent = `Prediction: ${label}`;
    resultBox.classList.add(data.prediction === 1 ? 'bad' : 'ok');

  } catch (err) {
    resultBox.textContent = 'Could not connect to backend.';
    console.error(err);
  }
});
