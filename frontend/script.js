// script.js — Safe, robust Parkinson frontend + improved dementia quiz
// Replace your current script.js with this. Works on index.html and dementia.html.

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

  // ---------- Dementia quiz logic (robust) ----------
  const FORM_ID = 'dementiaQuizForm';
  const RESULT_ID = 'dementiaResult';
  const RESET_ID = 'dementiaReset';
  const DEMO_DEMENTIA_ID = 'fillDemoDementia';

  const dementiaForm = document.getElementById(FORM_ID);
  const dementiaResult = document.getElementById(RESULT_ID);

  if (dementiaForm && dementiaResult) {
    // Demo button fill (if present)
    const demoBtn = document.getElementById(DEMO_DEMENTIA_ID);
    if (demoBtn) {
      demoBtn.addEventListener('click', () => {
        dementiaForm.q1.value = formatDate(new Date()); // today's date in DD/MM/YYYY
        dementiaForm.q2.value = "Apple, Table, Penny";
        dementiaForm.q3.value = "20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1";
        dementiaForm.q4.value = "DLROW";
        dementiaForm.q5.value = "dog, cat, lion";
      });
    }

    // Helper: format Date object as DD/MM/YYYY
    function formatDate(d) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }

    // Robust parsers / checkers for each question
    function checkQ1_date(answer) {
      if (!answer) return false;
      // Normalize slashes/dashes/spaces
      const cleaned = answer.trim().replace(/[-.]/g, '/').replace(/\s+/g, '');
      // Accept DD/MM/YYYY or D/M/YYYY
      const parts = cleaned.split('/');
      if (parts.length !== 3) return false;
      const dd = parseInt(parts[0], 10), mm = parseInt(parts[1], 10), yyyy = parseInt(parts[2], 10);
      if (Number.isNaN(dd) || Number.isNaN(mm) || Number.isNaN(yyyy)) return false;
      // Accept if it's the same day as client (user's browser day) OR within +/-1 day (to be forgiving)
      const inputDate = new Date(yyyy, mm - 1, dd);
      const today = new Date();
      const diffDays = Math.round((inputDate - new Date(today.getFullYear(), today.getMonth(), today.getDate()))/(1000*60*60*24));
      return Math.abs(diffDays) <= 1;
    }

    function checkQ2_threeWords(answer) {
      if (!answer) return false;
      const want = ['apple','table','penny'];
      const parts = answer.toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
      // success if all required words are present (order not important)
      return want.every(w => parts.includes(w));
    }

    function checkQ3_countBackwards(answer) {
      if (!answer) return false;
      // Normalize: remove spaces, accept commas or spaces
      const cleaned = answer.replace(/\s+/g,'').replace(/,$/,'');
      const parts = cleaned.split(',').map(s => s.trim()).filter(Boolean);
      // If user used spaces instead of commas, split on spaces too (fallback)
      if (parts.length < 5) {
        const parts2 = answer.trim().split(/\s+/).map(s=>s.replace(/,$/,'').trim()).filter(Boolean);
        if (parts2.length > parts.length) parts.splice(0, parts.length, ...parts2);
      }
      // Now check it's exactly numbers 20..1 in descending order (allowing some missing/typo tolerance)
      const nums = parts.map(x => parseInt(x, 10)).filter(n => !Number.isNaN(n));
      if (nums.length < 5) return false; // too few numbers to be valid
      // Check descending by 1 step for first min(10, nums.length) entries
      for (let i = 0; i < Math.min(10, nums.length); i++) {
        if (nums[i] !== (20 - i)) return false;
      }
      return true;
    }

    function checkQ4_reverseWORLD(answer) {
      if (!answer) return false;
      const cleaned = answer.replace(/\s+/g,'').toUpperCase();
      return cleaned === 'DLROW';
    }

    function checkQ5_threeAnimals(answer) {
      if (!answer) return false;
      const parts = answer.toLowerCase().split(',').map(s=>s.trim()).filter(Boolean);
      // accept any 3 non-numeric tokens
      const nonNumeric = parts.filter(p => !/^\d+$/.test(p));
      return nonNumeric.length >= 3;
    }

    function computeScoreFromForm() {
      let score = 0;
      try {
        const a1 = dementiaForm.q1?.value ?? '';
        const a2 = dementiaForm.q2?.value ?? '';
        const a3 = dementiaForm.q3?.value ?? '';
        const a4 = dementiaForm.q4?.value ?? '';
        const a5 = dementiaForm.q5?.value ?? '';

        if (checkQ1_date(a1)) score += 1;
        if (checkQ2_threeWords(a2)) score += 1;
        if (checkQ3_countBackwards(a3)) score += 1;
        if (checkQ4_reverseWORLD(a4)) score += 1;
        if (checkQ5_threeAnimals(a5)) score += 1;

      } catch (err) {
        console.error('Error computing dementia score', err);
      }
      return score;
    }

    function interpretScore(score) {
      const max = 5;
      const pct = Math.round((score / max) * 100);
      // NOTE: higher score = better cognitive function => lower risk
      if (pct >= 80) return { label: 'Low risk (cognitive screening normal)', pct };
      if (pct >= 50) return { label: 'Moderate risk — consider follow-up', pct };
      return { label: 'High risk — clinical evaluation recommended', pct };
    }

    dementiaForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const score = computeScoreFromForm();
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