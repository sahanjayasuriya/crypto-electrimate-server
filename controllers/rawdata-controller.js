(function (rawDataController) {

    var config = require('../config/config');
    var billCalculationService = require('../service/bill-calculation-service');

    var firebaseAdmin = config.firebaseAdmin;
    var database = config.database;

    rawDataController.save = function (req, res) {
        try {
            var count = 0;
            var moduleTotalWattHours = 0;
            var moduleSerialNumber = req.body.moduleSerialNumber;
            req.body.data.forEach(function (value) {
                var ref = database.ref('sensors/' + value.serialNumber + '/');
                var sensorTotalWattHours = 0;
                ref.child('processed').once('value', function (processedSnap) {
                    var processed = processedSnap.val() || {};
                    var rawValues = {};
                    value.raw.forEach(function (raw) {
                        var newKey = ref.child('raw').push().key;
                        raw['processed'] = false;
                        rawValues['/' + newKey] = raw;

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
                        sensorTotalWattHours += wattHour;
                        moduleTotalWattHours += wattHour;
                        processed[d.getFullYear()][(d.getMonth() + 1)][d.getDate()][d.getHours()] = x;

                    });
                    ref.child('bills').orderByChild('current').equalTo(true).limitToFirst(1)
                        .once('value')
                        .then(function (currentBillSnap) {
                            currentBillSnap.forEach(function (a) {
                                sensorTotalWattHours += (a.val().wattHours || 0);
                                a.ref.update({
                                    amount: billCalculationService.calculate(sensorTotalWattHours),
                                    wattHours: sensorTotalWattHours
                                });
                                return true;
                            });
                        });
                    ref.child('raw').update(rawValues)
                        .then(function (snapshot) {
                            count++;
                            if (count == req.body.data.length) {
                                console.log(moduleSerialNumber, value.serialNumber);
                                database.ref('modules/' + moduleSerialNumber + '/bills').orderByChild('current').equalTo(true).limitToFirst(1)
                                    .once('value')
                                    .then(function (moduleBillSnap) {
                                        moduleBillSnap.forEach(function (a) {
                                            moduleTotalWattHours += (a.val().wattHours || 0);
                                            a.ref.update({
                                                amount: billCalculationService.calculate(moduleTotalWattHours),
                                                wattHours: moduleTotalWattHours
                                            });
                                            return true;
                                        });
                                    });
                                res.send(snapshot);
                                res.status(200);
                                res.end()
                            }
                        })
                        .catch(function (err) {
                            count++;
                            if (count == req.body.length) {
                                console.log(err);
                                res.status(500);
                                res.end();
                            }
                        });
                    ref.child('/processed').update(processed);
                });
            });
        } catch (e) {
            console.log(e);
        }
    };

    rawDataController.process = function (req, res) {
        var ref = database.ref('sensors/sensor1/');
        try {
            ref.child('processed').once('value', function (processedSnap) {
                var processed = processedSnap.val() || {};
                ref.child('raw').orderByChild('processed').equalTo(false).limitToFirst(100).on('value', function (data) {
                    data.forEach(function (rawSnap) {
                        var raw = rawSnap.val();
                        // console.log(raw);
                        var d = new Date();
                        d.setTime(raw.dateTime);
                        console.log(rawSnap.key + " " + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds());
                        var watt = raw.v * raw.i;
                        if (!processed[d.getFullYear()]) {
                            processed[d.getFullYear()] = {}
                        }
                        if (!processed[d.getFullYear()][d.getMonth() + 1]) {
                            processed[d.getFullYear()][d.getMonth() + 1] = {}
                        }
                        if (!processed[d.getFullYear()][d.getMonth() + 1][d.getDate()]) {
                            processed[d.getFullYear()][d.getMonth() + 1][d.getDate()] = {}
                        }
                        var x = (processed[d.getFullYear()][(d.getMonth() + 1)][d.getDate()][d.getHours()] || 0) + watt;
                        console.log(x);
                        processed[d.getFullYear()][(d.getMonth() + 1)][d.getDate()][d.getHours()] = x;
                        // });

                    });
                    ref.child('/processed').update(processed);
                });
            })
        } catch (e) {
            console.log(e);
        }
        res.status(200);
        res.end();
    }


})(module.exports);