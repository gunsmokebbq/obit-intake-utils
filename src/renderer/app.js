// Application state
let config = {
  apiKey: '',
  environment: 'prod',
  defaultSource: '',
  defaultProvider: '',
  defaultOwner: ''
};

// DOM Elements
const form = document.getElementById('obituary-form');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings');
const cancelSettingsBtn = document.getElementById('cancel-settings');
const saveSettingsBtn = document.getElementById('save-settings');
const settingsForm = document.getElementById('settings-form');
const clearBtn = document.getElementById('clear-btn');
const publishBtn = document.getElementById('publish-btn');
const statusMessage = document.getElementById('status-message');
const resultsSection = document.getElementById('results-section');
const sourceTypeSelect = document.getElementById('source-type');
const publisherFields = document.getElementById('publisher-fields');

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
  await loadConfig();
  setupEventListeners();
  populateDefaults();
});

// Load configuration
async function loadConfig() {
  try {
    config = await window.electronAPI.getConfig();
    if (!config.apiKey) {
      showStatus('Please configure your API key in Settings before publishing.', 'warning');
    }
  } catch (error) {
    console.error('Error loading config:', error);
    showStatus('Error loading configuration. Please check Settings.', 'error');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Settings modal
  settingsBtn.addEventListener('click', () => {
    openSettingsModal();
  });
  
  closeSettingsBtn.addEventListener('click', closeSettingsModal);
  cancelSettingsBtn.addEventListener('click', closeSettingsModal);
  
  saveSettingsBtn.addEventListener('click', async () => {
    await saveSettings();
  });
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await publishObituary();
  });
  
  // Clear form
  clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all form data?')) {
      form.reset();
      resultsSection.classList.add('hidden');
      statusMessage.classList.add('hidden');
      populateDefaults();
    }
  });
  
  // Source type change - show/hide publisher fields
  sourceTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'publisher') {
      publisherFields.classList.remove('hidden');
      // Mark publisher fields as required
      ['provider', 'provider-reference-id', 'owner', 'owner-reference-id'].forEach(id => {
        const field = document.getElementById(id);
        field.required = true;
      });
    } else {
      publisherFields.classList.add('hidden');
      // Remove required from publisher fields
      ['provider', 'provider-reference-id', 'owner', 'owner-reference-id'].forEach(id => {
        const field = document.getElementById(id);
        field.required = false;
      });
    }
  });
  
  // Close modal on outside click
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeSettingsModal();
    }
  });
}

// Populate default values from config
function populateDefaults() {
  if (config.defaultSource) {
    document.getElementById('source').value = config.defaultSource;
  }
  if (config.defaultProvider) {
    document.getElementById('provider').value = config.defaultProvider;
  }
  if (config.defaultOwner) {
    document.getElementById('owner').value = config.defaultOwner;
  }
}

// Settings modal functions
function openSettingsModal() {
  document.getElementById('settings-api-key').value = config.apiKey || '';
  document.getElementById('settings-environment').value = config.environment || 'prod';
  document.getElementById('settings-default-source').value = config.defaultSource || '';
  document.getElementById('settings-default-provider').value = config.defaultProvider || '';
  document.getElementById('settings-default-owner').value = config.defaultOwner || '';
  settingsModal.classList.remove('hidden');
}

function closeSettingsModal() {
  settingsModal.classList.add('hidden');
  settingsForm.reset();
}

async function saveSettings() {
  const newConfig = {
    apiKey: document.getElementById('settings-api-key').value.trim(),
    environment: document.getElementById('settings-environment').value,
    defaultSource: document.getElementById('settings-default-source').value.trim(),
    defaultProvider: document.getElementById('settings-default-provider').value.trim(),
    defaultOwner: document.getElementById('settings-default-owner').value.trim()
  };
  
  if (!newConfig.apiKey) {
    showStatus('API key is required', 'error');
    return;
  }
  
  try {
    const result = await window.electronAPI.saveConfig(newConfig);
    if (result.success) {
      config = newConfig;
      closeSettingsModal();
      showStatus('Settings saved successfully', 'success');
      populateDefaults();
    } else {
      showStatus(`Error saving settings: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings', 'error');
  }
}

// Publish obituary
async function publishObituary() {
  if (!config.apiKey) {
    showStatus('Please configure your API key in Settings first.', 'error');
    openSettingsModal();
    return;
  }
  
  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // Build payload
  const payload = buildPayload();
  
  if (!payload) {
    return; // Validation failed
  }
  
  // Disable publish button and show loading
  publishBtn.disabled = true;
  publishBtn.innerHTML = '<span class="spinner"></span> Publishing...';
  statusMessage.classList.add('hidden');
  resultsSection.classList.add('hidden');
  
  try {
    const result = await window.electronAPI.publishObituary({
      apiKey: config.apiKey,
      environment: config.environment,
      payload: payload
    });
    
    if (result.success) {
      showSuccess(result.data);
    } else {
      showError(result.error, result.statusCode);
    }
  } catch (error) {
    console.error('Error publishing obituary:', error);
    showError(error.message || 'An unexpected error occurred');
  } finally {
    publishBtn.disabled = false;
    publishBtn.textContent = 'Publish Obituary';
  }
}

// Build payload from form data
function buildPayload() {
  const payload = {
    person: {
      name: {}
    },
    obituary: {},
    source_info: {}
  };
  
  // Person name
  const namePrefix = document.getElementById('name-prefix').value.trim();
  const nameFirst = document.getElementById('name-first').value.trim();
  const nameMiddle = document.getElementById('name-middle').value.trim();
  const nameLast = document.getElementById('name-last').value.trim();
  const nameMaiden = document.getElementById('name-maiden').value.trim();
  const nameNickname = document.getElementById('name-nickname').value.trim();
  const nameSuffix = document.getElementById('name-suffix').value.trim();
  
  if (!nameFirst || !nameLast) {
    showStatus('First name and last name are required', 'error');
    return null;
  }
  
  if (namePrefix) payload.person.name.prefix = namePrefix;
  payload.person.name.first = nameFirst;
  if (nameMiddle) payload.person.name.middle = nameMiddle;
  payload.person.name.last = nameLast;
  if (nameMaiden) payload.person.name.maiden = nameMaiden;
  if (nameNickname) payload.person.name.nickname = nameNickname;
  if (nameSuffix) payload.person.name.suffix = nameSuffix;
  
  // Dates and age
  const dateOfBirth = document.getElementById('date-of-birth').value.trim();
  const dateOfDeath = document.getElementById('date-of-death').value.trim();
  const age = document.getElementById('age').value;
  
  if (dateOfBirth) {
    // Validate format MMDDYYYY
    if (!/^(0[1-9]|1[0-2]|00)(0[1-9]|[12][0-9]|3[01]|00)(1[7-9]|20)\d{2}$/.test(dateOfBirth)) {
      showStatus('Date of birth must be in MMDDYYYY format', 'error');
      return null;
    }
    payload.person.date_of_birth = dateOfBirth;
  }
  
  if (dateOfDeath) {
    if (!/^(0[1-9]|1[0-2]|00)(0[1-9]|[12][0-9]|3[01]|00)(1[7-9]|20)\d{2}$/.test(dateOfDeath)) {
      showStatus('Date of death must be in MMDDYYYY format', 'error');
      return null;
    }
    payload.person.date_of_death = dateOfDeath;
  }
  
  if (age) {
    payload.person.age = parseInt(age);
  }
  
  // Obituary
  const obituaryText = document.getElementById('obituary-text').value.trim();
  const publishStartDate = document.getElementById('publish-start-date').value;
  const publishEndDate = document.getElementById('publish-end-date').value;
  const printStartDate = document.getElementById('print-start-date').value;
  const printEndDate = document.getElementById('print-end-date').value;
  const obituaryType = document.getElementById('obituary-type').value;
  const emailAddress = document.getElementById('email-address').value.trim();
  
  if (!obituaryText) {
    showStatus('Obituary text is required', 'error');
    return null;
  }
  
  if (!publishStartDate) {
    showStatus('Publish start date is required', 'error');
    return null;
  }
  
  payload.obituary.obituary_text = obituaryText;
  payload.obituary.publish_start_date = publishStartDate;
  if (publishEndDate) payload.obituary.publish_end_date = publishEndDate;
  if (printStartDate) payload.obituary.print_start_date = printStartDate;
  if (printEndDate) payload.obituary.print_end_date = printEndDate;
  if (obituaryType) payload.obituary.obituary_type = obituaryType;
  if (emailAddress) payload.obituary.email_address = emailAddress;
  
  // Source info
  const sourceType = document.getElementById('source-type').value;
  const source = document.getElementById('source').value.trim();
  const sourceReferenceId = document.getElementById('source-reference-id').value.trim();
  const sourceUrl = document.getElementById('source-url').value.trim();
  
  if (!sourceType || !source || !sourceReferenceId) {
    showStatus('Source type, source, and source reference ID are required', 'error');
    return null;
  }
  
  payload.source_info.source_type = sourceType;
  payload.source_info.source = source;
  payload.source_info.source_reference_id = sourceReferenceId;
  if (sourceUrl) payload.source_info.source_url = sourceUrl;
  
  // Publisher-specific fields
  if (sourceType === 'publisher') {
    const provider = document.getElementById('provider').value.trim();
    const providerReferenceId = document.getElementById('provider-reference-id').value.trim();
    const owner = document.getElementById('owner').value.trim();
    const ownerReferenceId = document.getElementById('owner-reference-id').value.trim();
    
    if (!provider || !providerReferenceId || !owner || !ownerReferenceId) {
      showStatus('All publisher fields (provider, provider reference ID, owner, owner reference ID) are required', 'error');
      return null;
    }
    
    payload.source_info.provider = provider;
    payload.source_info.provider_reference_id = providerReferenceId;
    payload.source_info.owner = owner;
    payload.source_info.owner_reference_id = ownerReferenceId;
  }
  
  // Version (timestamp)
  payload.version = new Date().toISOString();
  
  return payload;
}

// Show success message
function showSuccess(data) {
  showStatus('Obituary published successfully!', 'success');
  
  const resultsContent = document.getElementById('results-content');
  resultsContent.innerHTML = `
    <div class="result-item">
      <h3>✅ Publication Successful</h3>
      <p><strong>Obituary ID:</strong> ${data.obituary_id}</p>
      ${data.redirector_url ? `<p><strong>Redirector URL:</strong> <a href="${data.redirector_url}" target="_blank">${data.redirector_url}</a></p>` : ''}
      ${data.warnings && data.warnings.length > 0 ? `<p><strong>Warnings:</strong> ${JSON.stringify(data.warnings)}</p>` : ''}
    </div>
  `;
  
  resultsSection.classList.remove('hidden');
  
  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show error message
function showError(error, statusCode) {
  let errorMessage = 'Error publishing obituary';
  
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (Array.isArray(error)) {
    errorMessage = error.join(', ');
  }
  
  if (statusCode) {
    errorMessage = `HTTP ${statusCode}: ${errorMessage}`;
  }
  
  showStatus(errorMessage, 'error');
  
  const resultsContent = document.getElementById('results-content');
  resultsContent.innerHTML = `
    <div class="result-item" style="border-left-color: #e74c3c;">
      <h3>❌ Publication Failed</h3>
      <p><strong>Error:</strong> ${errorMessage}</p>
    </div>
  `;
  
  resultsSection.classList.remove('hidden');
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show status message
function showStatus(message, type = 'success') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.classList.remove('hidden');
  
  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      statusMessage.classList.add('hidden');
    }, 5000);
  }
}

