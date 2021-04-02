# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0](https://github.com/homebridge/camera-utils/compare/v1.4.0...v2.0.0) (2021-04-02)


### ⚠ BREAKING CHANGES

* `reservePorts` previously only reserved ports using tcp.  This was not a correct approach because ffmpeg uses udp to bind to the ports and tcp may be available on ports that are already bound for udp.  `reservePorts` will now use udp by default, but supports tcp if you pass `type: 'tcp'` in the options object.

### Bug Fixes

* reserve udp ports using pick-port ([3e6e1f4](https://github.com/homebridge/camera-utils/commit/3e6e1f4d1ca5238acb419a3bb268e381f6c640e1))
* update dependencies ([3a99b37](https://github.com/homebridge/camera-utils/commit/3a99b37f70c4c8e0ec0022e25e0a1ec25c4276ac))

## [1.4.0](https://github.com/homebridge/camera-utils/compare/v1.2.0...v1.4.0) (2021-02-20)


### Features

* public `onMessage` on `RtpSplitter` ([75c869c](https://github.com/homebridge/camera-utils/commit/75c869cec7cc84221d7c6395348a2a827e6dcc3f))


### Bug Fixes

* remove SIGINT listener ([1cd4e1f](https://github.com/homebridge/camera-utils/commit/1cd4e1f063642b71d7a34523c1c3b94c99a953c4))
* update dependencies ([780b8da](https://github.com/homebridge/camera-utils/commit/780b8da4b4dfbebf786cbdba95c19587062623f0))

## [1.3.0](https://github.com/homebridge/camera-utils/compare/v1.2.0...v1.3.0) (2020-09-19)


### Features

* public `onMessage` on `RtpSplitter` ([e1dc603](https://github.com/homebridge/camera-utils/commit/e1dc6032253202987fcb619de40da6926ef2eb38))

## 1.2.0 (2020-09-07)


### Features

* ports, rtp, srtp, ffmpeg and return audio utils ([018e772](https://github.com/homebridge/camera-utils/commit/018e772448d7a1b5fd6358da2d24a89f780c3d36))
