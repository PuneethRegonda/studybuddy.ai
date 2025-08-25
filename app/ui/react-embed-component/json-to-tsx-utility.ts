'use server';

import fs from 'fs';
import path from 'path';

/**
 * Utility to extract component code from a JSON file and write it to a TSX file
 * 
 * This can be used in build scripts or as a server action
 * 
 * @param jsonFilePath Path to the JSON file containing the component code
 * @param outputFilePath Path where the TSX file should be created
 * @returns Success status and message
 */
export async function extractComponentToTsx(
  jsonFilePath: string,
  outputFilePath: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Read the JSON file
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    const jsonData = JSON.parse(jsonContent);
    
    if (!jsonData.code) {
      return { 
        success: false, 
        message: 'No code property found in the JSON file' 
      };
    }
    
    // Create directory if it doesn't exist
    const outputDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Add 'use client' directive if not already present
    let code = jsonData.code;
    if (!code.includes("'use client'") && !code.includes('"use client"')) {
      code = "'use client';\n" + code;
    }
    
    // Write the code to the TSX file
    fs.writeFileSync(outputFilePath, code, 'utf8');
    
    return { 
      success: true, 
      message: `Successfully created ${outputFilePath} from ${jsonFilePath}` 
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      success: false, 
      message: `Error: ${errorMessage}` 
    };
  }
} 