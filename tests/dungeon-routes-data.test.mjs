import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routes = JSON.parse(readFileSync(new URL('../lib/dungeon-routes/routes.json', import.meta.url)));
const known = {
  tower: [1, 'LEFT', 'ENTRANCE_TILE', 4],
  catacombs: [1, 'RIGHT', 'WAYPOINT_TILE', 2],
  durance: [3, 'LEFT', 'WAYPOINT_TILE', 1],
  worldstone: [5, 'RIGHT', 'WAYPOINT_TILE', 2],
};

test('MAP-01 던전과 층별 근거', () => {
  assert.deepEqual(routes.map(r => r.id).sort(), Object.keys(known).sort());
  for (const route of routes) {
    const [act, direction, reference, count] = known[route.id];
    assert.equal(route.act, act);
    assert.equal(route.segments.length, count);
    assert.ok(route.start && route.finish && route.boss && route.verifiedVersion);
    assert.ok(route.sources.length && route.sources.every(s => new URL(s).protocol === 'https:'));
    assert.ok(readFileSync(new URL('../public' + route.diagram, import.meta.url)).length);
    for (const [i, s] of route.segments.entries()) {
      assert.ok(s.from && s.to);
      const uncertain = route.id !== 'tower' && i > 0;
      assert.equal(s.direction, uncertain ? 'UNKNOWN' : direction);
      assert.equal(s.reference, uncertain ? 'GENERAL' : reference);
      assert.equal(s.confidence, uncertain ? 'UNVERIFIED' : 'COMMUNITY_RULE');
    }
    assert.doesNotMatch(JSON.stringify(route), /\d+\s*%/);
  }
});
