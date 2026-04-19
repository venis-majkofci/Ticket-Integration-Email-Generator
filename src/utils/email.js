import { capitalizeFirst }  from './text.js';

export function normalizeRecipients(value) {
    return value.split(';').map(item => item.trim()).filter(Boolean).join('; ');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRecipients(value) {
    const recipients = normalizeRecipients(value).split('; ');

    return recipients.filter(r => !isValidEmail(r));
}

export function getResolvedRecipientName(recipients) {
    const email = recipients.split(';')[0].trim();
    const localPart = email.split('@')[0];

    return capitalizeFirst(localPart.split('.')[0]);
}