const { getAsset, getRawAsset } = require('node:sea');
const fs = require('fs');
const { createRequire } = require('module');
const originalRequire = require;
const requireFromDisk = createRequire(__filename);
const path = require('path');
const { spawn } = require('child_process');
const zblackPath = path.join(__dirname, 'zblack-win-x64.exe');
const os = require('os');

global.require = (name) => {
  try {
    return originalRequire(name);
  } catch {
    return requireFromDisk(name);
  }
};

function transpileZ3ToJS(z3Code) {
    //dummy code can be used to test the transpiler.
    //is called below in if statement.
  return z3Code;
}

let wantsInspect = false;
let wantsBreak = false;
let wantsZblackOnly = false;
let buffer = getAsset('b.txt', 'utf8');
let jsFileToRun = null;

for (const arg of process.argv) {
  if (arg === '--zblack-only') {
    wantsZblackOnly = true;
  } else if (arg.startsWith('--inspect')) {
    wantsInspect = true;
    if (arg.startsWith('--inspect-brk')) wantsBreak = true;
  } else if (arg.endsWith('.js')) {
    jsFileToRun = arg;
  }
}






if (wantsZblackOnly && buffer) {
  try {
    const child = spawn(zblackPath, [], {
      stdio: ['pipe', 'inherit', 'inherit']
    });
    child.stdin.write(buffer);
    child.stdin.end();
    child.on('exit', (code) => {
      console.log(`zblack successfully exited. Code: ${code}`);
    });
  } catch (err) {
    console.error(`Error running zblack with file ${buffer}:`, err.message);
  }
} else if (!wantsZblackOnly && buffer) {
  try {
    const jsCode = transpileZ3ToJS(buffer);
    let codeToExecute = jsCode;
    if (wantsInspect) {
      // Write transpiled code to a temp file where which node can inspect.
      const tmp = require('os').tmpdir();
      const tmpFile = path.join(tmp, `z3-transpiled-${Date.now()}.js`);
      fs.writeFileSync(tmpFile, jsCode, 'utf8');
      const inspectFlag = wantsBreak ? '--inspect-brk' : '--inspect';
      const child = spawn(process.execPath, [inspectFlag, tmpFile], {
        stdio: 'inherit'
      });
      child.on('exit', (code) => {
        fs.unlinkSync(tmpFile);
        process.exit(code);
      });
      return;
    }
    if (wantsBreak) {
      codeToExecute = 'debugger;\n' + jsCode;
    }
    eval(codeToExecute);
  } catch (err) {
    console.error(`Error transpiling or executing z3 code:`, err.message);
  }
} else if (!wantsZblackOnly) {
  console.error("Error with loading in assets, source file not found.");
} 