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

  async generateGameManual(word: string, providerId?: string): Promise<GameManual> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/ai-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word: word.trim(), provider: providerId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Could not parse error response.' } }));
        const err: any = new Error(errorData?.error?.message || `API Error: ${response.status} ${response.statusText}`);
        err.payload = errorData;
        err.status = response.status;
        throw err;
      }

      const data = await response.json();

      // Update the active provider name from backend response
      if (data.provider) {
        secureAiService.updateProviderName(data.provider);
      }

      return data;
    } catch (error: any) {
      console.error('Error calling secure AI service:', error);
      // Preserve structured payload if present
      if (error && (error as any).payload) {
        throw error;
      }
      throw new Error(error?.message || "Failed to generate the game manual. The service may be unavailable or the input might be invalid.");
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
export const generateGameManual = (word: string, providerId?: string): Promise<GameManual> => {
  return secureAiService.generateGameManual(word, providerId);
};

export const activeProviderName = secureAiService.getProviderName.bind(secureAiService);

export async function listAvailableProviders(): Promise<{ providers: { id: string; name: string }[]; default: string | null }> {
  const baseUrl = (typeof window !== 'undefined') ? window.location.origin : '';
  const url = `${baseUrl}/api/ai-providers`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`Failed to load providers: ${res.status} ${res.statusText}`);
  }
  return res.json();
}
