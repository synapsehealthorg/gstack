async function run() {
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/reactflow@11.11.4/dist/umd/index.min.js');
    const code = await res.text();
    
    // Load real react from workspace node_modules
    const React = require('react');
    const ReactDOM = require('react-dom');
    
    const mockGlobal = {
      React,
      ReactDOM
    };
    
    const fn = new Function('globalThis', 'self', 'window', 'React', 'ReactDOM', `
      ${code}
    `);
    
    fn(mockGlobal, mockGlobal, mockGlobal, React, ReactDOM);
    console.log("MockGlobal keys:", Object.keys(mockGlobal));
    if (mockGlobal.ReactFlow) {
      console.log("ReactFlow keys:", Object.keys(mockGlobal.ReactFlow));
      console.log("ReactFlow type:", typeof mockGlobal.ReactFlow);
      console.log("ReactFlow.default type:", typeof mockGlobal.ReactFlow.default);
      console.log("ReactFlow.ReactFlow type:", typeof mockGlobal.ReactFlow.ReactFlow);
      console.log("ReactFlow.Background type:", typeof mockGlobal.ReactFlow.Background);
      console.log("ReactFlow.Controls type:", typeof mockGlobal.ReactFlow.Controls);
      console.log("ReactFlow.Handle type:", typeof mockGlobal.ReactFlow.Handle);
      console.log("ReactFlow.Position:", mockGlobal.ReactFlow.Position);
    }
  } catch (e) {
    console.error("Error:", e.stack);
  }
}
run();
