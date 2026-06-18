const fs = require('fs');
const path = require('path');

async function testCompile() {
  try {
    const res = await fetch('https://unpkg.com/@babel/standalone/babel.min.js');
    const babelCode = await res.text();
    
    // Evaluate babel standalone in a simple sandbox
    const mockGlobal = {
      window: {},
      navigator: { userAgent: "Node" }
    };
    mockGlobal.window = mockGlobal;
    
    const fn = new Function('window', 'exports', 'module', 'global', `
      ${babelCode}
    `);
    fn(mockGlobal, mockGlobal, { exports: mockGlobal }, mockGlobal);
    
    const Babel = mockGlobal;
    
    console.log("Babel Standalone loaded successfully.");
    
    const canvasJsPath = path.join(__dirname, '../canvas.js');
    const sourceCode = fs.readFileSync(canvasJsPath, 'utf8');
    
    console.log("Transpiling canvas.js...");
    const transpiled = Babel.transform(sourceCode, {
      presets: ['react'],
      filename: 'canvas.js'
    });
    
    console.log("Transpiled successfully! Code size:", transpiled.code.length);
  } catch (e) {
    console.error("Transpilation failed:", e);
  }
}
testCompile();
