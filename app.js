const SCORE_STORAGE_KEY = 'scoreBoosterData';
const INITIAL_DATA_KEY = 'scoreBoosterInitialData';

let appData = {
    score: 0,
    improvements: [],
    features: {}
};

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    loadInitialData();
    loadAppData();
    renderUI();
    setupEventListeners();
    updateScoreDisplay();
});

function loadInitialData() {
    // Check if initial data is already loaded
    if (localStorage.getItem(INITIAL_DATA_KEY) === null) {
        // Use a placeholder for fetch, assuming data.json is available locally
        // In a real scenario, you'd use fetch if data.json was a separate file loaded via HTTP
        // For this offline context, we'll simulate loading it.
        const initialData = {
            improvements: [
                { id: 'optimize-images', name: 'Optimize Images', description: 'Compress images to reduce load times.', impact: 5, enabled: true },
                { id: 'minify-css', name: 'Minify CSS', description: 'Reduce the size of CSS files.', impact: 3, enabled: true },
                { id: 'minify-js', name: 'Minify JavaScript', description: 'Reduce the size of JavaScript files.', impact: 4, enabled: true },
                { id: 'enable-caching', name: 'Enable Browser Caching', description: 'Set appropriate cache headers for static assets.', impact: 7, enabled: true },
                { id: 'reduce-http', name: 'Reduce HTTP Requests', description: 'Combine files and use sprites.', impact: 6, enabled: true },
                { id: 'lazy-load', name: 'Implement Lazy Loading', description: 'Load images and other assets only when they are visible.', impact: 8, enabled: true },
                { id: 'server-response', name: 'Improve Server Response Time', description: 'Optimize backend code and database queries.', impact: 10, enabled: true },
                { id: 'cdn-usage', name: 'Use a Content Delivery Network (CDN)', description: 'Serve static assets from geographically distributed servers.', impact: 5, enabled: true }
            ],
            features: {
                'enable-dark-mode': { name: 'Dark Mode', enabled: false, impact: 1 },
                'enable-animations': { name: 'Smooth Animations', enabled: true, impact: -2 }
            }
        };
        localStorage.setItem(INITIAL_DATA_KEY, JSON.stringify(initialData));
    }
}

function loadAppData() {
    const savedData = localStorage.getItem(SCORE_STORAGE_KEY);
    if (savedData) {
        appData = JSON.parse(savedData);
    } else {
        // If no saved data, load from initial data
        const initialData = JSON.parse(localStorage.getItem(INITIAL_DATA_KEY));
        appData.improvements = initialData.improvements;
        appData.features = initialData.features;
        // Initialize score based on initial enabled items
        calculateScore();
    }
    // Ensure all improvements and features from initial data are present, even if not in saved data
    const initialData = JSON.parse(localStorage.getItem(INITIAL_DATA_KEY));
    initialData.improvements.forEach(initialImp => {
        if (!appData.improvements.some(imp => imp.id === initialImp.id)) {
            appData.improvements.push(initialImp);
        }
    });
    initialData.features.forEach(initialFeatId => {
        const initialFeat = initialData.features[initialFeatId];
        if (!appData.features.hasOwnProperty(initialFeatId)) {
            appData.features[initialFeatId] = initialFeat;
        }
    });
}

function saveAppData() {
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(appData));
}

// --- UI Rendering ---

function renderUI() {
    renderImprovementList();
    renderFeatureToggles();
}

function renderImprovementList() {
    const improvementListContainer = document.getElementById('improvement-list');
    improvementListContainer.innerHTML = ''; // Clear existing

    appData.improvements.forEach(imp => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('improvement-item');
        itemElement.innerHTML = `
            <div class="improvement-info">
                <h3>${imp.name}</h3>
                <p>${imp.description}</p>
            </div>
            <div class="improvement-controls">
                <span>Impact: +${imp.impact}</span>
                <label class="switch">
                    <input type="checkbox" data-id="${imp.id}" ${imp.enabled ? 'checked' : ''}>
                    <span class="slider round"></span>
                </label>
            </div>
        `;
        improvementListContainer.appendChild(itemElement);
    });
}

function renderFeatureToggles() {
    const featureTogglesContainer = document.getElementById('feature-toggles');
    featureTogglesContainer.innerHTML = ''; // Clear existing

    Object.keys(appData.features).forEach(featureId => {
        const feature = appData.features[featureId];
        const featureElement = document.createElement('div');
        featureElement.classList.add('feature-toggle-item');
        featureElement.innerHTML = `
            <label>${feature.name}</label>
            <label class="switch">
                <input type="checkbox" data-id="${featureId}" ${feature.enabled ? 'checked' : ''}>
                <span class="slider round"></span>
            </label>
        `;
        featureTogglesContainer.appendChild(featureElement);
    });
}

function updateScoreDisplay() {
    const scoreValueElement = document.getElementById('score-value');
    const scoreMessageElement = document.getElementById('score-message');
    const scoreCircle = document.getElementById('score-circle');

    scoreValueElement.textContent = appData.score;

    // Update circle color and animation
    scoreCircle.style.setProperty('--score', appData.score);
    scoreCircle.classList.remove('animate-score'); // Remove to re-trigger animation
    void scoreCircle.offsetWidth; // Trigger reflow
    scoreCircle.classList.add('animate-score');

    let message = '';
    if (appData.score < 50) {
        message = "Performance needs significant improvement!";
    } else if (appData.score < 75) {
        message = "Good progress, but there's room to grow.";
    } else if (appData.score < 90) {
        message = "Excellent! Almost there!";
    } else if (appData.score >= 99) {
        message = "Congratulations! You've achieved peak performance!";
    } else {
        message = "Keep optimizing for the best results!";
    }
    scoreMessageElement.textContent = message;
}

// --- Event Listeners ---

function setupEventListeners() {
    document.getElementById('calculate-score-btn').addEventListener('click', () => {
        calculateScore();
        updateScoreDisplay();
        saveAppData();
        // Add a subtle visual feedback for recalculation
        document.getElementById('calculate-score-btn').classList.add('clicked');
        setTimeout(() => {
            document.getElementById('calculate-score-btn').classList.remove('clicked');
        }, 300);
    });

    document.getElementById('reset-data-btn').addEventListener('click', () => {
        if (confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
            localStorage.removeItem(SCORE_STORAGE_KEY);
            localStorage.removeItem(INITIAL_DATA_KEY); // Also reset initial data to ensure fresh start
            loadInitialData(); // Reload initial data
            loadAppData(); // Reload app data from fresh initial data
            renderUI();
            updateScoreDisplay();
            // Add a subtle visual feedback for reset
            document.getElementById('reset-data-btn').classList.add('clicked');
            setTimeout(() => {
                document.getElementById('reset-data-btn').classList.remove('clicked');
            }, 300);
        }
    });

    // Event delegation for improvement toggles
    document.getElementById('improvement-list').addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            const id = event.target.dataset.id;
            const improvement = appData.improvements.find(imp => imp.id === id);
            if (improvement) {
                improvement.enabled = event.target.checked;
                calculateScore();
                updateScoreDisplay();
                saveAppData();
            }
        }
    });

    // Event delegation for feature toggles
    document.getElementById('feature-toggles').addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            const id = event.target.dataset.id;
            const feature = appData.features[id];
            if (feature) {
                feature.enabled = event.target.checked;
                calculateScore();
                updateScoreDisplay();
                saveAppData();
            }
        }
    });
}

// --- Core Logic ---

function calculateScore() {
    let totalImpact = 0;
    let featureImpact = 0;

    // Calculate impact from improvements
    appData.improvements.forEach(imp => {
        if (imp.enabled) {
            totalImpact += imp.impact;
        }
    });

    // Calculate impact from features
    Object.keys(appData.features).forEach(featureId => {
        const feature = appData.features[featureId];
        if (feature.enabled) {
            featureImpact += feature.impact;
        } else {
            // If feature is disabled, its impact is negative
            featureImpact += feature.impact; // This will be a negative addition
        }
    });

    // Base score is 100. Deduct for negative impacts and add for positive impacts.
    // We want to reach 99%, so let's aim for a calculation that allows this.
    // A simple model: start with a base, add improvements, subtract feature penalties.
    // Let's assume a base score of 70, and improvements add to it. Features can modify it.
    let calculatedScore = 70; // Starting base score

    // Add impact from enabled improvements
    appData.improvements.forEach(imp => {
        if (imp.enabled) {
            calculatedScore += imp.impact;
        }
    });

    // Adjust score based on feature toggles
    Object.keys(appData.features).forEach(featureId => {
        const feature = appData.features[featureId];
        if (feature.enabled) {
            calculatedScore += feature.impact; // Positive impact for enabled features
        } else {
            calculatedScore += feature.impact; // Negative impact for disabled features (e.g., animations might slow down)
        }
    });

    // Clamp the score between 0 and 100
    appData.score = Math.max(0, Math.min(100, calculatedScore));

    // Ensure we can reach 99%
    // If the current score is already high, and we have features that might reduce it,
    // we need to ensure the target of 99% is achievable.
    // For this example, let's assume the improvements are designed to push towards 99%.
    // If the score calculation results in > 99, cap it at 99 for the "target" feel.
    if (appData.score > 99) {
        appData.score = 99;
    }

    return appData.score;
}