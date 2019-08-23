"use strict";
exports.__esModule = true;
var uuidv4 = require("uuid/v4");
var turf = require("@turf/turf");
function simulateRuns(runs, dbRef) {
    var uuid = uuidv4();
    var shuttleRef = dbRef.child(uuid); // Create a new child node with this uuid
    shuttleRef.onDisconnect().remove(function (err) {
        if (err)
            console.error(err);
    }); // Set reference to self-destruct on disconnect
    runs.forEach(function (shuttleRun) {
        var i = 0;
        setInterval(function () {
            var shuttlePoint = shuttleRun.points[i];
            var prevPoint = i === 0
                ? shuttleRun.points[shuttleRun.points.length - 1]
                : shuttleRun.points[i - 1];
            var shuttlePointCoords = [
                shuttlePoint["Longitude(WGS84)"],
                shuttlePoint["Latitude(WGS84)"]
            ];
            var prevPointCoords = [
                prevPoint["Longitude(WGS84)"],
                prevPoint["Latitude(WGS84)"]
            ];
            console.log(i + " - " + shuttlePoint.Duration + ", " + shuttlePoint["Latitude(WGS84)"] + " " + shuttlePoint["Longitude(WGS84)"]);
            var geoJSON = {
                type: "Feature",
                geometry: {
                    coordinates: shuttlePointCoords
                },
                properties: {
                    appVersion: "bloombus-server",
                    bearing: turf.bearing(turf.point(prevPointCoords), turf.point(shuttlePointCoords)),
                    altitude: shuttlePoint["Altitude(feet)"],
                    speed: shuttlePoint["Speed(mph)"],
                    loopDisplayName: shuttleRun.name,
                    loopKey: shuttleRun.key,
                    timestamp: Date.now()
                }
            };
            shuttleRef.set(geoJSON);
            ++i;
            i = i % shuttleRun.points.length;
        }, 1000);
    });
}
exports["default"] = simulateRuns;
