"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const v4_1 = __importDefault(require("uuid/v4"));
const turf = __importStar(require("@turf/turf"));
function simulateRuns(runs, dbRef) {
    const uuid = v4_1.default();
    const shuttleRef = dbRef.child(uuid); // Create a new child node with this uuid
    shuttleRef.onDisconnect().remove(err => {
        if (err)
            console.error(err);
    }); // Set reference to self-destruct on disconnect
    runs.forEach((shuttleRun) => {
        let i = 0;
        setInterval(() => {
            const shuttlePoint = shuttleRun.points[i];
            const prevPoint = i === 0 ? shuttleRun.points[shuttleRun.points.length - 1] : shuttleRun.points[i - 1];
            const shuttlePointCoords = [shuttlePoint['Longitude(WGS84)'], shuttlePoint['Latitude(WGS84)']];
            const prevPointCoords = [prevPoint['Longitude(WGS84)'], prevPoint['Latitude(WGS84)']];
            console.log(`${i} - ${shuttlePoint.Duration}, ${shuttlePoint['Latitude(WGS84)']} ${shuttlePoint['Longitude(WGS84)']}`);
            const geoJSON = {
                type: 'Feature',
                geometry: {
                    coordinates: shuttlePointCoords
                },
                properties: {
                    appVersion: 'bloombus-server',
                    bearing: turf.bearing(turf.point(prevPointCoords), turf.point(shuttlePointCoords)),
                    altitude: shuttlePoint['Altitude(feet)'],
                    speed: shuttlePoint['Speed(mph)'],
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
exports.default = simulateRuns;
//# sourceMappingURL=simulateRuns.js.map