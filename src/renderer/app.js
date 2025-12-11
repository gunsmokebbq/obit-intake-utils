// Application state
let config = {
  apiKey: '',
  environment: 'prod',
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
// Removed sourceTypeSelect and publisherFields - no longer needed

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
      document.getElementById('age').value = ''; // Clear calculated age
      resultsSection.classList.add('hidden');
      statusMessage.classList.add('hidden');
      populateDefaults();
    }
  });
  
  // Source type is now fixed to "publisher", no event listener needed
  
  // Age calculation from DOB and DOD
  const dateOfBirthInput = document.getElementById('date-of-birth');
  const dateOfDeathInput = document.getElementById('date-of-death');
  const ageInput = document.getElementById('age');
  
  dateOfBirthInput.addEventListener('blur', calculateAge);
  dateOfDeathInput.addEventListener('blur', calculateAge);
  
  // Close modal on outside click
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeSettingsModal();
    }
  });
}

// Populate default values from config
function populateDefaults() {
  if (config.defaultOwner) {
    document.getElementById('owner').value = config.defaultOwner;
  }
  // Set default obituary type to "paid"
  document.getElementById('obituary-type').value = 'paid';
}

// Calculate age from date of birth and date of death
function calculateAge() {
  const dobStr = document.getElementById('date-of-birth').value.trim();
  const dodStr = document.getElementById('date-of-death').value.trim();
  const ageInput = document.getElementById('age');
  
  // Clear age if we don't have both dates
  if (!dobStr || !dodStr) {
    ageInput.value = '';
    return;
  }
  
  // Parse MMDDYYYY format
  // Handle partial dates (00 for unknown month/day)
  const parseMMDDYYYY = (dateStr) => {
    if (!/^(0[1-9]|1[0-2]|00)(0[1-9]|[12][0-9]|3[01]|00)(1[7-9]|20)\d{2}$/.test(dateStr)) {
      return null;
    }
    
    const month = parseInt(dateStr.substring(0, 2));
    const day = parseInt(dateStr.substring(2, 4));
    const year = parseInt(dateStr.substring(4, 8));
    
    // If month or day is 00, we can't calculate exact age
    if (month === 0 || day === 0) {
      return { year, month, day, isPartial: true };
    }
    
    return { year, month, day, isPartial: false };
  };
  
  const dob = parseMMDDYYYY(dobStr);
  const dod = parseMMDDYYYY(dodStr);
  
  if (!dob || !dod) {
    ageInput.value = '';
    return;
  }
  
  // If either date is partial, we can only estimate based on years
  if (dob.isPartial || dod.isPartial) {
    const age = dod.year - dob.year;
    if (age >= 0 && age <= 150) {
      ageInput.value = age;
    } else {
      ageInput.value = '';
    }
    return;
  }
  
  // Calculate exact age
  try {
    const birthDate = new Date(dob.year, dob.month - 1, dob.day);
    const deathDate = new Date(dod.year, dod.month - 1, dod.day);
    
    if (isNaN(birthDate.getTime()) || isNaN(deathDate.getTime())) {
      ageInput.value = '';
      return;
    }
    
    if (deathDate < birthDate) {
      ageInput.value = '';
      return;
    }
    
    let age = dod.year - dob.year;
    const monthDiff = dod.month - dob.month;
    const dayDiff = dod.day - dob.day;
    
    // Adjust if birthday hasn't occurred yet in death year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    
    if (age >= 0 && age <= 150) {
      ageInput.value = age;
    } else {
      ageInput.value = '';
    }
  } catch (error) {
    console.error('Error calculating age:', error);
    ageInput.value = '';
  }
}

// Settings modal functions
function openSettingsModal() {
  document.getElementById('settings-api-key').value = config.apiKey || '';
  document.getElementById('settings-environment').value = config.environment || 'prod';
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
  
  // Include age if calculated or manually entered
  if (age) {
    const ageNum = parseInt(age);
    if (!isNaN(ageNum) && ageNum >= 0 && ageNum <= 150) {
      payload.person.age = ageNum;
    }
  }
  
  // Obituary
  const obituaryText = document.getElementById('obituary-text').value.trim();
  const publishStartDate = document.getElementById('publish-start-date').value;
  const publishEndDate = document.getElementById('publish-end-date').value;
  const obituaryType = document.getElementById('obituary-type').value || 'paid'; // Default to 'paid'
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
  payload.obituary.obituary_type = obituaryType; // Always include, defaults to 'paid'
  if (emailAddress) payload.obituary.email_address = emailAddress;
  
  // Source info - fixed to publisher/ipublish for first release
  const sourceReferenceId = document.getElementById('source-reference-id').value.trim();
  
  if (!sourceReferenceId) {
    showStatus('Source reference ID is required', 'error');
    return null;
  }
  
  // Source type is always "publisher" and source is always "ipublish" for first release
  payload.source_info.source_type = 'publisher';
  payload.source_info.source = 'ipublish';
  payload.source_info.source_reference_id = sourceReferenceId;
  
  // Optional owner fields
  const owner = document.getElementById('owner').value.trim();
  const ownerReferenceId = document.getElementById('owner-reference-id').value.trim();
  
  // Only include owner fields if at least one is provided
  if (owner || ownerReferenceId) {
    // If one is provided, both should ideally be provided, but we'll allow partial
    if (owner) payload.source_info.owner = owner;
    if (ownerReferenceId) payload.source_info.owner_reference_id = ownerReferenceId;
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

