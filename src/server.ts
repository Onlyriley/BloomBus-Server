// Import requirements
import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as admin from 'firebase-admin';
import * as _ from 'lodash';
import dotenv from 'dotenv';

const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Initialize .env vars
dotenv.config();

// Import types
import { ShuttleRun } from './interfaces/ShuttleRun';
import IConstants from './interfaces/IConstants';

// Import functions
import simulateRuns from './functions/simulateRuns';
import reapOldShuttles from './functions/reapOldShuttles';
// import triggerStationProximity from './functions/triggerStationProximity';

// Import raw data
import campusRunPoints from './raw_data/campusRun1';

async function start() {
  console.log('Started');

  // Requires one-time manual setup, see https://firebase.google.com/docs/admin/setup#initialize-sdk
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: 'https://bloombus-163620.firebaseio.com',
  });

  const db = admin.database();
  const shuttlesRef = db.ref('shuttles');
  const constantsRef = db.ref('constants');
  const loopsRef = db.ref('loops');
  const stopsRef = db.ref('stops');

  await constantsRef.once('value', (dataSnapshot: admin.database.DataSnapshot) => {
    const { reapShuttleThresholdMilliseconds, stopProximityThresholdMeters } = dataSnapshot.val() as IConstants;
    const campusRun = {
      name: 'Campus Loop',
      key: 'campus',
      points: campusRunPoints,
    };
    const runs: ShuttleRun[] = [campusRun];
    simulateRuns(runs, shuttlesRef);

    shuttlesRef.on('value', () => {
      reapOldShuttles(shuttlesRef, reapShuttleThresholdMilliseconds);
      // DEPRECATED triggerStationProximity(shuttlesRef);
    });
  });

  const app: Express = express();

  // Paths
  const webappRoot = path.join(__dirname, '..', 'webapp', 'build');
  const downloadsDir = path.join(__dirname, '..', 'downloads');

  app.use(express.static(webappRoot));

  app.get('/', (req, res) => {
    res.sendFile(path.join(webappRoot, 'index.html'));
  });

  app.get('/api/download/stops/geojson', (req, res) => {
    console.log('GET: /api/download/stops/geojson');
    stopsRef.once('value', (stopsSnapshot) => {
      const date = new Date();
      const filename = `stops-${date.toISOString().substr(0, 10)}.geojson`;
      const downloadPath = path.join(downloadsDir, filename);
      const stopsMutatedGeoJSON = stopsSnapshot.val();
      const stopsProperGeoJSON = {
        type: 'FeatureCollection',
        features: [],
      };
      _.forEach(stopsMutatedGeoJSON, (value: any, key) => {
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
    loopsRef.once('value', (stopsSnapshot) => {
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
    stopsProperGeoJSON.features.forEach((feature) => {
      stopsMutatedGeoJSON[feature.properties.stopKey] = feature;
    });
    stopsRef.set(stopsMutatedGeoJSON, (error) => {
      if (error) {
        console.log(`ERROR: ${error}`);
        res.sendStatus(500);
      } else {
        console.log(`Successfully updated.`);
        res.sendStatus(200);
      }
    });
  });

  app.post('/api/upload/loops/geojson', upload.single('loops-geojson'), (req, res, next) => {
    console.log('POST: /api/upload/loops/geojson');
    const loopsGeoJSON = stripUnneccessaryGeoJSON(JSON.parse(req.file.buffer.toString()));
    loopsRef.set(loopsGeoJSON, (error) => {
      if (error) {
        console.log(`ERROR: ${error}`);
        res.sendStatus(500);
      } else {
        console.log(`Successfully updated.`);
        res.sendStatus(200);
      }
    });
  });

  const port = process.env.PORT || 8080;
  app.listen(port);
  console.log(`Listening on port ${port}`);
}

const stripUnneccessaryGeoJSON = (geoJSON) => {
  if (geoJSON.name) delete geoJSON.name;
  if (geoJSON.crs) delete geoJSON.crs;
  return geoJSON;
};

start();
