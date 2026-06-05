import { performance } from 'perf_hooks';

// Mocking marketAnalysis
const marketAnalysis = {
  differentiationAngles: Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    isWinner: i === 999, // Worst case
    title: `Title ${i}`,
    positioningStatement: `Statement ${i}`
  }))
};

function runUnoptimized() {
  const slides = [
    {
      id: 'agenda',
      content: marketAnalysis?.differentiationAngles.find(a => a.isWinner)?.title || "Default"
    },
    {
      id: 'solution',
      content: marketAnalysis?.differentiationAngles.find(a => a.isWinner)?.positioningStatement || "Default"
    }
  ];
  return slides;
}

function runOptimized() {
  const winningAngle = marketAnalysis?.differentiationAngles?.find(a => a.isWinner);
  const slides = [
    {
      id: 'agenda',
      content: winningAngle?.title || "Default"
    },
    {
      id: 'solution',
      content: winningAngle?.positioningStatement || "Default"
    }
  ];
  return slides;
}

const ITERATIONS = 100000;

// Warmup
for (let i = 0; i < 1000; i++) {
  runUnoptimized();
  runOptimized();
}

const startUnopt = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  runUnoptimized();
}
const endUnopt = performance.now();

const startOpt = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  runOptimized();
}
const endOpt = performance.now();

console.log(`Unoptimized: ${(endUnopt - startUnopt).toFixed(2)}ms`);
console.log(`Optimized: ${(endOpt - startOpt).toFixed(2)}ms`);
console.log(`Improvement: ${(((endUnopt - startUnopt) - (endOpt - startOpt)) / (endUnopt - startUnopt) * 100).toFixed(2)}%`);
