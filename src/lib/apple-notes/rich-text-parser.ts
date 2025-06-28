import { JSDOM } from 'jsdom';

export interface RichTextElement {
  type: 'text' | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'link' | 'list' | 'heading' | 'paragraph' | 'image';
  content: string;
  attributes?: Record<string, string>;
  children?: RichTextElement[];
}

export interface RichTextDocument {
  elements: RichTextElement[];
  metadata: {
    title?: string;
    author?: string;
    created?: Date;
    modified?: Date;
    language?: string;
  };
}

export interface FormattingOptions {
  preserveFormatting?: boolean;
  convertToMarkdown?: boolean;
  convertToPlainText?: boolean;
  includeImages?: boolean;
  includeLinks?: boolean;
  maxLength?: number;
}

export class AppleNotesRichTextParser {
  /**
   * Parse rich text content from Apple Notes HTML
   */
  static parseRichText(htmlContent: string): RichTextDocument {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    const elements: RichTextElement[] = [];
    
    // Parse body content
    const body = document.body || document;
    const childNodes = Array.from(body.childNodes);
    
    childNodes.forEach(node => {
      const element = this.parseNode(node);
      if (element) {
        elements.push(element);
      }
    });
    
    // Extract metadata
    const metadata = this.extractMetadata(document);
    
    return {
      elements,
      metadata
    };
  }
  
  /**
   * Parse a single DOM node
   */
  private static parseNode(node: Node): RichTextElement | null {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        return {
          type: 'text',
          content: text
        };
      }
      return null;
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      return this.parseElement(element);
    }
    
    return null;
  }
  
  /**
   * Parse a single HTML element
   */
  private static parseElement(element: Element): RichTextElement | null {
    const tagName = element.tagName.toLowerCase();
    const textContent = element.textContent?.trim();
    
    if (!textContent && !this.hasVisualContent(element)) {
      return null;
    }
    
    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        return {
          type: 'heading',
          content: textContent || '',
          attributes: {
            level: tagName.substring(1)
          }
        };
        
      case 'p':
        return {
          type: 'paragraph',
          content: textContent || '',
          children: this.parseChildNodes(element)
        };
        
      case 'strong':
      case 'b':
        return {
          type: 'bold',
          content: textContent || '',
          children: this.parseChildNodes(element)
        };
        
      case 'em':
      case 'i':
        return {
          type: 'italic',
          content: textContent || '',
          children: this.parseChildNodes(element)
        };
        
      case 'u':
        return {
          type: 'underline',
          content: textContent || '',
          children: this.parseChildNodes(element)
        };
        
      case 's':
      case 'strike':
      case 'del':
        return {
          type: 'strikethrough',
          content: textContent || '',
          children: this.parseChildNodes(element)
        };
        
      case 'a':
        return {
          type: 'link',
          content: textContent || '',
          attributes: {
            href: element.getAttribute('href') || '',
            target: element.getAttribute('target') || ''
          },
          children: this.parseChildNodes(element)
        };
        
      case 'ul':
      case 'ol':
        return {
          type: 'list',
          content: textContent || '',
          attributes: {
            ordered: tagName === 'ol' ? 'true' : 'false'
          },
          children: this.parseChildNodes(element)
        };
        
      case 'li':
        return {
          type: 'text',
          content: textContent || '',
          children: this.parseChildNodes(element)
        };
        
      case 'img':
        return {
          type: 'image',
          content: element.getAttribute('alt') || '',
          attributes: {
            src: element.getAttribute('src') || '',
            width: element.getAttribute('width') || '',
            height: element.getAttribute('height') || ''
          }
        };
        
      case 'br':
        return {
          type: 'text',
          content: '\n'
        };
        
      case 'div':
      case 'span':
        // Handle generic containers
        const children = this.parseChildNodes(element);
        if (children.length === 1) {
          return children[0];
        } else if (children.length > 1) {
          return {
            type: 'paragraph',
            content: textContent || '',
            children
          };
        }
        return null;
        
      default:
        // For unknown tags, try to parse children
        const childElements = this.parseChildNodes(element);
        if (childElements.length > 0) {
          return {
            type: 'paragraph',
            content: textContent || '',
            children: childElements
          };
        }
        return null;
    }
  }
  
  /**
   * Parse child nodes of an element
   */
  private static parseChildNodes(element: Element): RichTextElement[] {
    const children: RichTextElement[] = [];
    
    Array.from(element.childNodes).forEach(node => {
      const childElement = this.parseNode(node);
      if (childElement) {
        children.push(childElement);
      }
    });
    
    return children;
  }
  
  /**
   * Check if element has visual content (images, etc.)
   */
  private static hasVisualContent(element: Element): boolean {
    return element.querySelector('img, video, canvas, svg') !== null;
  }
  
  /**
   * Extract metadata from document
   */
  private static extractMetadata(document: Document): RichTextDocument['metadata'] {
    const metadata: RichTextDocument['metadata'] = {};
    
    // Extract title
    const titleElement = document.querySelector('title, h1, .title');
    if (titleElement) {
      metadata.title = titleElement.textContent?.trim();
    }
    
    // Extract author
    const authorElement = document.querySelector('.author, [data-author], meta[name="author"]');
    if (authorElement) {
      metadata.author = authorElement.textContent?.trim() || authorElement.getAttribute('content') || undefined;
    }
    
    // Extract dates
    const createdElement = document.querySelector('.created, [data-created], meta[name="created"]');
    if (createdElement) {
      const createdText = createdElement.textContent?.trim() || createdElement.getAttribute('content');
      if (createdText) {
        metadata.created = new Date(createdText);
      }
    }
    
    const modifiedElement = document.querySelector('.modified, [data-modified], meta[name="modified"]');
    if (modifiedElement) {
      const modifiedText = modifiedElement.textContent?.trim() || modifiedElement.getAttribute('content');
      if (modifiedText) {
        metadata.modified = new Date(modifiedText);
      }
    }
    
    // Extract language
    const langElement = document.querySelector('html[lang], [lang]');
    if (langElement) {
      metadata.language = langElement.getAttribute('lang') || undefined;
    }
    
    return metadata;
  }
  
  /**
   * Convert rich text to Markdown
   */
  static toMarkdown(document: RichTextDocument, options: FormattingOptions = {}): string {
    let markdown = '';
    
    document.elements.forEach(element => {
      markdown += this.elementToMarkdown(element, options);
    });
    
    // Apply length limit if specified
    if (options.maxLength && markdown.length > options.maxLength) {
      markdown = markdown.substring(0, options.maxLength) + '...';
    }
    
    return markdown;
  }
  
  /**
   * Convert a single element to Markdown
   */
  private static elementToMarkdown(element: RichTextElement, options: FormattingOptions): string {
    switch (element.type) {
      case 'text':
        return element.content;
        
      case 'bold':
        return `**${element.content}**`;
        
      case 'italic':
        return `*${element.content}*`;
        
      case 'underline':
        return options.preserveFormatting ? `<u>${element.content}</u>` : element.content;
        
      case 'strikethrough':
        return `~~${element.content}~~`;
        
      case 'link':
        if (options.includeLinks && element.attributes?.href) {
          return `[${element.content}](${element.attributes.href})`;
        }
        return element.content;
        
      case 'heading':
        const level = parseInt(element.attributes?.level || '1');
        const hashes = '#'.repeat(Math.min(level, 6));
        return `${hashes} ${element.content}\n\n`;
        
      case 'paragraph':
        let content = element.content;
        if (element.children) {
          content = element.children.map(child => this.elementToMarkdown(child, options)).join('');
        }
        return content + '\n\n';
        
      case 'list':
        if (element.attributes?.ordered === 'true') {
          return this.orderedListToMarkdown(element, options);
        } else {
          return this.unorderedListToMarkdown(element, options);
        }
        
      case 'image':
        if (options.includeImages && element.attributes?.src) {
          const alt = element.content || 'Image';
          return `![${alt}](${element.attributes.src})\n\n`;
        }
        return '';
        
      default:
        return element.content;
    }
  }
  
  /**
   * Convert ordered list to Markdown
   */
  private static orderedListToMarkdown(element: RichTextElement, options: FormattingOptions): string {
    if (!element.children) return '';
    
    return element.children.map((child, index) => {
      const content = this.elementToMarkdown(child, options);
      return `${index + 1}. ${content}`;
    }).join('\n') + '\n\n';
  }
  
  /**
   * Convert unordered list to Markdown
   */
  private static unorderedListToMarkdown(element: RichTextElement, options: FormattingOptions): string {
    if (!element.children) return '';
    
    return element.children.map(child => {
      const content = this.elementToMarkdown(child, options);
      return `- ${content}`;
    }).join('\n') + '\n\n';
  }
  
  /**
   * Convert rich text to plain text
   */
  static toPlainText(document: RichTextDocument, options: FormattingOptions = {}): string {
    let text = '';
    
    document.elements.forEach(element => {
      text += this.elementToPlainText(element, options);
    });
    
    // Clean up whitespace
    text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
    text = text.trim();
    
    // Apply length limit if specified
    if (options.maxLength && text.length > options.maxLength) {
      text = text.substring(0, options.maxLength) + '...';
    }
    
    return text;
  }
  
  /**
   * Convert a single element to plain text
   */
  private static elementToPlainText(element: RichTextElement, options: FormattingOptions): string {
    switch (element.type) {
      case 'text':
        return element.content;
        
      case 'bold':
      case 'italic':
      case 'underline':
      case 'strikethrough':
        return element.content;
        
      case 'link':
        if (options.includeLinks && element.attributes?.href) {
          return `${element.content} (${element.attributes.href})`;
        }
        return element.content;
        
      case 'heading':
        return `${element.content}\n\n`;
        
      case 'paragraph':
        let content = element.content;
        if (element.children) {
          content = element.children.map(child => this.elementToPlainText(child, options)).join('');
        }
        return content + '\n\n';
        
      case 'list':
        if (element.children) {
          return element.children.map(child => {
            const content = this.elementToPlainText(child, options);
            return `• ${content}`;
          }).join('\n') + '\n\n';
        }
        return '';
        
      case 'image':
        if (options.includeImages) {
          const alt = element.content || 'Image';
          return `[${alt}]\n\n`;
        }
        return '';
        
      default:
        return element.content;
    }
  }
  
  /**
   * Convert rich text to HTML
   */
  static toHtml(document: RichTextDocument, options: FormattingOptions = {}): string {
    let html = '';
    
    document.elements.forEach(element => {
      html += this.elementToHtml(element, options);
    });
    
    return html;
  }
  
  /**
   * Convert a single element to HTML
   */
  private static elementToHtml(element: RichTextElement, options: FormattingOptions): string {
    switch (element.type) {
      case 'text':
        return element.content;
        
      case 'bold':
        return `<strong>${element.content}</strong>`;
        
      case 'italic':
        return `<em>${element.content}</em>`;
        
      case 'underline':
        return `<u>${element.content}</u>`;
        
      case 'strikethrough':
        return `<del>${element.content}</del>`;
        
      case 'link':
        if (options.includeLinks && element.attributes?.href) {
          const target = element.attributes.target ? ` target="${element.attributes.target}"` : '';
          return `<a href="${element.attributes.href}"${target}>${element.content}</a>`;
        }
        return element.content;
        
      case 'heading':
        const level = element.attributes?.level || '1';
        return `<h${level}>${element.content}</h${level}>`;
        
      case 'paragraph':
        let content = element.content;
        if (element.children) {
          content = element.children.map(child => this.elementToHtml(child, options)).join('');
        }
        return `<p>${content}</p>`;
        
      case 'list':
        if (element.attributes?.ordered === 'true') {
          return this.orderedListToHtml(element, options);
        } else {
          return this.unorderedListToHtml(element, options);
        }
        
      case 'image':
        if (options.includeImages && element.attributes?.src) {
          const alt = element.content || 'Image';
          const width = element.attributes.width ? ` width="${element.attributes.width}"` : '';
          const height = element.attributes.height ? ` height="${element.attributes.height}"` : '';
          return `<img src="${element.attributes.src}" alt="${alt}"${width}${height}>`;
        }
        return '';
        
      default:
        return element.content;
    }
  }
  
  /**
   * Convert ordered list to HTML
   */
  private static orderedListToHtml(element: RichTextElement, options: FormattingOptions): string {
    if (!element.children) return '';
    
    const items = element.children.map(child => {
      const content = this.elementToHtml(child, options);
      return `<li>${content}</li>`;
    }).join('');
    
    return `<ol>${items}</ol>`;
  }
  
  /**
   * Convert unordered list to HTML
   */
  private static unorderedListToHtml(element: RichTextElement, options: FormattingOptions): string {
    if (!element.children) return '';
    
    const items = element.children.map(child => {
      const content = this.elementToHtml(child, options);
      return `<li>${content}</li>`;
    }).join('');
    
    return `<ul>${items}</ul>`;
  }
} 