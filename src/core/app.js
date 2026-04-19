import { loadConfig, updateConfig, ensurePath, resetConfig } from '../services/configService.js';
import { getElements, $, $$ } from '../utils/dom.js';
import { placeholderTokenHtml } from '../utils/text.js';
import {
    regenerateEditors,
    insertPlaceholderToken,
    expandTokenElement,
    refreshPreview,
    openMail,
    setActiveEditable,
    isApplying
} from './emailEditor.js';
import { populateActivitySelect, renderCheckboxes } from './formRenderer.js';
import { setLang } from './lang.js';
import { 
    textWithTokensToHtml,
    editorHtmlToRawTemplate
} from '../utils/text.js'

export let elements = null;
export let appConfig = null;
let pageSnapshot = null;

export async function initApp() {
    appConfig = await loadConfig();
    elements = getElements();
    
    populateActivitySelect();
    loadSettings();
    renderCheckboxes();
    regenerateEditors();
    bindEvents();

    pageSnapshot = takeSnapshot();

    const hash = window.location.hash.replace('#', '');
    if(hash) {
        switchPage(`${hash}-page`);
    }
}

function loadSettings() {
    const regex = new RegExp(appConfig.settings.global.placeholderPattern, 'g');

    // Home
    if (!elements.ccRecipients.value.trim() || elements.ccRecipients.dataset.autofilled === 'true') {
        elements.ccRecipients.value = appConfig.settings.global.defaultCc;
        elements.ccRecipients.dataset.autofilled = 'true';
    }

    // Settings — Global
    elements.defaultCcInput.value = appConfig.settings.global.defaultCc;
    elements.minNameLengthInput.value = appConfig.settings.global.minNameLength;
    elements.placeholderPatternInput.value = appConfig.settings.global.placeholderPattern;

    // Settings — IT
    elements.fallbackNameInput_it.value = appConfig.settings.it.fallbackName;
    elements.signatureInput_it.value = appConfig.settings.it.email.signature;
    elements.subjectTemplateInput_it.innerHTML = textWithTokensToHtml(appConfig.settings.it.email.subject, regex);
    elements.bodyTemplateInput_it.innerHTML = textWithTokensToHtml(appConfig.settings.it.email.body, regex);
    elements.notesLabelInput_it.value = appConfig.settings.it.email.notes;

    // Settings — EN
    elements.fallbackNameInput_en.value = appConfig.settings.en.fallbackName;
    elements.signatureInput_en.value = appConfig.settings.en.email.signature;
    elements.subjectTemplateInput_en.innerHTML = textWithTokensToHtml(appConfig.settings.en.email.subject, regex);
    elements.bodyTemplateInput_en.innerHTML = textWithTokensToHtml(appConfig.settings.en.email.body, regex);
    elements.notesLabelInput_en.value = appConfig.settings.en.email.notes;
}

function takeSnapshot() {
    return JSON.stringify({
        subject: elements.subjectEditor.innerHTML,
        body: elements.bodyEditor.innerHTML,
        ticketId: elements.ticketId.value,
        to: elements.toRecipients.value,
        cc: elements.ccRecipients.value,
        name: elements.recipientNameOverride.value,
        notes: elements.notes.value
    });
}

function hasUnsavedChanges() {
    return pageSnapshot !== null && pageSnapshot !== takeSnapshot();
}
 
function resetForm() {
    appConfig = structuredClone(appConfig);
 
    elements.ticketId.value = '';
    elements.toRecipients.value = '';
    elements.ccRecipients.value = appConfig.settings.global.defaultCc;
    elements.ccRecipients.dataset.autofilled = 'true';
    elements.recipientNameOverride.value = '';
    elements.notes.value = '';
 
    populateActivitySelect();
    renderCheckboxes();
    regenerateEditors();

    pageSnapshot = takeSnapshot();
}
 
function switchPage(pageId) {
    console.log(pageId)
    if(hasUnsavedChanges()) {
        if (!confirm('You may lose unsaved changes. Continue?')) return;
    }

    $$('.navbar-nav .page').forEach(link => link.classList.toggle('active', link.dataset.page === pageId));
    $$('#pages .page').forEach(page => page.classList.toggle('active', page.id === pageId));
    window.location.hash = pageId.replace('-page', '');
    pageSnapshot = takeSnapshot();
}

async function saveConfiguration() {
    await updateConfig((overrides) => {
        // Global
        ensurePath(overrides, ['settings', 'global']);
        overrides.settings.global.defaultCc = elements.defaultCcInput.value.trim();
        overrides.settings.global.minNameLength = Number(elements.minNameLengthInput.value);
        overrides.settings.global.placeholderPattern = elements.placeholderPatternInput.value.trim();

        // IT
        ensurePath(overrides, ['settings', 'it', 'email']);
        overrides.settings.it.fallbackName = elements.fallbackNameInput_it.value.trim();
        overrides.settings.it.email.signature = elements.signatureInput_it.value.trim();
        overrides.settings.it.email.subject = editorHtmlToRawTemplate(elements.subjectTemplateInput_it.innerHTML);
        overrides.settings.it.email.body = editorHtmlToRawTemplate(elements.bodyTemplateInput_it.innerHTML);
        overrides.settings.it.email.notes = elements.notesLabelInput_it.value.trim();

        // EN
        ensurePath(overrides, ['settings', 'en', 'email']);
        overrides.settings.en.fallbackName = elements.fallbackNameInput_en.value.trim();
        overrides.settings.en.email.signature = elements.signatureInput_en.value.trim();
        overrides.settings.en.email.subject = editorHtmlToRawTemplate(elements.subjectTemplateInput_en.innerHTML);
        overrides.settings.en.email.body = editorHtmlToRawTemplate(elements.bodyTemplateInput_en.innerHTML);
        overrides.settings.en.email.notes = elements.notesLabelInput_en.value.trim();
    });

    appConfig = await loadConfig();
    loadSettings();
    regenerateEditors();
    pageSnapshot = takeSnapshot();

    elements.configStatus.textContent = 'Configuration saved';
    setTimeout(() => { elements.configStatus.textContent = ''; }, 3000);
}

function resetConfiguration() {
    if (!confirm('Restore configuration to default values? Saved changes will be lost.')) {
        return;
    }

    resetConfig();

    loadConfig().then(config => {
        appConfig = config;
        loadSettings();
        regenerateEditors();

        elements.configStatus.textContent = 'Configuration restored';
        setTimeout(() => { elements.configStatus.textContent = ''; }, 3000);
    });
}
 
function bindEvents() {
    $$('.nav-link.page').forEach(btn => btn.addEventListener('click', () => switchPage(btn.dataset.page)));
    $$('.editor-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                $$('.editor-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
        
                $$('#editorTabContent > .tab-pane').forEach(p => p.classList.remove('show', 'active'));
                $(`#${btn.dataset.panel}`).classList.add('show', 'active');
        
                refreshPreview();
            });
        });

    elements.placeholderPalette?.addEventListener('click', event => {
        const tag = event.target.closest('.template-tag');
        if (!tag) return;
 
        insertPlaceholderToken(elements.bodyEditor, placeholderTokenHtml(tag.dataset.placeholder));
    });
 
    elements.bodyEditor.addEventListener('click', event => {
        const token = event.target.closest('.placeholder-token');
 
        $$('.placeholder-token').forEach(t => t.classList.remove('selected'));
 
        if (token) {
            token.classList.add('selected');
        }
    });
 
    [elements.subjectEditor, elements.bodyEditor].forEach(editor => {
        editor.addEventListener('focus', () => setActiveEditable(editor));
        editor.addEventListener('mouseup', () => setActiveEditable(editor));
 
        editor.addEventListener('keyup', () => { setActiveEditable(editor); refreshPreview(); });
        editor.addEventListener('input', () => { setActiveEditable(editor); if (!isApplying()) refreshPreview(); });
 
        editor.addEventListener('dblclick', event => {
            const token = event.target.closest('.placeholder-token');
            if (!token) return;
 
            event.preventDefault();
            expandTokenElement(token);
        });
    });
 
    ['ticketId', 'toRecipients', 'ccRecipients', 'recipientNameOverride', 'notes'].forEach(id => {
        $(`#${id}`)?.addEventListener('input', () => {
            if (id === 'ccRecipients') elements.ccRecipients.dataset.autofilled = 'false';
            if (!isApplying()) refreshPreview();
        });
 
        $(`#${id}`)?.addEventListener('change', () => {
            if (id === 'ccRecipients') elements.ccRecipients.dataset.autofilled = 'false';
            if (!isApplying()) refreshPreview();
        });
    });
 
    elements.langSelect.addEventListener('change', (event) => {
        setLang(event.target.value);
    });
 
    elements.activityType.addEventListener('change', () => {
        renderCheckboxes();
        regenerateEditors();
        pageSnapshot = takeSnapshot();
    });
 
    elements.missingFields.addEventListener('change', refreshPreview);

    elements.settingsPlaceholderPalette?.addEventListener('click', event => {
        const tag = event.target.closest('.template-tag');
        if (!tag) return;
    
        insertPlaceholderToken(null, placeholderTokenHtml(tag.dataset.placeholder));
    });
    
    $$('#settings-page .editor-surface').forEach(editor => {
        editor.addEventListener('focus', () => setActiveEditable(editor));
        editor.addEventListener('mouseup', () => setActiveEditable(editor));
    });
 
    elements.generateBtn?.addEventListener('click', () => {
        if (!confirm('Regenerate the email? Manual edits will be lost.')) return;
        regenerateEditors();
        pageSnapshot = takeSnapshot();
    });
    elements.openMailBtn?.addEventListener('click', openMail);
    elements.resetBtn?.addEventListener('click', resetForm);

    elements.saveConfigBtn?.addEventListener('click', saveConfiguration);
    elements.resetConfigBtn?.addEventListener('click', resetConfiguration);
}