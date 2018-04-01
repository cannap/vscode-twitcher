# Change Log

## 1.3.0

* 📦 Added new Setting for Notification `twitcher.highlightWords` which will takes an array `["@yourName", "cannap"]` you get Notifications only when the message matches any word in the list
* 👌 Added Feedback when you want to load the Userlist
* 👌 Notification Sound should now be disabled when you pass false when true it uses inbuild sound when string it tries to play when fails you will get a errorMessage wrong path
* 🐛 When Stream is offline the View counter will be 0(Offline)
* 🐛 Own Messages will now show in the Twitch chat explorer

## 1.2.0

* 📦 Viewerlist in Explorer
* 📦 Viewer counter updates every 3m
* 📦 New Command to clear the "internal" Config file which stores oauth and client-id
* 👌 Using new Twitch API
* 🐛 Fixed some bugs

### Known Issue

* When ClientID is not provided you get an error

## [1.1.0]

* 🌟 Add an Icon to send a Message to twitch chat
* 📦 Add Command to Set Oauth token (requires restart)
* 📦 Add Command to Set Client-ID (requires restart)
* 👌 Commands are now pushed to context

## [0.0.1 - 0.0.2]

* Initial release
