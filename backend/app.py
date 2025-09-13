from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app) # allow cross-origin requests from your frontend

# Paths (assume model.pkl and scaler.pkl sit next to app.py)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

# Load model & scaler
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

# IMPORTANT: ensure this list matches the exact order your frontend sends fields
feature_keys = ["fo", "fhi", "flo", "jitter", "shimmer", "hnr", "dfa"]

# Optional: simple healthy ranges (for feature-status explanation)
healthy_ranges = {
    "fo": (110, 250),
    "fhi": (150, 320),
    "flo": (80, 200),
    "jitter": (0.0, 0.5),
    "shimmer": (0.0, 0.06),
    "hnr": (18, 35),
    "dfa": (0.6, 1.2),
}


@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "backend live"})

@app.route('/about')
def about():
    return render_template('about.html')


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(force=True)
    try:
        # 1) build ordered feature vector
        features = []
        for k in feature_keys:
            if k not in data:
                return jsonify({"error": f"missing feature {k}"}), 400
            try:
                features.append(float(data[k]))
            except:
                return jsonify({"error": f"feature {k} must be numeric"}), 400

        X = np.array(features).reshape(1, -1)

        # 2) scale (must match training scaler)
        Xs = scaler.transform(X)

        # 3) get probability (if available)
        if hasattr(model, "predict_proba"):
            proba_pos = float(model.predict_proba(Xs)[0][1])
        else:
            # fallback: binary 0/1 becomes 0.0 or 1.0
            pred_raw = int(model.predict(Xs)[0])
            proba_pos = 1.0 if pred_raw == 1 else 0.0

        # 4) final class using default 0.5 threshold (frontend will show percentage)
        prediction = 1 if proba_pos >= 0.5 else 0

        # 5) create feature_status map (human readable)
        feature_status = {}
        for i, k in enumerate(feature_keys):
            low, high = healthy_ranges.get(k, (None, None))
            v = features[i]
            if low is None:
                feature_status[k] = "Unknown"
            else:
                feature_status[k] = "Low" if v < low else ("High" if v > high else "Normal")

        return jsonify({
            "prediction": int(prediction),
            "probability": proba_pos,
            "feature_status": feature_status
        })

    except Exception as e:
        # be explicit about server errors for debugging
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("Starting Flask on port", port)
    app.run(host="0.0.0.0", port=port)
