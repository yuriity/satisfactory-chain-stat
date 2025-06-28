/*
 * To execute this script, ensure you have Node.js installed.
 *   1. Navigate to the ResourceExtractor directory.
 *   2. Run the script using the command: node recipe-extractor.js
 */

const fs = require("fs");
const path = require("path");

const inputFile = path.join(__dirname, "en-US_v1.1.1.0.json");
// const inputFile = path.join(__dirname, "en-US_v1.1.1.0_shorted.json");
const outputFile = path.join(__dirname, "../public/data/en-US_recipes.json");

try {
  // Read the input JSON file, trying utf16le encoding
  let rawData = fs.readFileSync(inputFile, "utf16le");

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
    console.warn(
      "Warning: Detected potential UTF-8 BOM, but proceeding with utf16le parsing."
    );
  }
  // let rawData = fs.readFileSync(inputFile, "utf8");

  const jsonData = JSON.parse(rawData);

  const extractedRecipes = [];

  // Iterate through the top-level array
  for (const topLevelItem of jsonData) {
    if (topLevelItem && Array.isArray(topLevelItem.Classes)) {
      if (
        topLevelItem.NativeClass ===
        "/Script/CoreUObject.Class'/Script/FactoryGame.FGRecipe'"
      ) {
        for (const classItem of topLevelItem.Classes) {
          if (validClassItem(classItem)) {
            const recipe = processRecipe(classItem);

            extractedRecipes.push(recipe);

            // console.log(`\nFullName: ${classItem.FullName}`);
            // console.log(`shortName: ${recipe.shortName}`);
            // console.log(JSON.stringify(recipe));
          }
        }
      }
    }
  }

  // Write the extracted resources to the output file
  fs.writeFileSync(
    outputFile,
    JSON.stringify(extractedRecipes, null, 2),
    "utf-8"
  );

  console.log(
    `Successfully extracted recipes to ${outputFile}, items count = ${extractedRecipes.length}`
  );
} catch (error) {
  console.error("Error processing the file:", error);
}

function validClassItem(classItem) {
  return (
    classItem &&
    classItem.FullName.indexOf(
      "BlueprintGeneratedClass /Game/FactoryGame/Events/Christmas/"
    ) === -1 &&
    classItem.FullName.indexOf(
      "BlueprintGeneratedClass /Game/FactoryGame/Recipes/Holiday/"
    ) === -1 &&
    classItem.mProducedIn !== "" &&
    classItem.mProducedIn !==
      '("/Game/FactoryGame/Equipment/BuildGun/BP_BuildGun.BP_BuildGun_C")' &&
    classItem.mProducedIn !== '("/Script/FactoryGame.FGBuildGun")' &&
    classItem.mProducedIn !==
      '("/Game/FactoryGame/Buildable/-Shared/WorkBench/BP_WorkshopComponent.BP_WorkshopComponent_C")'
  );
}

function processRecipe(classItem) {
  // console.log(`Processing classItem: ${classItem.mDisplayName}`);
  const result = {};
  if (classItem.mDisplayName.startsWith("Alternate: ")) {
    result.displayName = classItem.mDisplayName.replace("Alternate: ", "");
    result.alternate = true;
  } else {
    result.displayName = classItem.mDisplayName;
    result.alternate = false;
  }
  result.shortName = processShortName(classItem.FullName);
  result.ingredients = processIngradients(classItem.mIngredients);
  result.product = processIngradients(classItem.mProduct)[0];
  result.manufactoringDuration = Number.parseInt(
    classItem.mManufactoringDuration
  );
  result.producedIn = processProducedIn(classItem.mProducedIn);

  // console.log(`\nFullName: ${classItem.FullName}`);
  // console.log(JSON.stringify(result));
  return result;
}

function processShortName(fullNameStr) {
  const start = fullNameStr.lastIndexOf(".");
  return fullNameStr.slice(start + 1);
}

function processIngradients(ingredientsStr) {
  if (!ingredientsStr || ingredientsStr === "") {
    return [""];
  }
  const jsonStr = transformString(ingredientsStr);
  const jsonData = JSON.parse(jsonStr);
  const ingredients = [];
  for (const ingredient of jsonData) {
    ingredients.push({
      className: processClassName(ingredient.ItemClass),
      amount: ingredient.Amount,
    });
  }

  return ingredients;
}

function processClassName(className) {
  const before = className.lastIndexOf(".");
  const after = className.lastIndexOf("'");
  className = className.slice(before + 1, after);
  return className?.toLowerCase().replace(/_/g, "-");
}

function processProducedIn(mProducedInStr) {
  substrings = mProducedInStr
    .replaceAll("(", "")
    .replaceAll(")", "")
    .replaceAll('"', "")
    .split(",");

  if (
    substrings.includes(
      "/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C"
    )
  ) {
    return "desc-constructormk1-c";
  } else if (
    substrings.includes(
      "/Game/FactoryGame/Buildable/Factory/SmelterMk1/Build_SmelterMk1.Build_SmelterMk1_C"
    )
  ) {
    return "desc-smeltermk1-c";
  } else if (
    substrings.includes(
      "/Game/FactoryGame/Buildable/Factory/Blender/Build_Blender.Build_Blender_C"
    )
  ) {
    return "desc-blender-c";
  } else if (
    substrings.includes(
      "/Game/FactoryGame/Buildable/Factory/Packager/Build_Packager.Build_Packager_C"
    )
  ) {
    return "desc-packager-c";
  } else if (
    substrings.includes(
      "/Game/FactoryGame/Buildable/Factory/Converter/Build_Converter.Build_Converter_C"
    )
  ) {
    return "desc-converter-c";
  } else if (
    substrings.includes(
      "/Game/FactoryGame/Buildable/Factory/HadronCollider/Build_HadronCollider.Build_HadronCollider_C"
    )
  ) {
    return "desc-hadroncollider-c";
  } else if (
    substrings.includes(
      "/Game/FactoryGame/Buildable/Factory/QuantumEncoder/Build_QuantumEncoder.Build_QuantumEncoder_C"
    )
  ) {
    return "desc-quantumencoder-c";
  } else if (
    substrings.includes(
      "/Game/FactoryGame/Buildable/Factory/ManufacturerMk1/Build_ManufacturerMk1.Build_ManufacturerMk1_C"
    )
  ) {
    return "desc-manufacturermk1-c";
  } else if (
    substrings.includes(
      "/Game/FactoryGame/Buildable/Factory/AssemblerMk1/Build_AssemblerMk1.Build_AssemblerMk1_C"
    )
  ) {
    return "desc-assemblermk1-c";
  } else if (
    substrings.includes(
      "/Game/FactoryGame/Buildable/Factory/OilRefinery/Build_OilRefinery.Build_OilRefinery_C"
    )
  ) {
    return "desc-oilrefinery-c";
  } else if (
    substrings.includes(
      "/Game/FactoryGame/Buildable/Factory/FoundryMk1/Build_FoundryMk1.Build_FoundryMk1_C"
    )
  ) {
    return "desc-foundrymk1-c";
  } else {
    console.warn(`\nUnknown producedIn:`);
    for (const substring of substrings) {
      console.warn(substring);
    }
    return "desc-unknown";
  }
}

function transformString(input) {
  // 1. Replace first '(' with '[' and last ')' with ']'
  input = input.replace(/^\(/, "[").replace(/\)$/, "]");

  // 2. Replace inner '(' with '{' and ')' with '}'
  //    (excluding the first and last, which are now [ and ])
  //    We'll use a loop to avoid replacing the outermost ones
  let chars = input.split("");
  let stack = [];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === "(") {
      // Only replace if not the first char (which is now '[')
      if (i !== 0) {
        chars[i] = "{";
        stack.push(i);
      }
    } else if (chars[i] === ")") {
      // Only replace if not the last char (which is now ']')
      if (i !== chars.length - 1) {
        chars[i] = "}";
        stack.pop();
      }
    }
  }
  input = chars.join("");

  // 3. Ensure ItemClass and Amount are in double quotes
  input = input.replace(/ItemClass=([^,}]+)/g, (m, val) => {
    // Remove quotes if present, then wrap in double quotes
    val = val.replace(/^"|"$/g, "");
    return `"ItemClass":"${val}"`;
  });
  input = input.replace(/Amount=([^,}\]]+)/g, (m, val) => {
    // Remove quotes if present, then wrap in double quotes
    val = val.replace(/^"|"$/g, "");
    return `"Amount":${val}`;
  });

  // 4. Replace '=' with ':' (should be handled above, but just in case)
  input = input.replace(/=/g, ":");

  return input;
}
