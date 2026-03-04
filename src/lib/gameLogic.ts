export function checkAnswer(puzzle: any, answer: any): boolean {
  if (puzzle.type === 'map_coloring') {
    try {
      const coloring = typeof answer === 'string' ? JSON.parse(answer) : answer;
      const data = JSON.parse(typeof puzzle.puzzle_data === 'string' ? puzzle.puzzle_data : JSON.stringify(puzzle.puzzle_data));
      for (const [u, v] of data.edges) {
        if (coloring[u] === undefined || coloring[v] === undefined) return false;
        if (coloring[u] === coloring[v]) return false;
      }
      return new Set(Object.values(coloring)).size <= 4;
    } catch { return false; }
  }
  return String(answer).trim().toLowerCase() === String(puzzle.answer).toLowerCase();
}

export function calcRank(score: number): string {
  if (score >= 1000) return 'Director';
  if (score >= 500) return 'Special Agent';
  if (score >= 200) return 'Field Agent';
  return 'Recruit';
}

export function calcLevel(score: number): number {
  return Math.floor(score / 500) + 1;
}
