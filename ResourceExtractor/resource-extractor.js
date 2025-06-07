const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'en-US.json');
const outputFile = path.join(__dirname, 'en-US_extracted.json');

try {
  // Read the input JSON file, trying utf16le encoding
  let rawData = fs.readFileSync(inputFile, 'utf16le');

  // Remove BOM if present (though 'utf16le' should handle it, this is a fallback)
  // For UTF-16 LE, the BOM is U+FEFF, which appears as FEFF at the start of the stream.
  // When read into a JS string, it becomes character code U+FEFF.
  if (rawData.charCodeAt(0) === 0xfeff) {
    rawData = rawData.slice(1);
  }
  // Also check for a potential misplaced UTF-8 BOM if utf16le was wrong, though unlikely to parse then.
  else if (rawData.charCodeAt(0) === 0xefbb && rawData.charCodeAt(1) === 0xbf) {
    // This case is less likely if the primary issue is utf16le
    // and would only be hit if the file was misidentified and somehow partially readable.
    // A more robust solution would be to detect encoding first.
    // For now, focusing on utf16le as the prime suspect.
  }

  const jsonData = JSON.parse(rawData);

  const extractedResources = [];

  // Iterate through the top-level array
  for (const topLevelItem of jsonData) {
    if (topLevelItem && Array.isArray(topLevelItem.Classes)) {
      if (
        typeof topLevelItem.NativeClass === "string" &&
        topLevelItem.NativeClass.startsWith(
          "/Script/CoreUObject.Class'/Script/FactoryGame.FGItem"
        )
      ) {
        for (const classItem of topLevelItem.Classes) {
          if (classItem) {
            const resource = {
              ClassName: classItem.ClassName,
              DisplayName: classItem.mDisplayName,
              Description: classItem.mDescription
                ? classItem.mDescription
                    .replace(/\r\n/g, " ")
                    .replace(/\n/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()
                : "",
            };
            if (
              resource.ClassName &&
              resource.DisplayName &&
              resource.Description
            ) {
              extractedResources.push(resource);
            }
          }
        }
      }
    }
  }

  // Write the extracted resources to the output file
  fs.writeFileSync(outputFile, JSON.stringify(extractedResources, null, 2), 'utf-8');

  console.log(
    `Successfully extracted resources to ${outputFile}, items count = ${extractedResources.length}`
  );
} catch (error) {
  console.error('Error processing the file:', error);
}
