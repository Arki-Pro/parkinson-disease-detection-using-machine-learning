document.getElementById('patientDataForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const f1 = parseFloat(document.getElementById('feature1').value);
    const f2 = parseFloat(document.getElementById('feature2').value);
    const f3 = parseFloat(document.getElementById('feature3').value);

    // Temporary mock prediction
    const result = (f1 + f2 + f3) % 2 === 0 ? "Likely Parkinson's" : "Unlikely Parkinson's";

    document.getElementById('result').innerText = `Prediction: ${result}`;
});
