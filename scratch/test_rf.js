const fetch = require('node-fetch'); // wait, node-fetch is not installed, we can use standard fetch in Node 25 or Node 18
async function check() {
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/reactflow@11.11.4/dist/umd/index.min.js');
    const text = await res.text();
    console.log("ReactFlow UMD Length:", text.length);
    // Let's search for "global.ReactFlow" or similar export definition
    const match = text.match(/factory\(([^)]+)\)/) || text.substring(0, 1000);
    console.log("ReactFlow Header:", text.substring(0, 500));
  } catch (e) {
    console.error(e);
  }
}
check();
