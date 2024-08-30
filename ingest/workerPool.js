const { Worker } = require('worker_threads');
const path = require('path');

class WorkerPool {
    constructor(workerPath, poolSize, onTaskComplete) {
        this.workerPath = workerPath;
        this.poolSize = poolSize;
        this.workers = [];
        this.queue = [];
        this.activeWorkers = 0;
        this.onTaskComplete = onTaskComplete;

        for (let i = 0; i < poolSize; i++) {
            this.workers.push(this.createWorker());
        }
    }

    createWorker() {
        const worker = new Worker(path.resolve(__dirname, this.workerPath));
        worker.on('message', (message) => {
            this.activeWorkers--;
            if (message.success) {
                console.log(message.response);
            } else {
                console.error(message.error);
            }
            this.onTaskComplete(); // Call the callback function
            this.runNext();
        });
        worker.on('error', (error) => {
            console.error(error);
            this.activeWorkers--;
            this.runNext();
        });
        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
        });
        return worker;
    }

    runNext() {
        if (this.queue.length > 0 && this.activeWorkers < this.poolSize) {
            const { line } = this.queue.shift();
            this.activeWorkers++;
            this.workers[this.activeWorkers % this.poolSize].postMessage(line);
        }
    }

    addTask(line) {
        this.queue.push({ line });
        this.runNext();
    }
}

module.exports = WorkerPool;