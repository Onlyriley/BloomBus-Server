# BloomBus-Server

[![Build Status](https://drone.conchita.xyz/api/badges/BloomBus/BloomBus-Server/status.svg)](https://drone.conchita.xyz/BloomBus/BloomBus-Server)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FBloomBus%2FBloomBus-Server.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FBloomBus%2FBloomBus-Server?ref=badge_shield)

Server-side processing and simulation of real-time data &amp; admin dashboard for the Bloomsburg University shuttle bus tracking system.
Find more information at https://bloombus.gitbook.io/bloombus.

## Building Docker images

GOOGLE_APPLICATION_CREDENTIALS env var must be defined by going through the setup process here:
https://firebase.google.com/docs/admin/setup#initialize-sdk
The JSON file should be placed inside this directory as `serviceAccountKey.json`.
Then, images can be built with the command: `sudo docker build . -t jgibson02/bloombus-server --build-arg app_creds=./serviceAccountKey.json`

## License

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FBloomBus%2FBloomBus-Server.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FBloomBus%2FBloomBus-Server?ref=badge_large)
