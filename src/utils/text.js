export function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
}

export function placeholderTokenHtml(placeholder) {
    return `<span class="placeholder-token" data-placeholder="${escapeHtml(placeholder)}" contenteditable="false">${escapeHtml(placeholder)}</span>`;
}

export function resolvePlaceholders(text, context, regex) {
    return String(text || '').replace(regex, (_, key) => context[key] ?? '');
}

export function textWithTokensToHtml(text, regex) {
    const escaped = escapeHtml(text || '');
    const withTokens = escaped.replace(regex, match => placeholderTokenHtml(match));
    
    return withTokens.replace(/\n/g, '<br>');
}
  
export function capitalizeFirst(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function htmlToPlainTextPreserveLines(html) {
    const temp = document.createElement('div');
    temp.innerHTML = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<li>/gi, '\n- ');

    return temp.textContent.replace(/\n{3,}/g, '\n\n').trim();
}
  
export function editorHtmlToRawTemplate(html) {
    const container = document.createElement('div');
    container.innerHTML = html;

    container.querySelectorAll('.placeholder-token').forEach(token => {
        token.replaceWith(token.dataset.placeholder || token.textContent);
    });

    return container.innerHTML
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<div>/gi, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}