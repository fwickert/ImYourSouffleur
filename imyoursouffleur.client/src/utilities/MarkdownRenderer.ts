import { marked } from 'marked';

export async function renderMarkdown(markdown: string): Promise<string> {
    if (markdown === "" || markdown === undefined) {
        return markdown;
    }

    const rawMarkup = marked(markdown);
    return rawMarkup;
}
