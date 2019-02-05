React Practice
==============

Practice app to use maps with react native in android.

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

ToDo for IOS
------------

* [ ] Follow "Building Projects with Native Code" from https://facebook.github.io/react-native/docs/getting-started.html for the IOS bits.
* [ ] Setup `react-native-maps` for ios, follow: https://github.com/react-community/react-native-maps/blob/master/docs/installation.md
* [ ] Setup `react-native-image-picker` for ios, follow: https://github.com/react-community/react-native-image-picker/blob/master/docs/Install.md
* [ ] Anything else?

Notes
-----

* [ ] Need to secure the Google Maps API key by restricting use to signed apps from https://developers.google.com.

* There's a `react-native` bug in version 0.57.3, using 0.57.2 until it gets fixed: https://github.com/facebook/react-native/issues/21236#issuecomment-429547611
* Follow the installation for react-native-maps, but also this guy's comment https://github.com/react-community/react-native-maps/issues/2327#issuecomment-412530504.
