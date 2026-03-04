import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateMapColoring } from './puzzleGenerator.ts';

describe('generateMapColoring', () => {
  it('should return a puzzle object with correct structure', () => {
    const userId = 'test-user-123';
    const puzzle = generateMapColoring(userId);

    assert.strictEqual(typeof puzzle.id, 'string');
    assert.strictEqual(puzzle.user_id, userId);
    assert.strictEqual(puzzle.type, 'map_coloring');
    assert.strictEqual(puzzle.title, 'Frequency Allocation');
    assert.strictEqual(typeof puzzle.description, 'string');
    assert.strictEqual(puzzle.difficulty, 'Hard');
    assert.strictEqual(puzzle.multiplier, 3);
    assert.strictEqual(puzzle.answer, 'JSON_VERIFY');

    const puzzleData = JSON.parse(puzzle.puzzle_data);
    assert.ok(Array.isArray(puzzleData.nodes));
    assert.ok(Array.isArray(puzzleData.edges));
  });

  it('should generate the expected static graph', () => {
    const puzzle = generateMapColoring('test-user');
    const puzzleData = JSON.parse(puzzle.puzzle_data);

    const expectedNodes = [
      { id: 'A', x: 20, y: 20 },
      { id: 'B', x: 80, y: 20 },
      { id: 'C', x: 50, y: 50 },
      { id: 'D', x: 20, y: 80 },
      { id: 'E', x: 80, y: 80 }
    ];

    const expectedEdges = [
      ['A', 'B'], ['A', 'C'], ['B', 'C'],
      ['A', 'D'], ['C', 'D'], ['C', 'E'], ['B', 'E'], ['D', 'E']
    ];

    assert.deepStrictEqual(puzzleData.nodes, expectedNodes);
    assert.deepStrictEqual(puzzleData.edges, expectedEdges);
  });
});
