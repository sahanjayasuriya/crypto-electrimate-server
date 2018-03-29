(function (billCalculationService) {

    const NUMBER_OF_DAYS_PER_MONTH = 30;

    billCalculationService.calculate = function (moduleWattHours, from, to) {
        var dateDiff = this.dateDiff(from, to);
        console.log(dateDiff)
        var moduleTotal = 0;
        moduleWattHours.sensors.forEach(function (sensor) {
            var percentage = sensor.wattHours / moduleWattHours.totalWattHours * 100;
            var daysCount = dateDiff * percentage / 100;
            console.log('Percentage:', percentage, 'Date Diff:', daysCount)
            var total = billCalculationService.calculateAmount(sensor.wattHours / 1000, daysCount);
            console.log(total);
            sensor.total = total;
            moduleTotal += total;
        })
        moduleWattHours.total = moduleTotal;
        return moduleWattHours;
    };

    billCalculationService.dateDiff = function (from, to) {
        var timeDiff = Math.abs(from.getTime() - to.getTime());
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }


    billCalculationService.ratio = function (unit, days) {
        return Math.ceil(unit * days / NUMBER_OF_DAYS_PER_MONTH);
    }

    billCalculationService.calculateAmount = function (wattHours, days) {
        var ranges = [{
            from: 0,
            to: billCalculationService.ratio(60, days),
            unitPrice: 7.85
        },
            {
                from: billCalculationService.ratio(60, days),
                to: billCalculationService.ratio(90, days),
                unitPrice: 10
            },
            {
                from: billCalculationService.ratio(90, days),
                to: billCalculationService.ratio(120, days),
                unitPrice: 27.75
            },
            {
                from: billCalculationService.ratio(120, days),
                to: billCalculationService.ratio(180, days),
                unitPrice: 32
            },
            {
                from: billCalculationService.ratio(180, days),
                to: 9999999999999999,
                unitPrice: 45
            }
        ];
        console.log(ranges);
        var total = 0;
        var prevRange = {
            to: 0
        };
        var prevUnits = 0;
        for (var range of ranges) {
            // console.log(range)
            // console.log(prevUnits);
            // console.log(prevRange);
            // console.log(wattHours);

            if (wattHours > range.to) {
                prevUnits = range.to - prevRange.to;
                total += prevUnits * range.unitPrice;
                prevRange = range;
            } else {
                prevUnits = wattHours - prevRange.to;
                total += prevUnits * range.unitPrice;
                break;
            }
        }
        return total;
    }

})(module.exports);

var service = require('./bill-calculation-service');

var moduleWattHours = {
    sensors: [{
        serialNumber: '123',
        wattHours: 23
    },
        {
            serialNumber: '890',
            wattHours: 33
        }
    ],
    totalWattHours: 56
}
// var from = new Date('03/01/2018');
// var to = new Date('03/16/2018');
// var c = service.calculate(moduleWattHours, from, to)
// console.log(c);