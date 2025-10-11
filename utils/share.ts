import pako from 'pako';
import { GameManual } from '../types';

/**
 * Compresses and Base64-encodes a GameManual object into a URL-safe string.
 * @param manual The GameManual object to encode.
 * @returns A compressed, Base64-encoded string.
 */
export const encodeManualForUrl = (manual: GameManual): string => {
  try {
    const jsonString = JSON.stringify(manual);
    // Use pako to GZIP compress the string
    const compressed = pako.deflate(jsonString, { to: 'string' });
    // btoa is fine for URL query parameter as long as it's not part of the path
    return btoa(compressed); 
  } catch (error) {
    console.error("Failed to encode manual:", error);
    return "";
  }
};

/**
 * Decodes a Base64 string from a URL, decompresses it, and parses it back into a GameManual object.
 * @param encodedData The Base64-encoded, compressed string from the URL.
 * @returns A GameManual object, or null if decoding fails.
 */
export const decodeManualFromUrl = (encodedData: string): GameManual | null => {
  try {
    const compressed = atob(encodedData);
    // Use pako to inflate the GZIP compressed string
    const jsonString = pako.inflate(compressed, { to: 'string' });
    return JSON.parse(jsonString) as GameManual;
  } catch (error) {
    console.error("Failed to decode manual from URL:", error);
    return null;
  }
};