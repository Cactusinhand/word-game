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
    // Use pako to GZIP compress the string to Uint8Array
    const compressed = pako.deflate(jsonString);
    // Convert Uint8Array to Base64, then make it URL-safe
    const base64 = btoa(String.fromCharCode(...compressed));
    // Make it URL-safe by replacing + and / with URL-safe characters
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
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
    // Reverse the URL-safe encoding
    let base64 = encodedData.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding back if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode Base64 to binary string
    const binaryString = atob(base64);
    // Convert binary string to Uint8Array
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    // Use pako to inflate the data
    const jsonString = pako.inflate(uint8Array, { to: 'string' });
    return JSON.parse(jsonString) as GameManual;
  } catch (error) {
    console.error("Failed to decode manual from URL:", error);
    console.error("Encoded data was:", encodedData?.substring(0, 100) + "...");
    return null;
  }
};