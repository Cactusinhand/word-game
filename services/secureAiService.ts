import { GameManual } from '../types';

// Secure AI service that calls our backend API instead of directly exposing API keys
class SecureAiService {
  private apiBaseUrl: string;

  constructor() {
    // For development, always use current origin
    // For production, use the configured domain
    if (typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.localhost') ||
      window.location.hostname.endsWith('.127.0.0.1')
    )) {
      this.apiBaseUrl = window.location.origin;
    } else {
      this.apiBaseUrl = process.env.PRODUCTION_DOMAIN || window.location.origin;
    }
  }

  async generateGameManual(word: string): Promise<GameManual> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/ai-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: word.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Could not parse error response.' } }));
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown API error'}`);
      }

      const data = await response.json();

      // Update the active provider name from backend response
      if (data.provider) {
        secureAiService.updateProviderName(data.provider);
      }

      return data;
    } catch (error) {
      console.error('Error calling secure AI service:', error);
      throw new Error("Failed to generate the game manual. The service may be unavailable or the input might be invalid.");
    }
  }

  private currentProvider: string = 'DeepSeek';

  updateProviderName(providerName: string): void {
    this.currentProvider = providerName;
  }

  getProviderName(): string {
    return this.currentProvider;
  }
}

// Export singleton instance
const secureAiService = new SecureAiService();
export const generateGameManual = (word: string): Promise<GameManual> => {
  return secureAiService.generateGameManual(word);
};

export const activeProviderName = secureAiService.getProviderName.bind(secureAiService);