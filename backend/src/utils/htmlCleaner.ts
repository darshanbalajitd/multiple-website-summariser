export const cleanHTML = (html: string): string => {
  if (!html) return '';

  // Extract content inside <main> tag if it exists
  let mainContent = html;
  const mainRegex = /<main[^>]*>([\s\S]*?)<\/main>/i;
  const mainMatch = html.match(mainRegex);
  
  if (mainMatch && mainMatch[1]) {
    mainContent = mainMatch[1];
  } else {
    // Fallback: if no <main> tag, use the whole body content
    const bodyRegex = /<body[^>]*>([\s\S]*?)<\/body>/i;
    const bodyMatch = html.match(bodyRegex);
    if (bodyMatch && bodyMatch[1]) {
      mainContent = bodyMatch[1];
    }
  }

  const cleaned = mainContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(b|i|strong|em)>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{2,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return cleaned;
};
