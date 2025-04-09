/**
 * Simple logger utility for MCP-related logging
 */

/**
 * Sets up the MCP logger for client-side use
 * @returns A cleanup function to be called on unmount
 */
export function setupMcpLogger() {
  console.log('MCP Logger initialized');
  
  // Return a cleanup function
  return () => {
    console.log('MCP Logger cleaned up');
  };
} 