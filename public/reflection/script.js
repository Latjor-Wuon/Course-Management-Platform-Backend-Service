// Global variables
let currentLanguage = 'en';
let isSubmitting = false;

// DOM Elements
const languageButtons = document.querySelectorAll('.lang-btn');
const reflectionForm = document.getElementById('reflection-form');
const saveDraftBtn = document.getElementById('save-draft');
const successModal = document.getElementById('success-modal');
const closeModalBtn = document.getElementById('close-modal');
const currentDateSpan = document.getElementById('current-date');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Set current date
    setCurrentDate();
    
    // Load saved language preference
    loadLanguagePreference();
    
    // Load saved draft
    loadDraft();
    
    // Update progress stats
    updateProgressStats();
    
    // Setup event listeners
    setupEventListeners();
    
    // Apply initial translations
    applyTranslations(currentLanguage);
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Language switcher
    languageButtons.forEach(btn => {
        btn.addEventListener('click', handleLanguageSwitch);
    });
    
    // Form submission
    reflectionForm.addEventListener('submit', handleFormSubmission);
    
    // Save draft
    saveDraftBtn.addEventListener('click', handleSaveDraft);
    
    // Modal close
    closeModalBtn.addEventListener('click', closeModal);
    
    // Auto-save on input
    const textareas = reflectionForm.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', debounce(autoSaveDraft, 2000));
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Handle language switching
 */
function handleLanguageSwitch(event) {
    const selectedLang = event.target.dataset.lang;
    
    if (selectedLang && selectedLang !== currentLanguage) {
        currentLanguage = selectedLang;
        
        // Update active button
        languageButtons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Apply translations
        applyTranslations(currentLanguage);
        
        // Save preference
        saveLanguagePreference(currentLanguage);
        
        // Update document language
        document.documentElement.lang = currentLanguage;
    }
}

/**
 * Apply translations to the page
 */
function applyTranslations(language) {
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
        const key = element.dataset.i18n;
        const translation = getTranslation(key, language);
        
        if (translation) {
            element.textContent = translation;
        }
    });
    
    // Handle placeholders
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
        const key = element.dataset.i18nPlaceholder;
        const translation = getTranslation(key, language);
        
        if (translation) {
            element.placeholder = translation;
        }
    });
}

/**
 * Get translation by key
 */
function getTranslation(key, language) {
    const keys = key.split('.');
    let translation = translations[language];
    
    for (const k of keys) {
        translation = translation?.[k];
    }
    
    return translation;
}

/**
 * Handle form submission
 */
async function handleFormSubmission(event) {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    const formData = getFormData();
    
    // Validate form
    if (!validateForm(formData)) {
        showMessage(getTranslation('messages.required_fields', currentLanguage), 'error');
        return;
    }
    
    isSubmitting = true;
    reflectionForm.classList.add('loading');
    
    try {
        // Simulate API call
        await simulateSubmission(formData);
        
        // Clear form and draft
        clearForm();
        clearDraft();
        
        // Update progress
        incrementProgressStats();
        
        // Show success modal
        showSuccessModal();
        
    } catch (error) {
        console.error('Submission error:', error);
        showMessage(getTranslation('messages.submission_error', currentLanguage), 'error');
    } finally {
        isSubmitting = false;
        reflectionForm.classList.remove('loading');
    }
}

/**
 * Handle save draft
 */
function handleSaveDraft() {
    const formData = getFormData();
    saveDraft(formData);
    showMessage(getTranslation('messages.draft_saved', currentLanguage), 'success');
}

/**
 * Auto-save draft
 */
function autoSaveDraft() {
    const formData = getFormData();
    if (Object.values(formData).some(value => value.trim())) {
        saveDraft(formData);
    }
}

/**
 * Get form data
 */
function getFormData() {
    return {
        question1: document.getElementById('question1').value,
        question2: document.getElementById('question2').value,
        question3: document.getElementById('question3').value
    };
}

/**
 * Validate form
 */
function validateForm(formData) {
    return Object.values(formData).every(value => value.trim().length > 0);
}

/**
 * Clear form
 */
function clearForm() {
    reflectionForm.reset();
}

/**
 * Save draft to localStorage
 */
function saveDraft(formData) {
    const draftData = {
        ...formData,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('reflection_draft', JSON.stringify(draftData));
}

/**
 * Load draft from localStorage
 */
function loadDraft() {
    const draftData = localStorage.getItem('reflection_draft');
    
    if (draftData) {
        try {
            const draft = JSON.parse(draftData);
            document.getElementById('question1').value = draft.question1 || '';
            document.getElementById('question2').value = draft.question2 || '';
            document.getElementById('question3').value = draft.question3 || '';
        } catch (error) {
            console.error('Error loading draft:', error);
        }
    }
}

/**
 * Clear draft from localStorage
 */
function clearDraft() {
    localStorage.removeItem('reflection_draft');
}

/**
 * Save language preference
 */
function saveLanguagePreference(language) {
    localStorage.setItem('preferred_language', language);
}

/**
 * Load language preference
 */
function loadLanguagePreference() {
    const savedLanguage = localStorage.getItem('preferred_language');
    
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
        
        // Update active button
        languageButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
        });
        
        // Update document language
        document.documentElement.lang = currentLanguage;
    }
}

/**
 * Set current date
 */
function setCurrentDate() {
    const today = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    
    currentDateSpan.textContent = today.toLocaleDateString(currentLanguage, options);
}

/**
 * Update progress statistics
 */
function updateProgressStats() {
    const stats = getProgressStats();
    
    document.getElementById('total-reflections').textContent = stats.total;
    document.getElementById('this-month').textContent = stats.thisMonth;
    document.getElementById('streak').textContent = stats.streak;
}

/**
 * Get progress statistics from localStorage
 */
function getProgressStats() {
    const stats = localStorage.getItem('reflection_stats');
    
    if (stats) {
        try {
            return JSON.parse(stats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
    
    return { total: 0, thisMonth: 0, streak: 0 };
}

/**
 * Increment progress statistics
 */
function incrementProgressStats() {
    const stats = getProgressStats();
    const today = new Date();
    const thisMonth = today.getMonth();
    
    stats.total += 1;
    
    // Check if this is the same month
    const lastSubmission = localStorage.getItem('last_reflection_date');
    if (lastSubmission) {
        const lastDate = new Date(lastSubmission);
        if (lastDate.getMonth() === thisMonth) {
            stats.thisMonth += 1;
        } else {
            stats.thisMonth = 1;
        }
    } else {
        stats.thisMonth = 1;
    }
    
    // Update streak
    if (lastSubmission) {
        const lastDate = new Date(lastSubmission);
        const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 7) {
            stats.streak += 1;
        } else {
            stats.streak = 1;
        }
    } else {
        stats.streak = 1;
    }
    
    localStorage.setItem('reflection_stats', JSON.stringify(stats));
    localStorage.setItem('last_reflection_date', today.toISOString());
    
    updateProgressStats();
}

/**
 * Show success modal
 */
function showSuccessModal() {
    successModal.classList.add('show');
}

/**
 * Close modal
 */
function closeModal() {
    successModal.classList.remove('show');
}

/**
 * Show message to user
 */
function showMessage(message, type = 'info') {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 500;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            messageEl.style.backgroundColor = '#10b981';
            break;
        case 'error':
            messageEl.style.backgroundColor = '#ef4444';
            break;
        default:
            messageEl.style.backgroundColor = '#6b7280';
    }
    
    document.body.appendChild(messageEl);
    
    // Remove after 4 seconds
    setTimeout(() => {
        messageEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 4000);
}

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + S for save draft
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        handleSaveDraft();
    }
    
    // Escape to close modal
    if (event.key === 'Escape' && successModal.classList.contains('show')) {
        closeModal();
    }
}

/**
 * Simulate form submission (replace with actual API call)
 */
async function simulateSubmission(formData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate success (90% success rate)
            if (Math.random() > 0.1) {
                resolve({
                    success: true,
                    id: Date.now(),
                    submittedAt: new Date().toISOString()
                });
            } else {
                reject(new Error('Simulated network error'));
            }
        }, 1500);
    });
}

/**
 * Debounce function for auto-save
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);
