PotholeCoin
===========

PotholeCoin is an app for crowdfunding pothole repairs.

Setup
-----

Needs the following prerequisites:

* https://node.js
* Android SDK (follow "Building Projects with Native Code" from https://facebook.github.io/react-native/docs/getting-started.html)
* react-native via `npm install -g react-native-cli`
* https://genymotion.com virtual machine or connected Android phone; note that for now we also need to disable app verification by unticking "Settings -> Developer Options -> Verify apps over USB".


Run
---

    npm install
    react-native run-android



Notes
-----

* There's a `react-native` bug in version 0.57.3, using 0.57.2 until it gets fixed: https://github.com/facebook/react-native/issues/21236#issuecomment-429547611
* Follow the installation for react-native-maps, but also this guy's comment https://github.com/react-community/react-native-maps/issues/2327#issuecomment-412530504.