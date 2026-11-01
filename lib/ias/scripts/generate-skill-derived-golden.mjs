import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(root, "data");
const evidencePath = join(dataDir, "evidence.json");
const sourceFiles = [
  "paladin-crs-a1-golden.json",
  "paladin-7cr-a1-golden.json",
  "paladin-whm-a1-golden.json",
];
const skills = [
  { code: "SACRIFICE", skillId: 96 },
  { code: "VENGEANCE", skillId: 111 },
  { code: "CONVERSION", skillId: 116 },
];
const datasets = [];

for (const sourceFile of sourceFiles) {
  const sourceBytes = await readFile(join(dataDir, sourceFile));
  const source = JSON.parse(sourceBytes.toString("utf8"));
  const sourceHash = createHash("sha256").update(sourceBytes).digest("hex");
  for (const skill of skills) {
    datasets.push({
        derivedFrom: "PALADIN-A1-SKILL-DERIVED-3.3.93847",
        sourceGolden: `lib/ias/data/${sourceFile}`,
        gameBuild: source.gameBuild,
        skillId: skill.skillId,
        skill: skill.code,
        animationMode: "A1",
        weaponCode: source.weaponCode,
        WSM: source.weaponSpeedModifier,
        evidenceScope: "Paladin human single one-handed A1 hit; derived from existing A1 table, not an independent in-game measurement.",
        evidenceStatus: "DERIVED_RANGE_VALIDATION",
        sourceHash,
        rows: source.rows.map((sourceRow) => ({ IAS: sourceRow.ias, expectedFrames: sourceRow.fullAnimationFrames })),
    });
  }
}

const rowCount = datasets.reduce((total, dataset) => total + dataset.rows.length, 0);
if (rowCount !== 2160 || datasets.length !== 9) throw new Error(`Expected 9 datasets / 2160 rows, got ${datasets.length} / ${rowCount}.`);
const dataset = {
  datasetId: "PALADIN-A1-SKILL-DERIVED-3.3.93847",
  gameBuild: "3.3.93847",
  characterClass: "PALADIN",
  evidenceStatus: "DERIVED_RANGE_VALIDATION",
  independentGameMeasurement: false,
  sourceFiles,
  rowCount,
  datasets,
};
const datasetPath = join(dataDir, "paladin-a1-skill-derived-golden.json");
const datasetBytes = Buffer.from(`${JSON.stringify(dataset, null, 2)}\n`, "utf8");
await writeFile(datasetPath, datasetBytes);

const evidence = JSON.parse(await readFile(evidencePath, "utf8"));
evidence.evidenceVersion = "D2R-3.3.93847-IAS-4A2";
evidence.skillDerivedGolden = {
  path: "lib/ias/data/paladin-a1-skill-derived-golden.json",
  sha256: createHash("sha256").update(datasetBytes).digest("hex"),
  rowCount,
  datasetCount: datasets.length,
  evidenceStatus: "DERIVED_RANGE_VALIDATION",
  independentGameMeasurement: false,
  expectedValuesSource: "Existing unchanged Paladin A1 Golden datasets, grouped by skill and weapon; not a separate in-game measurement.",
  sourceFiles: await Promise.all(sourceFiles.map(async (sourceFile) => ({
    path: `lib/ias/data/${sourceFile}`,
    sha256: createHash("sha256").update(await readFile(join(dataDir, sourceFile))).digest("hex"),
  }))),
};
evidence.skillSourceFiles = [
  { name: "skills.txt", path: "C:\\IAS-Validation-Temp\\03-skills-extracted\\data\\data\\global\\excel\\skills.txt", sha256: "56944cb6b6b0f3c57f7b690977987a732afeafc961fa9dc969e7796e54c93f3f" },
  { name: "skilldesc.txt", path: "C:\\IAS-Validation-Temp\\03-skills-extracted\\data\\data\\global\\excel\\skilldesc.txt", sha256: "cdf11c518eab9fe678616a237fc64b28cea5ea51649ec641a14e09b06ea34b38" },
  { name: "plrmode.txt", path: "C:\\IAS-Validation-Temp\\03-skills-extracted\\data\\data\\global\\excel\\plrmode.txt", sha256: "23106da08603bc215624e2837f3990b5ed4b5521bbe8b4a80b0ea6b6502fb8e3" },
];
evidence.limitations = [...new Set([
  ...evidence.limitations,
  "Sacrifice, Vengeance, and Conversion rows in the skill-derived dataset are inherited from existing A1 Golden expectations and are not independent game measurements.",
  "Gameplay-specific frame capture was not performed; A2, Zeal, Smite, skill/aura IAS, dual wielding, and repeated-attack cadence remain outside support.",
])];
await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
console.log(`Wrote ${rowCount} skill-derived A1 validation rows in ${datasets.length} metadata-bound groups from the unchanged A1 files.`);
