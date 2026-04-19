import { elements, appConfig }  from './app.js';
import { lang }  from './lang.js';
import { getResolvedRecipientName } from '../utils/email.js'
import { 
    resolvePlaceholders,
    capitalizeFirst
} from '../utils/text.js'

export function getCurrentActivity() {
    const selectedId = elements.activityType.value;
    return appConfig.activities.find(activity => activity.id === selectedId) || appConfig.activities[0];
}

export function getResolvedName() {
    const override = elements.recipientNameOverride.value.trim();
    if(override) return capitalizeFirst(override);

    const extracted = getResolvedRecipientName(elements.toRecipients.value);
    const minLength = appConfig.settings.global.minNameLength || 3;

    if (extracted && extracted.length >= minLength) {
        return capitalizeFirst(extracted);
    }

    return capitalizeFirst(appConfig.settings[lang].fallbackName);
}

export function getSelectedFields() {
    const activity = getCurrentActivity();

    return (activity.fields || []).filter(field => {
        const el = document.getElementById(`field_${activity.id}_${field.key}`);
        return el && el.checked;
    });
}

export function getTemplateContext() {
    const activity = getCurrentActivity();

    const ticketId = elements.ticketId.value.trim() || '';
    const name = getResolvedName();

    const missingFields = getSelectedFields().length > 0
      ? getSelectedFields().map(field => `- ${field.label[lang]}`).join('\n')
      : '- [specify missing data]';

    const notes = elements.notes.value.trim() 
        ? `\n\n${appConfig.settings[lang].email.notes 
                ? `${appConfig.settings[lang].email.notes}: \n` 
                : '' }${elements.notes.value.trim()}` 
        : '';

    const templateUrl = activity.templateUrl || '';
    const documentation = activity.documentation || '';
    const linksConfig = appConfig.settings[lang].email.links;
    
    let links = '';
    if(templateUrl || documentation) {
        const lines = [];
        if (documentation) lines.push(`- ${linksConfig.labels.documentation}: ${documentation}`);
        if (templateUrl) lines.push(`- ${linksConfig.labels.template}: ${templateUrl}`);
    
        links = `\n\n${linksConfig.message}:\n${lines.join('\n')}`;
    }
    
    return {
        'ticket-id': ticketId,
        activity: activity.label[lang],
        name,
        'missing-fields': missingFields,
        notes,
        signature: '',
        'template-url': templateUrl,
        documentation,
        links
    };
}
  
export function getFullContext() {
    const base = getTemplateContext();

    return {
        ...base,
        signature: resolvePlaceholders(appConfig.settings[lang].email.signature || '', { ...base, signature: '' })
    };
}