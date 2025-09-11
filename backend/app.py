from flask import Flask, request, jsonify
import joblib
import numpy as np

# Initialize Flask app
app = Flask(__name__)

# Load the trained ML model and scaler
model = joblib.load("model.pkl") # Your trained classifier
scaler = joblib.load("scaler.pkl") # StandardScaler or MinMaxScaler used during training

@app.route("/")
def home():
    return "Backend is running!"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        # Extract features in the correct order
        features = [
            data["fo"],
            data["fhi"],
            data["flo"],
            data["jitter"],
            data["shimmer"],
            data["hnr"],
            data["dfa"]
        ]

        # Convert to numpy array and reshape
        x = np.array(features).reshape(1, -1)

        # Scale the input
        x_scaled = scaler.transform(x)

        # Make prediction
        pred = model.predict(x_scaled)[0]
        result = int(pred) # Ensure JSON serializable

        return jsonify({"prediction": result})

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True)
