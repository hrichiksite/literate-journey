const readline = require('readline');
const fs = require('fs');
const WorkerPool = require('./workerPool');

const checkpointFile = 'checkpoint.txt';
let lastProcessedLine = 0;

// Read the checkpoint file to get the last processed line number
if (fs.existsSync(checkpointFile)) {
    lastProcessedLine = parseInt(fs.readFileSync(checkpointFile, 'utf8'), 10);
}

const rl = readline.createInterface({
    input: fs.createReadStream('/tmp/works'),
    output: process.stdout,
    terminal: false
});

const poolSize = 4; // Adjust the pool size based on your system's capacity
let currentLine = 0;

// Function to update the checkpoint file
const updateCheckpoint = () => {
    fs.writeFileSync(checkpointFile, currentLine.toString(), 'utf8');
};

// Callback function to handle task completion
const onTaskComplete = () => {
    updateCheckpoint();
};

const workerPool = new WorkerPool('./worker.js', poolSize, onTaskComplete);

rl.on('line', (line) => {
    currentLine++;
    if (currentLine <= lastProcessedLine) {
        return; // Skip already processed lines
    }

    workerPool.addTask(line);
});

rl.on('close', () => {
    updateCheckpoint(); // Final update to the checkpoint file
    console.log('All lines have been processed.');
});