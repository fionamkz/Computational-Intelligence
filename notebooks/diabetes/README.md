# Diabetes Risk Prediction

Diabetes risk prediction using the [Diabetes Prediction Dataset](https://www.kaggle.com/datasets/iammustafatz/diabetes-prediction-dataset) from Kaggle (~100,000 records).

## Dataset

The dataset contains 100,000 medical records with 8 features:

| Feature | Type | Description |
|---|---|---|
| gender | Categorical | Female, Male, Other |
| age | Numerical | Patient age (0–80) |
| hypertension | Binary | 0 = No, 1 = Yes |
| heart_disease | Binary | 0 = No, 1 = Yes |
| smoking_history | Categorical | never, No Info, current, former, ever, not current |
| bmi | Numerical | Body Mass Index (10–96) |
| HbA1c_level | Numerical | Hemoglobin A1c level (3.5–9.0) |
| blood_glucose_level | Numerical | Blood glucose (80–300 mg/dL) |
| diabetes | Target | 0 = No Diabetes, 1 = Diabetes |

## Project Structure

```
diabetes/
├── data/
│   └── diabetes_prediction_dataset.csv
├── notebooks/
│   └── diabetes_pipeline.ipynb
├── models/
│   └── diabetes_model.joblib
├── app/
│   ├── api.py
│   ├── templates/
│   │   └── index.html
│   └── static/
│       ├── css/style.css
│       ├── js/app.js
│       └── sidebar.png
├── requirements.txt
└── README.md
```

## Setup

```bash
pip install -r requirements.txt
cd app
python api.py
```

Open http://localhost:5000


| Deliverable | Location |
|---|---|
| Training Notebook | `notebooks/diabetes_pipeline.ipynb` |
| Serialized Model | `models/diabetes_model.joblib` |
| Inference App | `app/api.py` |
