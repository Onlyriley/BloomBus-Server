"use strict";
/*
 * triggerStationProximity.ts
 *
 * DEPRECATED, this logic has been incorporated into BloomBus-Tracker
 *
 * Function executed on every update on 'shuttles' ref. Checks each to see if it is within a certain
 * distance of a stop on its loop, and if so stores that stop's key in the properties of the shuttle.
 *
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const turf = __importStar(require("@turf/turf"));
function triggerStationProximity(shuttlesRef) {
    return __awaiter(this, void 0, void 0, function* () {
        const snapshot = yield shuttlesRef.once('value');
        // create a map with all children that need to be removed
        const updates = {};
        const loops = (yield admin.database().ref('/loops').once('value')).toJSON();
        const stops = (yield admin.database().ref('/stops').once('value')).toJSON();
        snapshot.forEach(shuttleSnap => {
            const shuttle = shuttleSnap.val();
            const shuttlePoint = turf.point(shuttle.geometry.coordinates);
            const shuttleLoop = loops.features.find(loop => loop.properties.key === shuttle.properties.loopKey);
            if (shuttleLoop) {
                // Have to do some weird tactics for navigating through the JSON, since Firebase Cloud Functions
                // uses Node 6 and doesn't have methods like Object.values or Object.entries
                // Search through all of the stops for this loop to see if the shuttle is less than 15 meters away
                Object.keys(shuttleLoop.properties.stops).forEach((stopKey, stopIndex) => {
                    const stop = stops[stopKey];
                    const stationPoint = turf.point([stop.geometry.coordinates[0], stop.geometry.coordinates[1]]);
                    if (turf.distance(shuttlePoint, stationPoint, { units: 'kilometers' }) <= 0.015) {
                        // shuttleSnap.key: the UUID
                        // Setting the object entry to null will delete it in Firebase
                        shuttle.properties.prevStation = stop;
                        shuttle.properties.nextStation = shuttleLoop.properties.stops[stopIndex + 1];
                        updates[shuttleSnap.key] = shuttle;
                    }
                });
            }
            return true;
        });
        // execute all updates in one go and return the result to end the function
        return shuttlesRef.update(updates);
    });
}
exports.default = triggerStationProximity;
;
//# sourceMappingURL=triggerStationProximity.js.map