import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const goldenPath = join(root, "data", "paladin-crs-a1-golden.json");
const evidencePath = join(root, "data", "evidence.json");

// The expected ranges are transcribed from the published build-specific
// Paladin 1HS WSM 0 table; this generator does not call the IAS formula.
const sourceRanges = [
  { min: 0, max: 8, frames: 14 },
  { min: 9, max: 18, frames: 13 },
  { min: 19, max: 31, frames: 12 },
  { min: 32, max: 53, frames: 11 },
  { min: 54, max: 85, frames: 10 },
  { min: 86, max: 151, frames: 9 },
  { min: 152, max: 200, frames: 8 },
];

const rows = [];
for (const range of sourceRanges) {
  for (let ias = range.min; ias <= range.max; ias += 1) {
    rows.push({ ias, fullAnimationFrames: range.frames });
  }
}

const dataset = {
  datasetId: "PALADIN-CRS-A1-D2R-3.3.93847",
  gameBuild: "3.3.93847",
  characterClass: "PALADIN",
  characterForm: "HUMAN",
  attackMode: "NORMAL",
  animation: "A1",
  weaponCode: "crs",
  weaponName: "Crystal Sword",
  weaponClass: "1hs",
  weaponSpeedModifier: 0,
  skillIAS: 0,
  iasMin: 0,
  iasMax: 200,
  metric: "FULL_ANIMATION_FRAMES",
  sourceTableRanges: sourceRanges,
  source: {
    url: "https://d2r.org/tools/breakpoints/paladin",
    accessed: "2026-11-01",
    description:
      "Paladin one-handed swing, WSM 0, normal attack table for D2R build 3.3.93847. The source reports PAA11HS as 15 frames per direction at animation speed 256 and gives the frame ranges expanded above.",
  },
  generatedBy: "lib/ias/scripts/generate-golden.mjs; expands sourceTableRanges only; does not use calculate.ts",
  rows,
};

if (rows.length !== 201 || rows.some((row, index) => row.ias !== index)) {
  throw new Error("Golden data must contain each IAS value from 0 through 200 exactly once.");
}

await mkdir(dirname(goldenPath), { recursive: true });
await writeFile(goldenPath, `${JSON.stringify(dataset, null, 2)}\n`, "utf8");
const goldenHash = createHash("sha256").update(await readFile(goldenPath)).digest("hex");

const evidence = {
  evidenceVersion: "D2R-3.3.93847-IAS-2A",
  accessed: "2026-11-01",
  goldenDataset: {
    path: "lib/ias/data/paladin-crs-a1-golden.json",
    sha256: goldenHash,
    rowCount: rows.length,
    expectedValuesSource: "Published independent frame ranges expanded to integer IAS rows, not calculated by the engine.",
  },
  externalReferences: [
    {
      title: "D2R Paladin breakpoints",
      url: "https://d2r.org/tools/breakpoints/paladin",
      supports: ["D2R build 3.3.93847", "PAA11HS: FPD 15 / animation speed 256", "Paladin 1HS WSM 0 normal attack frame table", "frame formula and rounding description"],
    },
    {
      title: "Amazon Basin Paladin attack speed",
      url: "https://www.theamazonbasin.com/wiki/index.php/Paladin_attack_speed",
      supports: ["Paladin 1HS ActionFlag 7", "FPD 15", "AnimationSpeed 256", "StartingFrame 0"],
    },
    {
      title: "D2R IAS calculation reference",
      url: "https://d2r-tools.com/ias/calculations",
      supports: ["EIAS and WSM sign", "human-form speed increase floor", "full animation frame calculation"],
    },
  ],
  originalSourceFiles: [
    { name: "animdata.d2", sha256: "61ea70ede691e88a4bf375d872668d74d6cdca4ed5235034188ed1eb0d1e8ee5" },
    { name: "weapons.txt", sha256: "b0890901f87fd42fcb474ce835b6e1a9fe1e66dbab4e7c2f236a3d9c3224f923" },
    { name: "itemtypes.txt", sha256: "ae957abde89a2d0276a55feffa809e0ccbdaf82f65c6eaed9443b886b960e26a" },
    { name: "paa11hs.cof", sha256: "0447c43cea898812dad91e1f815c08cc6f5e68094cb767c3bea9682c8fa2a855" },
    { name: "paa21hs.cof", sha256: "1f771bf18d40770aadf9be7907587c171862b2f5ba976f8bbb2b552a9befc532" },
  ],
  limitations: [
    "The dataset verifies A1 full-animation frames for WSM 0 only.",
    "It does not verify A2 runtime selection, damage hit registration, or APS under repeated-input gameplay.",
    "Local weapons.txt speed for Crystal Sword is blank; the resolved WSM 0 comes from independent base-item data and the matching reference table.",
  ],
};
await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
console.log(`Wrote ${rows.length} independent rows; SHA-256 ${goldenHash}`);
