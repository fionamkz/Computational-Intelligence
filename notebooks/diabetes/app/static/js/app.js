const FEATURES = {
    gender:              { type: 'select', label: 'Gender',           options: ['Female', 'Male', 'Other'] },
    age:                 { type: 'number', label: 'Age',              min: 0,   max: 80,  step: 0.1 },
    hypertension:        { type: 'select', label: 'Hypertension',     options: ['0', '1'] },
    heart_disease:       { type: 'select', label: 'Heart Disease',    options: ['0', '1'] },
    smoking_history:     { type: 'select', label: 'Smoking History',  options: ['never','No Info','current','former','ever','not current'] },
    bmi:                 { type: 'number', label: 'BMI',              min: 10,  max: 96,  step: 0.01 },
    HbA1c_level:         { type: 'number', label: 'HbA1c Level',      min: 3.5, max: 9.0, step: 0.1 },
    blood_glucose_level: { type: 'number', label: 'Blood Glucose',    min: 80,  max: 300, step: 1 },
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prediction-form');
    const submitBtn = document.getElementById('submit-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const modalClose = document.getElementById('modal-close');

    modalClose.addEventListener('click', () => {
        modalOverlay.classList.add('hidden');
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) modalOverlay.classList.add('hidden');
    });

    Object.keys(FEATURES).forEach(name => {
        const el = document.getElementById(name);
        if (!el) return;

        const evt = FEATURES[name].type === 'select' ? 'change' : 'blur';
        el.addEventListener(evt, () => validateField(name));
        el.addEventListener('input', () => {
            const errorEl = document.getElementById(`${name}-error`);
            if (errorEl) errorEl.textContent = '';
            el.classList.remove('error');
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let hasErrors = false;
        const data = {};

        Object.keys(FEATURES).forEach(name => {
            const valid = validateField(name);
            if (!valid) {
                hasErrors = true;
            } else {
                const el = document.getElementById(name);
                const cfg = FEATURES[name];
                if (cfg.type === 'select') {
                    data[name] = el.value;
                } else {
                    data[name] = parseFloat(el.value);
                }
            }
        });

        if (hasErrors) {
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }

        submitBtn.classList.add('loading');
        submitBtn.querySelector('span').textContent = 'Analyzing...';

        try {
            const response = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Prediction failed');
            }

            renderResult(result);

        } catch (err) {
            renderError(err.message);
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.querySelector('span').textContent = 'Predict';
        }
    });

    function validateField(name) {
        const el = document.getElementById(name);
        const errorEl = document.getElementById(`${name}-error`);
        const cfg = FEATURES[name];

        if (!el || !errorEl) return true;

        const rawValue = el.value.trim();

        if (rawValue === '') {
            errorEl.textContent = `${cfg.label} is required`;
            el.classList.add('error');
            return false;
        }

        if (cfg.type === 'select') {
            if (!cfg.options.includes(rawValue)) {
                errorEl.textContent = `Please select a valid ${cfg.label}`;
                el.classList.add('error');
                return false;
            }
            errorEl.textContent = '';
            el.classList.remove('error');
            return true;
        }

        const value = parseFloat(rawValue);

        if (isNaN(value)) {
            errorEl.textContent = `${cfg.label} must be a valid number`;
            el.classList.add('error');
            return false;
        }

        if (value < cfg.min || value > cfg.max) {
            errorEl.textContent = `Must be between ${cfg.min} and ${cfg.max}`;
            el.classList.add('error');
            return false;
        }

        if (cfg.step === 1 && !Number.isInteger(value)) {
            errorEl.textContent = `${cfg.label} must be a whole number`;
            el.classList.add('error');
            return false;
        }

        errorEl.textContent = '';
        el.classList.remove('error');
        return true;
    }

    function renderResult(result) {
        const isDiabetes = result.prediction === 1;
        const noDiabProb = (result.probability.no_diabetes * 100).toFixed(1);
        const diabProb = (result.probability.diabetes * 100).toFixed(1);

        const description = isDiabetes
            ? 'The model indicates an elevated risk of diabetes based on the provided measurements. Please consult a healthcare professional.'
            : 'The model indicates a low risk of diabetes. Keep maintaining a healthy lifestyle.';

        modalContent.innerHTML = `
            <div class="result-box ${isDiabetes ? 'danger' : 'safe'}">
                <div class="result-title">${result.label}</div>
                <p class="result-text">${description}</p>
                <div class="prob-group">
                    <div class="prob-row">
                        <span class="prob-name">No Diabetes</span>
                        <div class="prob-track">
                            <div class="prob-fill green" style="width: 0%"></div>
                        </div>
                        <span class="prob-pct">${noDiabProb}%</span>
                    </div>
                    <div class="prob-row">
                        <span class="prob-name">Diabetes</span>
                        <div class="prob-track">
                            <div class="prob-fill red" style="width: 0%"></div>
                        </div>
                        <span class="prob-pct">${diabProb}%</span>
                    </div>
                </div>
            </div>
        `;

        modalOverlay.classList.remove('hidden');

        requestAnimationFrame(() => {
            const bars = modalContent.querySelectorAll('.prob-fill');
            bars[0].style.width = `${noDiabProb}%`;
            bars[1].style.width = `${diabProb}%`;
        });
    }

    function renderError(message) {
        modalContent.innerHTML = `
            <div class="result-box err">
                <div class="result-title">Error</div>
                <p class="result-text">${message}</p>
            </div>
        `;
        modalOverlay.classList.remove('hidden');
    }
});
