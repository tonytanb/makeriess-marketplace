/**
 * Utility functions for dynamically updating meta tags
 * Used in client components to set Open Graph metadata
 */

export interface MetaTagsConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
}

/**
 * Update Open Graph meta tags dynamically
 * This is used in client components since we can't use generateMetadata
 */
export function updateMetaTags(config: MetaTagsConfig): void {
  if (typeof document === 'undefined') return;

  // Update title
  document.title = config.title;

  // Helper to set or update a meta tag
  const setMetaTag = (property: string, content: string) => {
    let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('property', property);
      document.head.appendChild(element);
    }
    
    element.content = content;
  };

  const setMetaName = (name: string, content: string) => {
    let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute('name', name);
      document.head.appendChild(element);
    }
    
    element.content = content;
  };

  // Update description
  setMetaName('description', config.description);

  // Update Open Graph tags
  setMetaTag('og:title', config.title);
  setMetaTag('og:description', config.description);
  setMetaTag('og:type', config.type || 'website');
  setMetaTag('og:site_name', 'makeries');
  
  if (config.url) {
    setMetaTag('og:url', config.url);
  }
  
  if (config.image) {
    setMetaTag('og:image', config.image);
    setMetaTag('og:image:width', '1200');
    setMetaTag('og:image:height', '630');
  }

  // Update Twitter Card tags
  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', config.title);
  setMetaName('twitter:description', config.description);
  
  if (config.image) {
    setMetaName('twitter:image', config.image);
  }
}

/**
 * Reset meta tags to default values
 */
export function resetMetaTags(): void {
  updateMetaTags({
    title: 'makeries - Local Marketplace',
    description: 'Discover and order from local makers, crafters, and food vendors',
    type: 'website',
  });
}
