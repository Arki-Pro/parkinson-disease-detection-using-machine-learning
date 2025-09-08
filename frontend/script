document.getElementById('patientDataForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const feature1 = parseFloat(document.getElementById('MDVP:Fo(Hz)').value);
  const feature2 = parseFloat(document.getElementById('MDVP:Fhi(Hz)').value);
  const feature3 = parseFloat(document.getElementById('MDVP:Flo(Hz)').value);

  const response = await fetch("https://your-backend.herokuapp.com/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "MDVP:Fo(Hz)": feature1,
      "MDVP:Fhi(Hz)": feature2,
      "MDVP:Flo(Hz)": feature3
    })
  });

  const result = await response.json();
  document.getElementById("result").innerText = result.prediction === 1 
    ? "⚠️ Model suggests signs of Parkinson's (educational only)" 
    : "✅ Model suggests healthy (educational only)";
});
