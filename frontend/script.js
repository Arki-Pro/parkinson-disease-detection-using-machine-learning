// script.js — safe version for index.html and dementia.html
document.addEventListener('DOMContentLoaded', () => {

  // ---------- Backend URL (used only if patientDataForm exists) ----------
  const BACKEND_URL = 'https://parkinson-disease-detection-using.onrender.com/predict';

  // ---------- smooth anchor scrolling (safe) ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href && href.length > 1) {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---------- Parkinson demo: Fill demo values button (guarded) ----------
  const fillDemoBtn = document.getElementById('fillDemo');
  if (fillDemoBtn) {
    fillDemoBtn.addEventListener('click', () => {
      const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
      };
      set('fo', 119.992);
      set('fhi', 157.302);
      set('flo', 113.819);
      set('jitter', 0.00784);
      set('shimmer', 0.0432);
      set('hnr', 21.03);
      set('dfa', 0.703);
    });
  }

  // ---------- Parkinson demo: prediction form handler (guarded) ----------
  const patientForm = document.getElementById('patientDataForm');
  if (patientForm) {
    patientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const resultBox = document.getElementById('result');
      if (!resultBox) return;
      resultBox.className = 'result'; // reset classes
      resultBox.textContent = 'Running prediction...';

      try {
        const payload = {
          fo: parseFloat(document.getElementById('fo')?.value),
          fhi: parseFloat(document.getElementById('fhi')?.value),
          flo: parseFloat(document.getElementById('flo')?.value),
          jitter: parseFloat(document.getElementById('jitter')?.value),
          shimmer: parseFloat(document.getElementById('shimmer')?.value),
          hnr: parseFloat(document.getElementById('hnr')?.value),
          dfa: parseFloat(document.getElementById('dfa')?.value)
        };

        // Basic validation
        for (const k in payload) {
          if (Number.isNaN(payload[k])) {
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
        const prob = (typeof data.probability === 'number') ? (data.probability * 100).toFixed(1) : 'N/A';
        const label = data.prediction === 1
          ? `Parkinson’s likely (model positive, ${prob}%)`
          : `Parkinson’s unlikely (model negative, ${prob}%)`;

        resultBox.innerHTML = `<strong>Prediction:</strong> ${label}`;

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

        resultBox.classList.add(data.prediction === 1 ? 'bad' : 'ok');
        resultBox.classList.remove('hide');

      } catch (err) {
        resultBox.textContent = 'Could not connect to backend.';
        console.error(err);
      }
    });
  } // end patientForm guard

  // ---------- Dementia quiz logic (guarded) ----------
  const FORM_ID = 'dementiaQuizForm';
  const RESULT_ID = 'dementiaResult';
  const RESET_ID = 'dementiaReset';
  const DEMO_DEMENTIA_ID = 'fillDemoDementia';

  const dementiaForm = document.getElementById(FORM_ID);
  const dementiaResult = document.getElementById(RESULT_ID);

  if (dementiaForm && dementiaResult) {
    // demo button fill (if present)
    const demoBtn = document.getElementById(DEMO_DEMENTIA_ID);
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        dementiaForm.q1.value = "01/10/2025";
        dementiaForm.q2.value = "Apple, Table, Penny";
        dementiaForm.q3.value = "20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1";
        dementiaForm.q4.value = "DLROW";
        dementiaForm.q5.value = "dog, cat, lion";
      });
    }

    const QUESTION_COUNT = 5;

    function computeScore(formData) {
      let score = 0;
      for (let i = 1; i <= QUESTION_COUNT; i++) {
        const key = 'q' + i;
        if (!formData.has(key)) continue;
        const val = formData.get(key);
        const num = parseFloat(val);
        if (!isNaN(num)) {
          score += num;
        } else {
          if (String(val).toLowerCase().startsWith('y')) score += 1;
          // for text responses like the demo, we can hard-score correct demo answers below if needed
        }
      }
      return score;
    }

    function interpretScore(score) {
      const maxScore = QUESTION_COUNT;
      const pct = Math.round((score / maxScore) * 100);
      if (pct >= 70) return { label: 'High risk (possible dementia indicators)', pct };
      if (pct >= 40) return { label: 'Moderate risk — follow-up suggested', pct };
      return { label: 'Low risk (unlikely)', pct };
    }

    dementiaForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(dementiaForm);
      const score = computeScore(fd);
      const info = interpretScore(score);

      dementiaResult.innerHTML = `
        <div style="padding:12px;">
          <strong>Quiz result:</strong>
          <div style="margin-top:8px">${info.label} — <strong>${info.pct}%</strong></div>
          <div style="margin-top:10px; font-size:.9em; color:#cfcfcf;">
            This is an educational screening quiz only — not a diagnosis. Recommend clinical evaluation for any concerning result.
          </div>
        </div>
      `;
      dementiaResult.classList.remove('hide');
      dementiaResult.scrollIntoView({ behavior: 'smooth' });
    });

    // reset button handling
    const resetBtn = document.getElementById(RESET_ID);
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        dementiaForm.reset();
        dementiaResult.innerHTML = '';
        dementiaResult.classList.add('hide');
      });
    }
  } // end dementia guard

}); // end DOMContentLoaded