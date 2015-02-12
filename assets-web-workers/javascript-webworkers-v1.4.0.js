/**
 * Firefox Web Workers Example v1.4.0
 *
 * http://pmav.eu/stuff/javascript-webworkers
 *
 * This example calculates a^b % c using N Web Wokers.
 *
 * pmav, 2009-2010
 */

(function () {

    MAIN = {

        workersNumber : 0,  // Total number of Web Workers (dynamic).
        workers: [],        // Web Workers reference.
        workersEnded : 0,   // Number of terminated Web Workers.

        base : null,
        power : null,
        mod : null,

        startTime : null,   // Current test start time.
        results : null,     // Current test results (for debugging).
        testNumber : 1,     // Current test number.

        benchmark : {       // Benchmark stuff.

            mode : false,
            currentTest : 0,
            currentRun: 0,
            runResults : [],
            finalResults : [],

            tests : [
            {
                workers: 1, 
                runs: 10,
                data : {
                    base : 2,
                    power : 2048000000, // 2 048 000 000
                    mod : 97777
                }
            },

            {
                workers: 2,
                runs: 10,
                data : {
                    base : 2,
                    power : 2048000000,
                    mod : 97777
                }
            },

            {
                workers: 4,
                runs: 10,
                data : {
                    base : 2,
                    power : 2048000000,
                    mod : 97777
                }
            },

            {
                workers: 8,
                runs: 10,
                data : {
                    base : 2,
                    power : 2048000000,
                    mod : 97777
                }
            },

            {
                workers: 16,
                runs: 10,
                data : {
                    base : 2,
                    power : 2048000000,
                    mod : 97777
                }
            }
            ]
        },


        /**
         * MAIN.run(int, int, int, int)
         *
         * Main code function (this will run only once per test).
         */
        run : function(workersNumber, base, power, mod) {
            var i, powers;

            // Initial setup.
            this.workersEnded = 0;
            this.workers = [];
            this.results = [];

            try {                
                this.workersNumber = workersNumber;
                this.base = base;
                this.power = power;
                this.mod = mod;

                // Divide work by Workers.
                powers = UTIL.powerDivision(power, workersNumber);

                // Setup Workers.
                for (i = 0; i < workersNumber; i++) {
                    this.workers[i] = new Worker(WORKER.scriptFilename);
                    this.workers[i].onmessage = this.callback;
                    this.workers[i].onerror = this.error;
                }

                this.startTime = new Date();

                // Start workers.
                for (i = 0; i < workersNumber; i++) {
                    this.sendMessage(i, base, powers[i], mod);
                }

            } catch (e) {
                alert(e);
            }
        },


        /**
         * MAIN.benchmark();
         *
         * Run several tests and output some useful info.
         */
        runBenchmark : function () {
            var test;

            if (this.benchmark.currentTest == 0) {
        
                // Benchmark start.
                this.benchmark.mode = true;
            }

            while (this.benchmark.tests[this.benchmark.currentTest].runs == 0) {
                // Skip current test.
                this.benchmark.currentTest++;
            }

            if (this.benchmark.currentRun < this.benchmark.tests[this.benchmark.currentTest].runs) {
        
                // Still have some runs to do.
                test = this.benchmark.tests[this.benchmark.currentTest];
                this.run(test.workers, test.data.base, test.data.power, test.data.mod);
                this.benchmark.currentRun++;

            } else {

                // Next test?
                this.benchmark.finalResults.push(UTIL.average(this.benchmark.runResults));
                this.benchmark.currentTest++;

                // Reset run.
                this.benchmark.currentRun = 0;
                this.benchmark.runResults = [];

                if (this.benchmark.currentTest < this.benchmark.tests.length) {
          
                    // Next test!
                    test = this.benchmark.tests[this.benchmark.currentTest];
                    this.run(test.workers, test.data.base, test.data.power, test.data.mod);
                    this.benchmark.currentRun++;

                } else {
          
                    // Benchmark end.
                    UTIL.logBenchmark("");

                    var i, s;
                    for (i = 0; i < this.benchmark.finalResults.length; i++) {
                        if (i == 0) {
                            s = "Standart Test, 100%";
                        } else {
                            s = Math.round(((this.benchmark.finalResults[i] / this.benchmark.finalResults[0]) * 100)) + "%";
                        }

                        UTIL.logBenchmark("Benchmark Group #"+(i+1)+" average: "+this.benchmark.finalResults[i]+" ms, "+this.benchmark.tests[i].workers+ " Worker" + ( this.benchmark.tests[i].workers === 1 ? "" : "s" ) + " [" + s + "]");
                    }

                    // Reset test.
                    this.benchmark.currentTest = 0;
                    this.benchmark.currentRun = 0;
                    this.benchmark.finalResults = [];
                    this.benchmark.mode = false;
          
                    JQ.callback();
                }
            }
        },
    

        /**
         * MAIN.sendMessage(int, int, int, int)
         *
         * Send a message to a Web Woker with id workerId.
         *
         * workerId - Web Worker unique ID.
         * base ^ power % mod
         */
        sendMessage : function(workerId, base, power, mod) {
            try {
                var data = {};
                data.workerId = workerId;
                data.payload = {};
                data.payload.base = base;
                data.payload.power = power;
                data.payload.mod = mod;

                this.workers[workerId].postMessage(JSON.stringify(data));

            } catch (e) {
                throw e;
            }
        },


        /**
         * MAIN.callback(object)
         *
         * Callback entry point (no context), this function executes in a single thread environment.
         */
        callback : function(event) {
            try {
                var i, result, data = JSON.parse(event.data);

                var workerId = data.workerId;
                var payload = data.payload;
        
                MAIN.workers[workerId].terminate();
                MAIN.workersEnded += 1;

                MAIN.results[workerId] = payload.result;

                if (MAIN.workersEnded === MAIN.workersNumber) { // All Web Workers are done.

                    // Merge results.
                    result = 1;

                    for (i = 0; i < MAIN.results.length; i++) {
                        result = (result * MAIN.results[i]) % MAIN.mod;
                    }

                    var time = ((new Date) - MAIN.startTime);

                    // Output run results.
                    var output = MAIN.testNumber + ") " + MAIN.workersNumber + " Worker" + ( MAIN.workersNumber === 1 ? "" : "s" ) + ", Test: "+MAIN.base+"^"+MAIN.power+" mod "+MAIN.mod+" = "+result+", "+ time + " ms";

                    if (MAIN.benchmark.mode) {
                        UTIL.logBenchmark(output);
                    } else {
                        UTIL.log(output);
                    }

                    MAIN.testNumber += 1;

                    if (MAIN.benchmark.mode) {
                        MAIN.benchmark.runResults.push(time);
                        MAIN.runBenchmark();
                    } else {
                        JQ.callback();
                    }
          
                }
        
            } catch (e) {
                alert(e);
            }
        },


        /**
         * MAIN.error(object)
         *
         * Handles worker errors (in a amazing way...).
         */
        error : function(error) {
            alert("Worker error: " + error);
        }
    
    }


    /**
     * WORKER
     *
     * Web Work related code.
     */
    WORKER = {

        scriptFilename : "assets-web-workers/javascript-webworkers-v1.4.0.js", // Web Worker script.


        /**
         * WORKER.run()
         *
         * Web Worker main code (thread dies after the execution of this code).
         */
        run : function() {
            onmessage = function(event) {
                var data = JSON.parse(event.data);

                var workerId = data.workerId;
                var payload = data.payload;
                var base, power, mod;

                data.workerId = workerId;
                data.payload = {};

                base = payload.base;
                power = payload.power;
                mod = payload.mod;

                data.payload.result = UTIL.power(base, power, mod);

                postMessage(JSON.stringify(data)); // Callback to MAIN.callback().

                return;
            };
        },


        /**
         * WORKER.isWorker()
         *
         * Check if active thread is a Web Worker.
         */
        isWorker : function() {
            if (typeof document === "undefined") {
                return true;
            } else {
                return false;
            }
        }

    };


    /**
     * UTIL
     *
     * Auxiliar code for this example.
     */
    UTIL = {

        /**
         * Return base^power % mod.
         */
        power : function(base, power, mod) {
            if (power == 0) {
                return 1;
            }

            var i = 0, total = base;
            power--;

            for (i = 0; i < power; i++) {
                total = (total * base) % mod;
            }

            return total;
        },


        /**
         * Return p splited into n slots.
         * Example:
         *  p = 13
         *  n = 3
         *  Return [5, 4, 4]
         */
        powerDivision : function(p, n) {
            var e = 0, i = 0, d = 0;
            var a = [];

            e = Math.floor(p/n);

            for (i = 0 ; i < n; i++) {
                a[i] = e;
            }

            if ((e * n) < p) {
                d = p - (e * n);
                for (i = 0 ; i < d; i++) {
                    a[i] += 1;
                }
            }

            return a;
        },

        logDom : null,
        logBenchmarkDom : null,

        log : function(loggingText) {
            if (this.logDom === null) {
                this.logDom = document.getElementById("log");
            }
      
            this.logDom.innerHTML = loggingText + "<br>" + this.logDom.innerHTML;
        },


        logBenchmark : function(loggingText) {
            if (this.logBenchmarkDom === null) {
                this.logBenchmarkDom = document.getElementById("benchmark-log");
            }

            this.logBenchmarkDom.innerHTML = loggingText + "<br>" + this.logBenchmarkDom.innerHTML;
        },


        average : function(values) {
            var i, sum = 0.0;

            for (i = 0; i < values.length; i++) {
                sum += values[i];
            }

            return Math.floor(sum / values.length);
        }
    }


    // Verifies if it is a Web Worker thread that is executing at the moment.
    if (WORKER.isWorker()) {
        WORKER.run();
    }

}());
