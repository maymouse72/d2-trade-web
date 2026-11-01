import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dataDir = join(root, "data");
const referenceBytes = await readFile(join(dataDir, "paladin-zeal-1hs-reference.json"));
const reference = JSON.parse(referenceBytes.toString("utf8"));
const referenceHash = createHash("sha256").update(referenceBytes).digest("hex");
const longSwordReference = JSON.parse((await readFile(join(dataDir, "paladin-lsd-zeal-reference.json"))).toString("utf8"));
const weapons = [
  { code: "crs", name: "Crystal Sword", wsm: 0, maxIAS: 360 },
  { code: "7cr", name: "Phase Blade", wsm: -30, maxIAS: 72 },
  { code: "whm", name: "War Hammer", wsm: 20, maxIAS: 456 },
  { code: "lsd", name: "Long Sword", wsm: -10, maxIAS: 142 },
];

function referenceFor(eias) {
  let selected = reference.rows[0];
  for (const row of reference.rows) {
    if (row[0] > eias) break;
    selected = row;
  }
  return { first: selected[1], follow: selected[2], last: selected[3] };
}

const datasets = [];
for (const weapon of weapons) {
  const rows = [];
  for (let ias = 0; ias <= weapon.maxIAS; ias += 1) {
    const itemEIAS = Math.floor((120 * ias) / (120 + ias));
    const eias = Math.max(-85, Math.min(75, itemEIAS - weapon.wsm));
    const frames = referenceFor(eias);
    for (let hitCount = 2; hitCount <= 5; hitCount += 1) {
      rows.push({
        IAS: ias,
        EIAS: eias,
        hitCount,
        firstAttackFrames: frames.first,
        followUpAttackFrames: frames.follow,
        finalAttackFrames: frames.last,
        hitEventFrames: Array.from({ length: hitCount }, (_, index) => frames.first + index * frames.follow),
        totalSequenceFrames: frames.first + (hitCount - 2) * frames.follow + frames.last,
      });
    }
  }
  datasets.push({
    datasetId: `PALADIN-${weapon.code.toUpperCase()}-ZEAL-D2R-3.3.93847`,
    gameBuild: "3.3.93847",
    characterClass: "PALADIN",
    characterForm: "HUMAN",
    skill: "ZEAL",
    skillId: 106,
    animationMode: "A1",
    weaponCode: weapon.code,
    weaponName: weapon.name,
    weaponClass: "1hs",
    WSM: weapon.wsm,
    IASRange: { min: 0, max: weapon.maxIAS },
    hitCountRange: { min: 2, max: 5 },
    evidenceStatus: "REFERENCE_TABLE_EXPANSION",
    sourceReference: "lib/ias/data/paladin-zeal-1hs-reference.json",
    sourceHash: referenceHash,
    ...(weapon.code === "lsd" ? {
      independentBreakpointReference: {
        url: longSwordReference.url,
        version: longSwordReference.version,
        gameBuild: longSwordReference.gameBuild,
        evidenceStatus: "INDEPENDENT_BREAKPOINT_CROSS_CHECK",
        rows: longSwordReference.rows,
      },
    } : {}),
    rows,
  });
}

const output = {
  datasetId: "PALADIN-ZEAL-GOLDEN-D2R-3.3.93847",
  gameBuild: "3.3.93847",
  evidenceStatus: "REFERENCE_TABLE_EXPANSION",
  expectedValuesSource: "Fixed Amazon Basin Paladin 1HS Zeal First/Follow/Last table by EIAS. IAS values and hit counts are expanded from that fixed reference, independently of the runtime frame formula.",
  referenceHash,
  rowCount: datasets.reduce((sum, dataset) => sum + dataset.rows.length, 0),
  datasets,
};
await writeFile(join(dataDir, "paladin-zeal-golden.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
