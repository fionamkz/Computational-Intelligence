import os
import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, render_template, send_from_directory

app = Flask(__name__, static_folder='static', template_folder='templates')

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'diabetes_model.joblib')
model = joblib.load(MODEL_PATH)

FEATURE_NAMES = [
    'age', 'bmi', 'HbA1c_level', 'blood_glucose_level',
    'hypertension', 'heart_disease', 'gender', 'smoking_history'
]

FEATURE_RANGES = {
    'gender': {'type': 'select', 'label': 'Gender', 'options': ['Female', 'Male', 'Other'], 'unit': ''},
    'age': {'min': 0, 'max': 80, 'type': 'float', 'label': 'Age', 'unit': 'years'},
    'hypertension': {'type': 'select', 'label': 'Hypertension', 'options': ['0', '1'], 'unit': ''},
    'heart_disease': {'type': 'select', 'label': 'Heart Disease', 'options': ['0', '1'], 'unit': ''},
    'smoking_history': {'type': 'select', 'label': 'Smoking History', 'options': ['never', 'No Info', 'current', 'former', 'ever', 'not current'], 'unit': ''},
    'bmi': {'min': 10, 'max': 96, 'type': 'float', 'label': 'BMI', 'unit': 'kg/m²'},
    'HbA1c_level': {'min': 3.5, 'max': 9.0, 'type': 'float', 'label': 'HbA1c Level', 'unit': '%'},
    'blood_glucose_level': {'min': 80, 'max': 300, 'type': 'int', 'label': 'Blood Glucose Level', 'unit': 'mg/dL'},
}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        missing = [f for f in FEATURE_NAMES if f not in data]
        if missing:
            return jsonify({'error': f'Missing features: {", ".join(missing)}'}), 400

        values = {}
        errors = []
        for feature in FEATURE_NAMES:
            raw_value = data[feature]
            config = FEATURE_RANGES[feature]

            if raw_value is None or raw_value == '':
                errors.append(f'{config["label"]} is required')
                continue

            if config['type'] == 'select':
                if str(raw_value) not in config['options']:
                    errors.append(f'{config["label"]} must be one of: {", ".join(config["options"])}')
                    continue
                # convert binary selects to int
                if feature in ('hypertension', 'heart_disease'):
                    values[feature] = int(raw_value)
                else:
                    values[feature] = str(raw_value)
            else:
                try:
                    value = float(raw_value)
                except (ValueError, TypeError):
                    errors.append(f'{config["label"]} must be a number')
                    continue

                if value < config['min'] or value > config['max']:
                    errors.append(
                        f'{config["label"]} must be between {config["min"]} and {config["max"]}'
                    )
                    continue

                if config['type'] == 'int' and value != int(value):
                    errors.append(f'{config["label"]} must be a whole number')
                    continue

                values[feature] = value

        if errors:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400

        input_df = pd.DataFrame([values], columns=FEATURE_NAMES)

        prediction = int(model.predict(input_df)[0])
        probabilities = model.predict_proba(input_df)[0]

        return jsonify({
            'prediction': prediction,
            'label': 'Diabetes' if prediction == 1 else 'No Diabetes',
            'probability': {
                'no_diabetes': round(float(probabilities[0]), 4),
                'diabetes': round(float(probabilities[1]), 4)
            }
        })

    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@app.route('/api/features', methods=['GET'])
def get_features():
    return jsonify(FEATURE_RANGES)


if __name__ == '__main__':
    print("Loading model from:", MODEL_PATH)
    print("Model loaded successfully!")
    app.run(debug=True, host='0.0.0.0', port=5000)
