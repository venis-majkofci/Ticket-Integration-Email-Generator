import { elements, appConfig } from './app.js';
import { lang } from './lang.js';
import { getCurrentActivity } from './context.js';

export function populateActivitySelect() {
    const currentId = elements.activityType.value;

    elements.activityType.innerHTML = '';

    appConfig.activities.forEach(activity => {
        const option = document.createElement('option');
        option.value = activity.id;
        option.textContent = activity.label[lang];
        elements.activityType.appendChild(option);
    });

    const hasPrevious = appConfig.activities.some(activity => activity.id === currentId);
    elements.activityType.value = hasPrevious ? currentId : appConfig.activities[0]?.id || '';
}

export function renderCheckboxes() {
    const activity = getCurrentActivity();

    elements.missingFields.innerHTML = '';

    (activity.fields || []).forEach(field => {
        const wrapper = document.createElement('div');
        wrapper.className = 'checkbox-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `field_${activity.id}_${field.key}`;
        checkbox.checked = Boolean(field.checked);

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = field.label[lang];

        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);

        elements.missingFields.appendChild(wrapper);
    });
}