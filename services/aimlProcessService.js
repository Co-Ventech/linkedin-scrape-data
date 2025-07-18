

const { spawn } = require('child_process');
const path = require('path');

async function runAimlProcessing() {
    return new Promise((resolve, reject) => {
        const py = spawn('python', [path.join(__dirname, '../python/linkedin_aiml_updated.py')]);

        py.stdout.on('data', (data) => {
            console.log(`Python stdout: ${data}`);
        });

        py.stderr.on('data', (data) => {
            console.error(`Python stderr: ${data}`);
        });

        py.on('close', (code) => {
            if (code === 0) {
                resolve('Processing complete. Check data/scored_jobs_output.json');
            } else {
                reject(new Error(`Python script exited with code ${code}`));
            }
        });
    });
}

module.exports = { runAimlProcessing };