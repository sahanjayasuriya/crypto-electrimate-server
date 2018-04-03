(function (rawDataController) {

    var config = require('../config/config');
    var billCalculationService = require('../service/bill-calculation-service');
    var database = config.database;

    /**
     * Process raw data received from modules and calculate the bill accordingly
     * This method is not secured with any HTTP security implementation
     */
    rawDataController.save = function (req, res) {
        try {
            // Serial Number of the module
            const moduleSerialNumber = req.body.moduleSerialNumber;
            const promises = [];
            // For each sensor connected PIN in the module
            req.body.data.forEach(function (sensor) {
                var sensorSerialNumber;
                var ref;
                // Query for Sensor Serial number of the sensor connected to the given PIN on the given Module
                const promise = database.ref('modules/' + moduleSerialNumber + '/sensors')
                    .once('value')
                    // Get Sensor ID
                    .then((sensorOfPin) => {
                        for (var s of sensorOfPin.val()) {
                            if (s.pin === sensor.pin) {
                                sensorSerialNumber = s.sensorId;
                                ref = database.ref('sensors/' + sensorSerialNumber + '/');
                                return s.sensorId;
                            }
                        }
                        throw new Error('Sensor Not Found');
                    })
                    // Get Processed Object
                    .then(() => {
                        // Previously processed data
                        const processed = ref.child('processed').once('value')
                        // Current Bill object of the sensor
                        const currentBill = ref.child('bills').orderByChild('current').equalTo(true)
                            .limitToFirst(1).once('value')
                        return Promise.all([processed, currentBill]);
                    })
                    // Process new Raw Data
                    .then((results) => {
                        const processedSnap = results[0];
                        const currentBillSnap = results[1];
                        // If no previous processed data, assign a new object
                        const processed = processedSnap.val() || {}
                        const processedAndSensorTotal = rawDataController.processRawData(processed, sensor.raw) // {totalRawWattHours, processed}

                        var sensorTotalWattHours = processedAndSensorTotal.totalRawWattHours;
                        var bill;
                        // Add the total of the previous bill to new total
                        currentBillSnap.forEach(function (currentBill) {
                            sensorTotalWattHours += (currentBill.val().wattHours || 0);
                            return true;
                        });

                        bill = {
                            serialNumber: sensorSerialNumber, // Sensor Serial Key
                            wattHours: sensorTotalWattHours
                        };

                        // Update new processed hourly data to database
                        const updateProcessedDataPromise = ref.child('/processed').update(processedAndSensorTotal.processed);
                        return Promise.all([bill, updateProcessedDataPromise]);

                    })
                    .then((results) => {
                        return results[0]
                    })
                    .catch((reason) => {
                        console.log(reason);
                    });
                promises.push(promise);
            });
            // Update the module bill after all sensor calculations are finished
            Promise.all(promises)
                .then((results) => {
                    console.log(results);
                    var wattHoursOfAllSensors = {
                        sensors: results,
                        totalWattHours: 0
                    };
                    results.forEach(sensor => {
                        wattHoursOfAllSensors.totalWattHours += sensor.wattHours;
                    })
                    const moduleBill = database.ref('modules/' + moduleSerialNumber + '/bills')
                        .orderByChild('current').equalTo(true).limitToFirst(1).once('value');
                    return Promise.all([wattHoursOfAllSensors, moduleBill]);
                })

                .then(function (results) {
                    const moduleBillSnap = results[1];
                    const wattHoursOfAllSensors = results[0]
                    var calculation;
                    moduleBillSnap.forEach((moduleBill) => {
                        var from = new Date(moduleBill.val().from);
                        var to = moduleBill.val().to || new Date();
                        calculation = billCalculationService.calculate(wattHoursOfAllSensors, from, to);
                        moduleBill.ref.update({
                            amount: calculation.total,
                            wattHours: wattHoursOfAllSensors.totalWattHours
                        });
                        return true;
                    });
                    return calculation;
                })
                .then(calculation => {
                    const promises = [];
                    calculation.sensors.forEach((sensor) => {
                        const sensorBill = database.ref('sensors/' + sensor.serialNumber + '/bills')
                            .orderByChild('current').equalTo(true).limitToFirst(1).once('value')
                            .then(function (currentBillSnap) {
                                currentBillSnap.forEach(function (currentBill) {
                                    currentBill.ref.update({
                                        amount: sensor.total,
                                        wattHours: sensor.wattHours
                                    });
                                    return true;
                                });
                            });
                        promises.push(sensorBill);
                    });
                    return Promise.all(promises)
                })
                .then(() => {
                    res.status(200);
                    res.end()
                })
                .catch((reason) => {
                    res.status(500)
                    res.end()
                })
        } catch (e) {
            console.log(e);
            res.status(500);
            res.end()
        }
    };

    /**
     * Calculate the total Watt Hours hourly and add them to previous calculations
     * @param processed: Previous processed data
     * @param raw: New data from sensors
     * @returns {{processed: *, totalRawWattHours: number}}
     */
    rawDataController.processRawData = (processed, raw) => {
        var totalRawWattHours = 0;
        raw.forEach(function (raw) {
            // Get the recorded time of Raw data
            const d = new Date();
            d.setTime(raw.dateTime);

            // Watt = Voltage x Current
            // WattHour = Watt x Usage Time in Hours
            const wattHour = raw.v * raw.i * (raw.timeDiff / 1000 / 60 / 60);
            if (!processed[d.getFullYear()]) {
                processed[d.getFullYear()] = {}
            }
            if (!processed[d.getFullYear()][d.getMonth() + 1]) {
                processed[d.getFullYear()][d.getMonth() + 1] = {}
            }
            if (!processed[d.getFullYear()][d.getMonth() + 1][d.getDate()]) {
                processed[d.getFullYear()][d.getMonth() + 1][d.getDate()] = {}
            }
            const x = (processed[d.getFullYear()][(d.getMonth() + 1)][d.getDate()][d.getHours()] || 0) + wattHour;
            totalRawWattHours += wattHour;
            processed[d.getFullYear()][(d.getMonth() + 1)][d.getDate()][d.getHours()] = x;

        });
        return {
            processed: processed,
            totalRawWattHours: totalRawWattHours
        };
    }


})(module.exports);