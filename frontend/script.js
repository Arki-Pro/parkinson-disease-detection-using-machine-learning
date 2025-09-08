document.getElementById('patientDataForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const feature1 = parseFloat(document.getElementById('feature1').value);
  const feature2 = parseFloat(document.getElementById('feature2').value);
  const feature3 = parseFloat(document.getElementById('feature3').value);

  try {
    const response = await fetch('', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feature1, feature2, feature3 }),
    });

    const result = await response.json();
    document.getElementById('result').innerText = `Prediction: ${result.prediction}`;
  } catch (error) {
    document.getElementById('result').innerText = "Error: Could not connect to backend.";
  }
