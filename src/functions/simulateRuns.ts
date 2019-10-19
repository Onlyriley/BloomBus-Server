import * as admin from 'firebase-admin';
import uuidv4 from 'uuid/v4';
import ShuttleRun from '../interfaces/ShuttleRun';
import * as turf from '@turf/turf';

export default function simulateRuns(runs: Array<ShuttleRun>, dbRef: admin.database.Reference) {
  const uuid = uuidv4();
  const shuttleRef = dbRef.child(uuid); // Create a new child node with this uuid
  shuttleRef.onDisconnect().remove(err => {
    if (err) console.error(err);
  }); // Set reference to self-destruct on disconnect

  runs.forEach((shuttleRun: ShuttleRun) => {
    let i = 0;
    setInterval(() => {
      const shuttlePoint = shuttleRun.points[i];
      const prevPoint = i === 0 ? shuttleRun.points[shuttleRun.points.length - 1] : shuttleRun.points[i - 1];
      const shuttlePointCoords = [shuttlePoint['Longitude(WGS84)'], shuttlePoint['Latitude(WGS84)']];
      const prevPointCoords = [prevPoint['Longitude(WGS84)'], prevPoint['Latitude(WGS84)']];
      console.log(
        `${i} - ${shuttlePoint.Duration}, ${shuttlePoint['Latitude(WGS84)']} ${shuttlePoint['Longitude(WGS84)']}`
      );
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
