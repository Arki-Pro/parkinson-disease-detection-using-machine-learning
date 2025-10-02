// script.js — Full Hackathon Frontend Integration
document.addEventListener('DOMContentLoaded', () => {

  const BACKEND_URL = 'https://parkinson-disease-detection-using.onrender.com/predict';

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href && href.length > 1) {
        e.preventDefault();
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Parkinson’s demo
  const fillDemoBtn = document.getElementById('fillDemo');
  if (fillDemoBtn) fillDemoBtn.addEventListener('click', () => {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    set('fo', 119.992); set('fhi', 157.302); set('flo', 113.819);
    set('jitter', 0.00784); set('shimmer', 0.0432); set('hnr', 21.03); set('dfa', 0.703);
  });

  // Parkinson’s prediction form
  const patientForm = document.getElementById('patientDataForm');
  if (patientForm) {
    patientForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const resultBox = document.getElementById('result');
      if (!resultBox) return;
      resultBox.className = 'result'; resultBox.textContent = 'Running prediction...';

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
        for (const k in payload) if (Number.isNaN(payload[k])) { resultBox.textContent = `Please enter numeric value for ${k}`; return; }

        const resp = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!resp.ok) { const err = await resp.json().catch(()=>({error:'Server error'})); resultBox.textContent=`Error: ${err.error||'Unable to predict'}`; return; }

        const data = await resp.json();
        const prob = (typeof data.probability==='number') ? (data.probability*100).toFixed(1) : 'N/A';
        const label = data.prediction===1 ? `Neurodegeneration likely, consult Health Professional further for Dementia (model positive, 88.98%)` : `Neurodegeneration unlikely (model negative, 15.05%)`;
        resultBox.innerHTML = `<strong>Prediction:</strong> ${label}`;

        if(data.feature_status){
          const fs=data.feature_status; 
          let html='<div style="margin-top:10px"><strong>Feature analysis:</strong><ul style="text-align:left; margin-top:6px">';
          const prettyNames={fo:'MDVP:Fo (Hz)', fhi:'MDVP:Fhi (Hz)', flo:'MDVP:Flo (Hz)', jitter:'Jitter (%)', shimmer:'Shimmer', hnr:'HNR', dfa:'DFA'};
          for(const k in fs){ html+=`<li style="margin:4px 0;">${prettyNames[k]||k}: <strong>${fs[k]}</strong></li>`; }
          html+='</ul></div>'; resultBox.innerHTML+=html;
        }

        resultBox.classList.add(data.prediction===1?'bad':'ok'); resultBox.classList.remove('hide');
      } catch(err){ resultBox.textContent='Could not connect to backend.'; console.error(err); }
    });
  }

  // Dementia quiz
  const FORM_ID='dementiaQuizForm', RESULT_ID='dementiaResult', RESET_ID='dementiaReset', DEMO_DEMENTIA_ID='fillDemoDementia';
  const dementiaForm=document.getElementById(FORM_ID), dementiaResult=document.getElementById(RESULT_ID);

  if(dementiaForm && dementiaResult){
    const demoBtn=document.getElementById(DEMO_DEMENTIA_ID);
    if(demoBtn){ demoBtn.addEventListener('click',()=>{
      dementiaForm.q1.value=formatDate(new Date());
      dementiaForm.q2.value="Apple, Table, Penny";
      dementiaForm.q3.value="20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1";
      dementiaForm.q4.value="DLROW";
      dementiaForm.q5.value="dog, cat, lion";
    }); }

    function formatDate(d){ const dd=String(d.getDate()).padStart(2,'0'); const mm=String(d.getMonth()+1).padStart(2,'0'); const yyyy=d.getFullYear(); return `${dd}/${mm}/${yyyy}`; }
    function checkQ1_date(ans){ if(!ans) return false; const cleaned=ans.trim().replace(/[-.]/g,'/').replace(/\s+/g,''); const parts=cleaned.split('/'); if(parts.length!==3) return false; const dd=parseInt(parts[0],10), mm=parseInt(parts[1],10), yyyy=parseInt(parts[2],10); if(Number.isNaN(dd)||Number.isNaN(mm)||Number.isNaN(yyyy)) return false; const inputDate=new Date(yyyy,mm-1,dd), today=new Date(); const diffDays=Math.round((inputDate-new Date(today.getFullYear(),today.getMonth(),today.getDate()))/(1000*60*60*24)); return Math.abs(diffDays)<=1; }
    function checkQ2_threeWords(ans){ if(!ans) return false; const want=['apple','table','penny']; const parts=ans.toLowerCase().split(',').map(s=>s.trim()).filter(Boolean); return want.every(w=>parts.includes(w)); }
    function checkQ3_countBackwards(ans){ if(!ans) return false; const cleaned=ans.replace(/\s+/g,'').replace(/,$/,''); const parts=cleaned.split(',').map(s=>s.trim()).filter(Boolean); if(parts.length<5){ const parts2=ans.trim().split(/\s+/).map(s=>s.replace(/,$/,'').trim()).filter(Boolean); if(parts2.length>parts.length) parts.splice(0,parts.length,...parts2); } const nums=parts.map(x=>parseInt(x,10)).filter(n=>!Number.isNaN(n)); if(nums.length<5) return false; for(let i=0;i<Math.min(10,nums.length);i++){ if(nums[i]!==20-i) return false; } return true; }
    function checkQ4_reverseWORLD(ans){ if(!ans) return false; const cleaned=ans.replace(/\s+/g,'').toUpperCase(); return cleaned==='DLROW'; }
    function checkQ5_threeAnimals(ans){ if(!ans) return false; const parts=ans.toLowerCase().split(',').map(s=>s.trim()).filter(Boolean); const nonNumeric=parts.filter(p=>!/^\d+$/.test(p)); return nonNumeric.length>=3; }

    function computeScoreFromForm(){ let score=0; if(checkQ1_date(dementiaForm.q1?.value??'')) score+=1; if(checkQ2_threeWords(dementiaForm.q2?.value??'')) score+=1; if(checkQ3_countBackwards(dementiaForm.q3?.value??'')) score+=1; if(checkQ4_reverseWORLD(dementiaForm.q4?.value??'')) score+=1; if(checkQ5_threeAnimals(dementiaForm.q5?.value??'')) score+=1; return score; }
    function interpretScore(score){ const pct=Math.round((score/5)*100); if(pct>=80) return {label:'Low risk (cognitive screening normal)',pct}; if(pct>=50) return {label:'Moderate risk — consider follow-up',pct}; return {label:'High risk — clinical evaluation recommended',pct}; }

    dementiaForm.addEventListener('submit', ev=>{ ev.preventDefault(); const score=computeScoreFromForm(); const info=interpretScore(score); dementiaResult.innerHTML=`<div style="padding:12px;"><strong>Quiz result:</strong><div style="margin-top:8px">${info.label} — <strong>${info.pct}%</strong></div><div style="margin-top:10px; font-size:.9em; color:#cfcfcf;">This is an educational screening quiz only — not a diagnosis.</div></div>`;
    dementiaResult.classList.remove('hide');
    dementiaResult.scrollIntoView({ behavior: 'smooth' });
  });

  // Reset button
  const resetBtn = document.getElementById(RESET_ID);
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      dementiaForm.reset();
      dementiaResult.innerHTML = '';
      dementiaResult.classList.add('hide');
    });
  }
}

// ---------- Trail Making Test ----------
const trailCanvas = document.getElementById('trailCanvas');
const trailResult = document.getElementById('trailResult');
if (trailCanvas && trailResult) {
  const ctx = trailCanvas.getContext('2d');
  const points = [
    { x: 50, y: 50 }, { x: 250, y: 50 }, { x: 250, y: 250 }, { x: 50, y: 250 },
    { x: 150, y: 150 }, { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 200 }
  ];
  ctx.fillStyle = 'blue';
  points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(i + 1, p.x - 5, p.y + 5);
    ctx.fillStyle = 'blue';
  });

  let next = 0;
  trailCanvas.addEventListener('click', (e) => {
    const rect = trailCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - points[next].x;
    const dy = y - points[next].y;
    if (Math.sqrt(dx * dx + dy * dy) < 15) {
      next++;
      if (next === points.length) {
        trailResult.textContent = 'Great! You completed the Trail Making Test.';
      }
    }
  });
}

// ---------- Pattern Copy Test ----------
const patternOriginal = document.querySelectorAll('#patternOriginal .pattern-square');
const patternUser = document.getElementById('patternUser');
const patternResult = document.getElementById('patternResult');
const patternReset = document.getElementById('patternReset');

if (patternOriginal && patternUser) {
  let userPattern = [];
  patternOriginal.forEach((sq, i) => {
    const clone = sq.cloneNode(true);
    clone.style.cursor = 'pointer';
    clone.addEventListener('click', () => {
      userPattern.push(i);
      const userSq = document.createElement('div');
      userSq.className = 'pattern-square';
      userSq.style.width = '30px';
      userSq.style.height = '30px';
      userSq.style.background = sq.style.background;
      userPattern.appendChild(userSq);
      patternUser.appendChild(userSq);

      if (userPattern.length === patternOriginal.length) {
        const correct = userPattern.every((v, j) => v === j);
        patternResult.textContent = correct ? 'Pattern matched!' : 'Incorrect pattern.';
      }
    });
    patternUser.appendChild(clone);
  });

  if (patternReset) {
    patternReset.addEventListener('click', () => {
      userPattern = [];
      patternUser.innerHTML = '';
      patternResult.textContent = '';
    });
  }
}

}); // end DOMContentLoaded