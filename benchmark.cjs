const { performance } = require('perf_hooks');

const canvas = { width: 800, height: 600 };
class Particle {
  constructor() {
    // start near edges to force bounds checking
    this.x = Math.random() > 0.5 ? -10 : canvas.width + 10;
    this.y = Math.random() > 0.5 ? -10 : canvas.height + 10;
    this.size = Math.random() * 2 + 0.1;
    this.speedX = Math.random() * 10 - 5;
    this.speedY = Math.random() * 10 - 5;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size > 0.2) this.size -= 0.001;
  }
  draw() {
    // mock draw
  }
}

function runBenchmark() {
  console.log("Generating 20,000 particles...");
  const particlesOriginal = [];
  for(let i=0; i<20000; i++) particlesOriginal.push(new Particle());

  // Test Splice
  let pCopy1 = particlesOriginal.slice();
  let start = performance.now();
  for (let i = 0; i < pCopy1.length; i++) {
    pCopy1[i].update();
    pCopy1[i].draw();

    if (pCopy1[i].x < 0 || pCopy1[i].x > canvas.width ||
        pCopy1[i].y < 0 || pCopy1[i].y > canvas.height) {
       pCopy1.splice(i, 1);
       i--;
    }
  }
  let timeSplice = performance.now() - start;

  // Test In-Place
  let pCopy2 = particlesOriginal.slice();
  start = performance.now();
  let keepCount = 0;
  for (let i = 0; i < pCopy2.length; i++) {
    const p = pCopy2[i];
    p.update();
    p.draw();

    if (p.x >= 0 && p.x <= canvas.width &&
        p.y >= 0 && p.y <= canvas.height) {
       pCopy2[keepCount++] = p;
    }
  }
  pCopy2.length = keepCount;
  let timeInPlace = performance.now() - start;

  console.log(`Baseline (Splice O(N^2)): ${timeSplice.toFixed(2)} ms`);
  console.log(`Optimized (In-place O(N)): ${timeInPlace.toFixed(2)} ms`);
  console.log(`Improvement: ${(timeSplice / timeInPlace).toFixed(2)}x faster`);
}

runBenchmark();
