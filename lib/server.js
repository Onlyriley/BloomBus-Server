"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
// Import requirements
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const admin = __importStar(require("firebase-admin"));
const multer_1 = __importDefault(require("multer"));
const _ = __importStar(require("lodash"));
const upload = multer_1.default({ storage: multer_1.default.memoryStorage() });
// Import functions
// import simulateRuns from './functions/simulateRuns';
const reapOldShuttles_1 = __importDefault(require("./functions/reapOldShuttles"));
// import triggerStationProximity from './functions/triggerStationProximity';
// Import raw data
// import * as campusRunPoints from './raw_data/campus_run1.gpx.json';
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            databaseURL: 'https://bloombus-163620.firebaseio.com'
        });
        const db = admin.database();
        const shuttlesRef = db.ref('shuttles');
        const constantsRef = db.ref('constants');
        const loopsRef = db.ref('loops');
        const stopsRef = db.ref('stops');
        yield constantsRef.once('value', (dataSnapshot) => {
            const { reapShuttleThresholdMilliseconds, stopProximityThresholdMeters } = dataSnapshot.val();
            // const campusRun = {
            //   name: 'Campus Loop',
            //   key: 'campus',
            //   points: campusRunPoints
            // };
            // const runs: Array<ShuttleRun> = [campusRun];
            // simulateRuns(runs, shuttlesRef);
            shuttlesRef.on('value', () => {
                reapOldShuttles_1.default(shuttlesRef, reapShuttleThresholdMilliseconds);
                // DEPRECATED triggerStationProximity(shuttlesRef);
            });
        });
        const app = express_1.default();
        // Paths
        const webappRoot = path.join(__dirname, '..', 'webapp', 'build');
        const downloadsDir = path.join(__dirname, '..', 'downloads');
        app.use(express_1.default.static(webappRoot));
        app.get('/', (req, res) => {
            res.sendFile(path.join(webappRoot, 'index.html'));
        });
        app.get('/api/download/stops/geojson', (req, res) => {
            console.log('GET: /api/download/stops/geojson');
            stopsRef.once('value', stopsSnapshot => {
                const date = new Date();
                const filename = `stops-${date.toISOString().substr(0, 10)}.geojson`;
                const downloadPath = path.join(downloadsDir, filename);
                const stopsMutatedGeoJSON = stopsSnapshot.val();
                const stopsProperGeoJSON = {
                    type: 'FeatureCollection',
                    features: []
                };
                _.forEach(stopsMutatedGeoJSON, (value, key) => {
                    value.properties.stopKey = key;
                    stopsProperGeoJSON.features.push(value);
                });
                console.log(stopsProperGeoJSON);
                fs.writeFileSync(downloadPath, JSON.stringify(stopsProperGeoJSON));
                res.status(200);
                res.sendFile(downloadPath);
            });
        });
        app.get('/api/download/loops/geojson', (req, res) => {
            console.log('GET: /api/download/loops/geojson');
            loopsRef.once('value', stopsSnapshot => {
                const date = new Date();
                const filename = `loops-${date.toISOString().substr(0, 10)}.geojson`;
                const downloadPath = path.join(downloadsDir, filename);
                fs.writeFileSync(downloadPath, JSON.stringify(stopsSnapshot.val()));
                res.status(200);
                res.sendFile(downloadPath);
            });
        });
        app.post('/api/upload/stops/geojson', upload.single('stops-geojson'), (req, res, next) => {
            console.log('POST: /api/upload/stops/geojson');
            const stopsProperGeoJSON = stripUnneccessaryGeoJSON(JSON.parse(req.file.buffer.toString()));
            let stopsMutatedGeoJSON = {};
            stopsProperGeoJSON.features.forEach(feature => {
                stopsMutatedGeoJSON[feature.properties.stopKey] = feature;
            });
            stopsRef.set(stopsMutatedGeoJSON, error => {
                if (error) {
                    console.log(`ERROR: ${error}`);
                    res.sendStatus(500);
                }
                else {
                    console.log(`Successfully updated.`);
                    res.sendStatus(200);
                }
            });
        });
        app.post('/api/upload/loops/geojson', upload.single('loops-geojson'), (req, res, next) => {
            console.log('POST: /api/upload/loops/geojson');
            const loopsGeoJSON = stripUnneccessaryGeoJSON(JSON.parse(req.file.buffer.toString()));
            loopsRef.set(loopsGeoJSON, error => {
                if (error) {
                    console.log(`ERROR: ${error}`);
                    res.sendStatus(500);
                }
                else {
                    console.log(`Successfully updated.`);
                    res.sendStatus(200);
                }
            });
        });
        app.listen(process.env.PORT || 8080);
    });
}
const stripUnneccessaryGeoJSON = geoJSON => {
    if (geoJSON.name)
        delete geoJSON.name;
    if (geoJSON.crs)
        delete geoJSON.crs;
    return geoJSON;
};
start();
//# sourceMappingURL=server.js.map