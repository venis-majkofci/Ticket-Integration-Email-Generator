export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => Array.from(document.querySelectorAll(selector));

export function getElements() {
    return {
        // Home
        ticketId: $('#ticketId'),
        activityType: $('#activityType'),
        toRecipients: $('#toRecipients'),
        ccRecipients: $('#ccRecipients'),
        recipientNameOverride: $('#recipientNameOverride'),
        missingFields: $('#missingFields'),
        notes: $('#notes'),
        langSelect: $('#langSelect'),

        // Editor
        subjectEditor: $('#subjectEditor'),
        bodyEditor: $('#bodyEditor'),
        placeholderPalette: $('#placeholderPalette'),

        // Preview
        toPreview: $('#toPreview'),
        ccPreview: $('#ccPreview'),
        subjectPreview: $('#subjectPreview'),
        bodyPreview: $('#bodyPreview'),

        // Settings — Global
        defaultCcInput: $('#defaultCcInput'),
        minNameLengthInput: $('#minNameLengthInput'),
        placeholderPatternInput: $('#placeholderPatternInput'),
        settingsPlaceholderPalette: $('#settingsPlaceholderPalette'),

        // Settings — IT
        fallbackNameInput_it: $('#fallbackNameInput_it'),
        signatureInput_it: $('#signatureInput_it'),
        subjectTemplateInput_it: $('#subjectTemplateInput_it'),
        bodyTemplateInput_it: $('#bodyTemplateInput_it'),
        notesLabelInput_it: $('#notesLabelInput_it'),

        // Settings — EN
        fallbackNameInput_en: $('#fallbackNameInput_en'),
        signatureInput_en: $('#signatureInput_en'),
        subjectTemplateInput_en: $('#subjectTemplateInput_en'),
        bodyTemplateInput_en: $('#bodyTemplateInput_en'),
        notesLabelInput_en: $('#notesLabelInput_en'),

        // Settings — Actions
        configStatus: $('#configStatus'),
        saveConfigBtn: $('#saveConfigBtn'),
        resetConfigBtn: $('#resetConfigBtn'),
        activitySummary: $('#activitySummary'),

        // Home — Actions
        generateBtn: $('#generateBtn'),
        openMailBtn: $('#openMailBtn'),
        resetBtn: $('#resetBtn'),
    };
}