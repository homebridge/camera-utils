# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.0.4](https://github.com/homebridge/camera-utils/compare/v2.0.3...v2.0.4) (2021-08-06)


### Bug Fixes

* **RtpSplitter:** do not send on closed socket ([1bcc667](https://github.com/homebridge/camera-utils/commit/1bcc66774d67f1fcd2f3c97f38e5c69bfc22a7fb))
* update dependencies ([ea54582](https://github.com/homebridge/camera-utils/commit/ea545827e08d4965290ffb18d5c245fcf041894a))

### [2.0.3](https://github.com/homebridge/camera-utils/compare/v2.0.2...v2.0.3) (2021-07-17)


### Bug Fixes

* update deps and remove homebridge dependency ([72d2dd4](https://github.com/homebridge/camera-utils/commit/72d2dd4bbe617f0fa6a5b050b9aa43d4431ac570))

### [2.0.2](https://github.com/homebridge/camera-utils/compare/v2.0.1...v2.0.2) (2021-05-17)


### Bug Fixes

* update dependencies ([7003196](https://github.com/homebridge/camera-utils/commit/7003196960294fb94370527ea11d5509d7dc1b46))

### [2.0.1](https://github.com/homebridge/camera-utils/compare/v2.0.0...v2.0.1) (2021-05-02)


### Bug Fixes

* update dependencies ([4c359a7](https://github.com/homebridge/camera-utils/commit/4c359a75d5ce4f0b9177c86e902610d6b8de4517))

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
