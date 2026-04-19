import { elements, appConfig } from './app.js';
import { lang } from './lang.js';
import { getFullContext } from './context.js';
import { normalizeRecipients, validateRecipients } from '../utils/email.js';
import {
    escapeHtml,
    resolvePlaceholders,
    textWithTokensToHtml,
    htmlToPlainTextPreserveLines
} from '../utils/text.js';

let isApplyingTemplate = false;
let activeEditable = null;

// ── Caret ────────────────────────────────────────────────

export function getActiveEditable() {
    return activeEditable;
}

export function setActiveEditable(el) {
    activeEditable = el;
}

function placeCaretAtEnd(el) {
    el.focus();

    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

// ── Template → Editor ────────────────────────────────────

function buildTemplateEmail() {
    const subjectTemplate = appConfig.settings[lang].email.subject;
    const bodyTemplate = appConfig.settings[lang].email.body;

    return { subjectTemplate, bodyTemplate };
}

export function regenerateEditors() {
    const email = buildTemplateEmail();
    const regex = new RegExp(appConfig.settings.global.placeholderPattern, 'g');

    isApplyingTemplate = true;

    elements.subjectEditor.innerHTML = textWithTokensToHtml(email.subjectTemplate, regex);
    elements.bodyEditor.innerHTML = textWithTokensToHtml(email.bodyTemplate, regex);

    isApplyingTemplate = false;

    refreshPreview();
}

export function isApplying() {
    return isApplyingTemplate;
}

// ── Token insertion & expansion ──────────────────────────

export function insertPlaceholderToken(fallbackEditor, placeholderHtml) {
    const target = activeEditable || fallbackEditor;
    target.focus();

    let selection = window.getSelection();

    if (!selection || selection.rangeCount === 0 || !target.contains(selection.anchorNode)) {
        placeCaretAtEnd(target);
        selection = window.getSelection();
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const wrapper = document.createElement('span');
    wrapper.innerHTML = placeholderHtml;

    const node = wrapper.firstChild;
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);

    refreshPreview();
}

export function expandTokenElement(tokenEl) {
    const context = getFullContext();
    const regex = new RegExp(appConfig.settings.global.placeholderPattern, 'g');

    const rawValue = resolvePlaceholders(tokenEl.dataset.placeholder || tokenEl.textContent || '', context, regex);
    const htmlValue = escapeHtml(rawValue).replace(/\n/g, '<br>');

    const editor = tokenEl.closest('.editor-surface');

    const wrapper = document.createElement('span');
    wrapper.innerHTML = htmlValue;

    const nodes = Array.from(wrapper.childNodes);
    tokenEl.replaceWith(...nodes);

    if (editor) {
        activeEditable = editor;
        editor.focus();
    }

    refreshPreview();
}

// ── Resolve editor → final HTML ──────────────────────────

function editorHtmlToResolvedHtml(html) {
    const context = getFullContext();
    const regex = new RegExp(appConfig.settings.global.placeholderPattern, 'g');

    const container = document.createElement('div');
    container.innerHTML = html;

    container.querySelectorAll('.placeholder-token').forEach(token => {
        const value = resolvePlaceholders(token.dataset.placeholder || token.textContent || '', context, regex);
        token.replaceWith(document.createTextNode(value));
    });

    container.innerHTML = resolvePlaceholders(container.innerHTML, context, regex);

    return container.innerHTML;
}

// ── Compose ──────────────────────────────────────────────

function composeEmail() {
    const to = normalizeRecipients(elements.toRecipients.value.trim());
    const cc = normalizeRecipients(elements.ccRecipients.value.trim());
    const subject = editorHtmlToResolvedHtml(elements.subjectEditor.innerHTML);
    const body = editorHtmlToResolvedHtml(elements.bodyEditor.innerHTML);

    return { to, cc, subject, body };
}

// ── Preview ──────────────────────────────────────────────

export function refreshPreview() {
    const { to, cc, subject, body } = composeEmail();

    elements.toPreview.textContent = to || '—';
    elements.ccPreview.textContent = cc || '—';
    elements.subjectPreview.innerHTML = subject || '—';
    elements.bodyPreview.innerHTML = body || '—';
}

// ── Mailto ───────────────────────────────────────────────

export function openMail() {
    let { to, cc, subject, body } = composeEmail();

    subject = htmlToPlainTextPreserveLines(subject);
    body = htmlToPlainTextPreserveLines(body);

    if (!to) {
        alert('Insert at least one email in "TO"');
        return;
    }

    const toInvalid = validateRecipients(to);
    if (toInvalid.length > 0) {
        alert('Invalid "TO" emails:\n' + toInvalid.join('\n'));
        return;
    }

    if (cc) {
        const ccInvalid = validateRecipients(cc);
        if (ccInvalid.length > 0) {
            alert('Invalid "CC" emails:\n' + ccInvalid.join('\n'));
            return;
        }
    }

    const params = [
        `subject=${encodeURIComponent(subject)}`,
        `body=${encodeURIComponent(body)}`
    ];
    if (cc) params.push(`cc=${encodeURIComponent(cc)}`);

    window.location.href = `mailto:${encodeURIComponent(to)}?${params.join('&')}`;
}