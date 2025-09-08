document.getElementById('patientDataForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const feature1 = document.getElementById('feature1').value;
    const feature2 = document.getElementById('feature2').value;
    const feature3 = document.getElementById('feature3').value;

    // Temporary mock result for hackathon preview
    const prediction = Math.random() > 0.5 ? "Parkinson's Likely" : "No Parkinson's Detected";

    document.getElementById('result').innerText = `Prediction: ${prediction}`;

    // To integrate with real backend, uncomment below and replace URL
    /*
    const response = await fetch('https://your-backend-url/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            feature1: parseFloat(feature1),
            feature2: parseFloat(feature2),
            feature3: parseFloat(feature3)
        }),
    });
    const result = await response.json();
    document.getElementById('result').innerText = `Prediction: ${result.prediction}`;
    */
});
