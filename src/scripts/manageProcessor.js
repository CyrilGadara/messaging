const { fork } = require("child_process");
const path = require("path");
const logger = require("../utils/logger");

const processManager = {
    processor: null,

    // Define the processor path as a property of the processManager
    processorPath: path.join(__dirname, "campaignProcessor.js"),

    start: async function () {
        console.log("Initializing process manager...");

        // Check if processorPath is defined
        if (!this.processorPath) {
            throw new Error("processorPath is not defined");
        }

        // Attempt to fork the process
        try {
            console.log("Attempting to fork the processor...");
            this.processor = fork(this.processorPath, {
                cwd: path.dirname(this.processorPath),
                silent: false,
            });

            this.processor.on("error", (error) => {
                console.error(`Error in processor: ${error}`);
            });

            this.processor.on("exit", (code) => {
                console.log(`Processor exited with code ${code}`);
                this.processor = null; // Reset the processor reference
                // Optional: Restart logic or cleanup could go here
            });

            console.log("Processor started successfully");
        } catch (error) {
            console.error(`Failed to fork the processor: ${error.message}`);
            throw new Error(`Failed to fork the processor, processManager.processor is null.`);
        }
    },

    stop: function () {
        if (this.processor) {
            this.processor.kill("SIGTERM"); // Gracefully stop the processor
            console.log("Processor stopped successfully");
            this.processor = null; // Clear the processor reference
        } else {
            console.log("No processor to stop");
        }
    },
};

module.exports = processManager;
