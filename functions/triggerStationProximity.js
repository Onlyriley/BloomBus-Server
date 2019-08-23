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
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var admin = require("firebase-admin");
var turf = require("@turf/turf");
function triggerStationProximity(shuttlesRef) {
    return __awaiter(this, void 0, void 0, function () {
        var snapshot, updates, loops, stops;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, shuttlesRef.once('value')];
                case 1:
                    snapshot = _a.sent();
                    updates = {};
                    return [4 /*yield*/, admin.database().ref('/loops').once('value')];
                case 2:
                    loops = (_a.sent()).toJSON();
                    return [4 /*yield*/, admin.database().ref('/stops').once('value')];
                case 3:
                    stops = (_a.sent()).toJSON();
                    snapshot.forEach(function (shuttleSnap) {
                        var shuttle = shuttleSnap.val();
                        var shuttlePoint = turf.point(shuttle.geometry.coordinates);
                        var shuttleLoop = loops.features.find(function (loop) { return loop.properties.key === shuttle.properties.loopKey; });
                        if (shuttleLoop) {
                            // Have to do some weird tactics for navigating through the JSON, since Firebase Cloud Functions
                            // uses Node 6 and doesn't have methods like Object.values or Object.entries
                            // Search through all of the stops for this loop to see if the shuttle is less than 15 meters away
                            Object.keys(shuttleLoop.properties.stops).forEach(function (stopKey, stopIndex) {
                                var stop = stops[stopKey];
                                var stationPoint = turf.point([stop.geometry.coordinates[0], stop.geometry.coordinates[1]]);
                                if (turf.distance(shuttlePoint, stationPoint, 'kilometers') <= 0.015) {
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
                    return [2 /*return*/, shuttlesRef.update(updates)];
            }
        });
    });
}
exports["default"] = triggerStationProximity;
;
