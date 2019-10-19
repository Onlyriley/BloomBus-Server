const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://bloombus-163620.firebaseio.com'
});

const db = admin.database();
const logsRef = db.ref('logs');

logsRef.once('value')
  .then(async snapshot => {
    if (snapshot.empty) {
      console.log('No matching documents.');
      return;
    }  

    let numRemoved = 0;
    snapshot.forEach(logSnapshot => {
      const logData = logSnapshot.val();
      if (!logData.hasOwnProperty('sessionID')) {
        logSnapshot.ref.remove();
        numRemoved++;
      }
    });
    console.log(`Removed ${numRemoved} documents.`);
  })
  .catch(err => {
    console.log('Error getting documents', err);
  });