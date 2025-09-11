// Smooth scroll fix for browsers that ignore CSS behavior for anchor links on some setups
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const href = a.getAttribute('href');
    if(href.length>1){
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({behavior:'smooth', block:'start'});
    }
  });
});

// Demo filler values (reasonable ranges for the dataset)
document.getElementById('fillDemo').addEventListener('click', ()=>{
  const set = (id,val)=>document.getElementById(id).value = val;
  set('fo', 145.5);
  set('fhi', 160.2);
  set('flo', 135.8);
  set('jitter', 0.0051);
  set('shimmer', 0.03);
  set('hnr', 21.7);
  set('dfa', 0.73);
});

// Predict handler
document.getElementById('patientDataForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const q = id => parseFloat(document.getElementById(id).value);
  const payload = {
    fo: q('fo'),
    fhi: q('fhi'),
    flo: q('flo'),
    jitter: q('jitter'),
    shimmer: q('shimmer'),
    hnr: q('hnr'),
    dfa: q('dfa'),
  };

  const resultBox = document.getElementById('result');
  resultBox.className = 'result'; // reset
  resultBox.textContent = 'Running prediction...';

  try {
    // Replace with your deployed backend URL
    const resp = await fetch('https://parkinson-disease-detection-using.onrender.com/predict', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });

    if(!resp.ok){
      const err = await resp.json().catch(()=>({error:'Server error'}));
      resultBox.textContent = `Error: ${err.error || 'Unable to predict'}`;
      return;
    }

    const data = await resp.json();
    const label = data.prediction === 1 ? "Parkinson’s likely (model positive)" : "Parkinson’s unlikely (model negative)";
    resultBox.textContent = `Prediction: ${label}`;
    resultBox.classList.add(data.prediction === 1 ? 'bad' : 'ok');
  } catch(err){
    resultBox.textContent = 'Could not connect to backend.';
  }
});
