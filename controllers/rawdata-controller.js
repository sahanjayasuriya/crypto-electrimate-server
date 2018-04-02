(function (rawDataController) {

    var config = require('../config/config');
    var billCalculationService = require('../service/bill-calculation-service');
    var database = config.database;

    rawDataController.save = function (req, res) {
        try {
            var moduleSerialNumber = req.body.moduleSerialNumber;
            const promises = [];
            req.body.data.forEach(function (sensor) {
                console.log(sensor.pin);
                var sensorSerialNumber;
                var ref;
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
                        const processed = ref.child('processed').once('value')
                        const currentBill = ref.child('bills').orderByChild('current').equalTo(true).limitToFirst(1).once('value')
                        return Promise.all([processed, currentBill]);
                    })
                    // Process new Raw Data
                    .then((results) => {
                        const processedSnap = results[0];
                        const currentBillSnap = results[1];
                        const processed = processedSnap.val() || {}
                        const processedAndSensorTotal = rawDataController.processRawData(processed, sensor.raw) // {totalRawWattHours, processed}

                        var sensorTotalWattHours = processedAndSensorTotal.totalRawWattHours;
                        var bill;
                        currentBillSnap.forEach(function (currentBill) {
                            sensorTotalWattHours += (currentBill.val().wattHours || 0);
                            return true;
                        });

                        bill = {
                            serialNumber: sensorSerialNumber, // Sensor Serial Key
                            wattHours: sensorTotalWattHours
                        };

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
                    const moduleBill = database.ref('modules/' + moduleSerialNumber + '/bills').orderByChild('current').equalTo(true).limitToFirst(1).once('value');
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
                        const sensorBill = database.ref('sensors/' + sensor.serialNumber + '/bills').orderByChild('current').equalTo(true).limitToFirst(1).once('value')
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

    rawDataController.processRawData = (processed, raw) => {
        var totalRawWattHours = 0;
        raw.forEach(function (raw) {
            var d = new Date();
            d.setTime(raw.dateTime);

            var wattHour = raw.v * raw.i * (raw.timeDiff / 1000 / 60 / 60);
            if (!processed[d.getFullYear()]) {
                processed[d.getFullYear()] = {}
            }
            if (!processed[d.getFullYear()][d.getMonth() + 1]) {
                processed[d.getFullYear()][d.getMonth() + 1] = {}
            }
            if (!processed[d.getFullYear()][d.getMonth() + 1][d.getDate()]) {
                processed[d.getFullYear()][d.getMonth() + 1][d.getDate()] = {}
            }
            var x = (processed[d.getFullYear()][(d.getMonth() + 1)][d.getDate()][d.getHours()] || 0) + wattHour;
            totalRawWattHours += wattHour;
            processed[d.getFullYear()][(d.getMonth() + 1)][d.getDate()][d.getHours()] = x;

        });
        return {
            processed: processed,
            totalRawWattHours: totalRawWattHours
        };
    }


})(module.exports);