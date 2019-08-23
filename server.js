"use strict";
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
// Import requirements
var express = require("express");
var fs = require("fs");
var path = require("path");
var admin = require("firebase-admin");
var multer = require("multer");
var _ = require("lodash");
var upload = multer({ storage: multer.memoryStorage() });
// Import functions
var simulateRuns_1 = require("./functions/simulateRuns");
var reapOldShuttles_1 = require("./functions/reapOldShuttles");
// Import raw data
var campusRunPoints = require("./raw_data/campus_run1.gpx.json");
function start() {
    return __awaiter(this, void 0, void 0, function () {
        var db, shuttlesRef, constantsRef, loopsRef, stopsRef, app;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    admin.initializeApp({
                        credential: admin.credential.applicationDefault(),
                        databaseURL: 'https://bloombus-163620.firebaseio.com'
                    });
                    db = admin.database();
                    shuttlesRef = db.ref('shuttles');
                    constantsRef = db.ref('constants');
                    loopsRef = db.ref('loops');
                    stopsRef = db.ref('stops');
                    return [4 /*yield*/, constantsRef.once('value', function (dataSnapshot) {
                            var _a = dataSnapshot.val(), reapShuttleThresholdMilliseconds = _a.reapShuttleThresholdMilliseconds, stopProximityThresholdMeters = _a.stopProximityThresholdMeters;
                            var campusRun = {
                                name: 'Campus Loop',
                                key: 'campus',
                                points: campusRunPoints
                            };
                            var runs = [campusRun];
                            simulateRuns_1["default"](runs, shuttlesRef);
                            shuttlesRef.on('value', function () {
                                reapOldShuttles_1["default"](shuttlesRef, reapShuttleThresholdMilliseconds);
                                // DEPRECATED triggerStationProximity(shuttlesRef);
                            });
                        })];
                case 1:
                    _a.sent();
                    app = express();
                    app.use(express.static(path.join(__dirname, 'client', 'build')));
                    app.get('/', function (req, res) {
                        res.sendFile(path.join(__dirname, 'build', 'index.html'));
                    });
                    app.get('/api/download/stops/geojson', function (req, res) {
                        console.log('GET: /api/download/stops/geojson');
                        stopsRef.once('value', function (stopsSnapshot) {
                            var date = new Date();
                            var filename = "stops-" + date.toISOString().substr(0, 10) + ".geojson";
                            var downloadPath = path.join(__dirname, 'downloads', filename);
                            var stopsMutatedGeoJSON = stopsSnapshot.val();
                            var stopsProperGeoJSON = {
                                type: 'FeatureCollection',
                                features: []
                            };
                            _.forEach(stopsMutatedGeoJSON, function (value, key) {
                                value.properties.stopKey = key;
                                stopsProperGeoJSON.features.push(value);
                            });
                            console.log(stopsProperGeoJSON);
                            fs.writeFileSync(downloadPath, JSON.stringify(stopsProperGeoJSON));
                            res.status(200);
                            res.sendFile(downloadPath);
                        });
                    });
                    app.get('/api/download/loops/geojson', function (req, res) {
                        console.log('GET: /api/download/loops/geojson');
                        loopsRef.once('value', function (stopsSnapshot) {
                            var date = new Date();
                            var filename = "loops-" + date.toISOString().substr(0, 10) + ".geojson";
                            var downloadPath = path.join(__dirname, 'downloads', filename);
                            fs.writeFileSync(downloadPath, JSON.stringify(stopsSnapshot.val()));
                            res.status(200);
                            res.sendFile(downloadPath);
                        });
                    });
                    app.post('/api/upload/stops/geojson', upload.single('stops-geojson'), function (req, res, next) {
                        console.log('POST: /api/upload/stops/geojson');
                        var stopsProperGeoJSON = stripUnneccessaryGeoJSON(JSON.parse(req.file.buffer.toString()));
                        var stopsMutatedGeoJSON = {};
                        stopsProperGeoJSON.features.forEach(function (feature) {
                            stopsMutatedGeoJSON[feature.properties.stopKey] = feature;
                        });
                        stopsRef.set(stopsMutatedGeoJSON, function (error) {
                            if (error) {
                                console.log("ERROR: " + error);
                                res.sendStatus(500);
                            }
                            else {
                                console.log("Successfully updated.");
                                res.sendStatus(200);
                            }
                        });
                    });
                    app.post('/api/upload/loops/geojson', upload.single('loops-geojson'), function (req, res, next) {
                        console.log('POST: /api/upload/loops/geojson');
                        var loopsGeoJSON = stripUnneccessaryGeoJSON(JSON.parse(req.file.buffer.toString()));
                        loopsRef.set(loopsGeoJSON, function (error) {
                            if (error) {
                                console.log("ERROR: " + error);
                                res.sendStatus(500);
                            }
                            else {
                                console.log("Successfully updated.");
                                res.sendStatus(200);
                            }
                        });
                    });
                    app.listen(process.env.PORT || 8080);
                    return [2 /*return*/];
            }
        });
    });
}
var stripUnneccessaryGeoJSON = function (geoJSON) {
    if (geoJSON.name)
        delete geoJSON.name;
    if (geoJSON.crs)
        delete geoJSON.crs;
    return geoJSON;
};
start();
