import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

# ======== Load dataset ========
# You can replace this with the real Parkinson’s dataset CSV
# For now, I'll create a dummy dataset with random values
def create_dummy_dataset():
    np.random.seed(42)
    size = 200
    data = {
        "fo": np.random.uniform(100, 300, size),
        "fhi": np.random.uniform(200, 400, size),
        "flo": np.random.uniform(80, 150, size),
        "jitter": np.random.uniform(0.001, 0.05, size),
        "shimmer": np.random.uniform(0.01, 0.1, size),
        "hnr": np.random.uniform(10, 30, size),
        "dfa": np.random.uniform(1.0, 1.5, size),
        "status": np.random.choice([0, 1], size=size) # 0 = healthy, 1 = Parkinson’s
    }
    return pd.DataFrame(data)

df = create_dummy_dataset()

# ======== Split features & target ========
X = df[["fo", "fhi", "flo", "jitter", "shimmer", "hnr", "dfa"]]
y = df["status"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ======== Train model ========
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# ======== Save model ========
joblib.dump(model, "model.pkl")

print("✅ Model trained and saved as model.pkl"
