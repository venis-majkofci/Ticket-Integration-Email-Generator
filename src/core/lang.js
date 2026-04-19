import { populateActivitySelect, renderCheckboxes } from './formRenderer.js';
import { regenerateEditors } from './emailEditor.js';

export let lang = "it";

export function setLang(newLang) {
    lang = newLang;

    populateActivitySelect();
    renderCheckboxes();
    regenerateEditors();
}