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
// dementia-quiz.js  — drop this file in your frontend and include it before </body>
document.addEventListener('DOMContentLoaded', () => {
  // IDs expected in HTML
  const FORM_ID = 'dementiaQuizForm';
  const RESULT_ID = 'dementiaResult';
  const RESET_ID = 'dementiaReset';

  const form = document.getElementById(FORM_ID);
  const resultBox = document.getElementById(RESULT_ID);

  if (!form) {
    console.error(`Dementia quiz JS: form with id="${FORM_ID}" not found.`);
    return;
  }
  if (!resultBox) {
    console.error(`Dementia quiz JS: result container with id="${RESULT_ID}" not found.`);
    return;
  }

  // Example questions count: adjust if your HTML has more/less
  // The script reads answers named q1, q2, q3... (radio or select or number)
  const QUESTION_COUNT = 5;

  // score rules (example): each "positive" answer gives 1 point
  // If you use radio answers labeled "0" or "1", this will work.
  function computeScore(formData) {
    let score = 0;
    for (let i = 1; i <= QUESTION_COUNT; i++) {
      const key = 'q' + i;
      // If not present, skip (but ideally all present)
      if (!formData.has(key)) continue;
      const val = formData.get(key);
      // Accept numeric strings: "0", "1" etc.
      const num = parseFloat(val);
      if (!isNaN(num)) {
        score += num;
      } else {
        // handle text answers: treat 'yes' as 1
        if (String(val).toLowerCase().startsWith('y')) score += 1;
      }
    }
    return score;
  }

  function interpretScore(score) {
    // Example thresholds — tweak for your quiz
    const maxScore = QUESTION_COUNT; // if every q gives 1
    const pct = Math.round((score / maxScore) * 100);
    if (pct >= 70) return { label: 'High risk (possible dementia indicators)', pct };
    if (pct >= 40) return { label: 'Moderate risk — follow-up suggested', pct };
    return { label: 'Low risk (unlikely)', pct };
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const score = computeScore(fd);
    const info = interpretScore(score);

    // Build a friendly result block (won't change your CSS layout)
    resultBox.innerHTML = `
      <div style="padding:12px;">
        <strong>Quiz result:</strong>
        <div style="margin-top:8px">${info.label} — <strong>${info.pct}%</strong></div>
        <div style="margin-top:10px; font-size:.9em; color:#cfcfcf;">
          This is an educational screening quiz only — not a diagnosis. Recommend clinical evaluation for any concerning result.
        </div>
      </div>
    `;
    resultBox.classList.remove('hide');
    // optionally scroll into view
    resultBox.scrollIntoView({behavior:'smooth'});
  });

  // Optional reset button (if present)
  const resetBtn = document.getElementById(RESET_ID);
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      resultBox.innerHTML = '';
      resultBox.classList.add('hide');
    });
  }
});
document.addEventListener('DOMContentLoaded', () => {
  // ...existing dementia quiz code...

  // Demo fill button for dementia quiz
  const demoBtn = document.getElementById('fillDemoDementia');
  const form = document.getElementById('dementiaQuizForm');
  if (demoBtn && form) {
    demoBtn.addEventListener('click', () => {
      form.q1.value = "01/10/2025"; // today's date, as demo
      form.q2.value = "Apple, Table, Penny";
      form.q3.value = "20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1";
      form.q4.value = "DLROW";
      form.q5.value = "dog, cat, lion";
    });
  }
});