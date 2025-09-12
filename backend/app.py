from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import os

app = Flask(__name__)
CORS(app)

# Load pre-trained model and scaler
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'scaler.pkl')

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    try:
        # Extract features in correct order
        features = [
            data['fo'], 
            data['fhi'], 
            data['flo'], 
            data['jitter'], 
            data['shimmer'], 
            data['hnr'], 
            data['dfa']
        ]
        features_array = np.array(features).reshape(1, -1)

        # Typical healthy ranges (approximate)
healthy_ranges = {
    'fo': (120, 250), # Hz
    'fhi': (150, 300), # Hz
    'flo': (90, 200), # Hz
    'jitter': (0, 0.5), # %
    'shimmer': (0, 0.05),    
    'hnr': (20, 30), # dB
    'dfa': (0.9, 1.05)
}

# Compare input features to healthy ranges
feature_status = {}
for i, key in enumerate(['fo','fhi','flo','jitter','shimmer','hnr','dfa']):
    val = features[i]
    low, high = healthy_ranges[key]
    if val < low:
        feature_status[key] = 'Low'
    elif val > high:
        feature_status[key] = 'High'
    else:
        feature_status[key] = 'Normal'

# Include in response
return jsonify({'prediction': int(prediction), 'feature_status': feature_status})

        # Scale features
        features_scaled = scaler.transform(features_array)

        # Predict
        prediction = model.predict(features_scaled)[0]

        return jsonify({'prediction': int(prediction)})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
