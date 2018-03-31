# Twitcher (wip)

Add simple Twitch Chat to Vscode in Explorer

## Features

(insert gif here)

* Chat in Explorer
* Reply to a User
* Notification with Sound (wip)
* Viewer Count in Statusbar
* Viewerlist in Explorer
* Reply to a User
* Send a Message to a user from the Viewerlist

## ❔ Requirements

* Twitch OAuth https://twitchapps.com/tmi/
* Twitch app client id https://dev.twitch.tv/dashboard/apps/create just enter http://localhost as url

## 🌱 Setup

Open Command Palette

<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>

Search for Twitcher

Then you can Set Client-id and oauth
after settings updated you need to restart vscode

## 🔑 Settings

| Key                              | Default | Description                                                           | Required |
| -------------------------------- | ------- | --------------------------------------------------------------------- | -------- |
| `twitcher.username`              | Empty   | Username for the Chat                                                 | ✅       |
| `twitcher.channel`               | Empty   | Channel                                                               | ✅       |
| `twitcher.twitchLoginName`       | Empty   | For the Api endpoint you need to provide your Twitch login name       | ✅       |
| `twitcher.enabled`               | true    | Disable Extension                                                     |          |
| `twitcher.notificationSound`     | true    | true(plays build in sound) or string which points to a `.wav` file    |          |
| `twitcher.hideStatusBar`         | false   | hides Twitch viewer count                                             |          |
| `twitcher.counterUpdateInterval` | 3m      | Disable with false or set a other interval `10m` for every 10 minutes |          |

## ⌨️ Commands

via "Twitcher"

* `twitcher.setOAuth` sets oauth token restart required
* `twitcher.setClientID` sets client-id token restart required
* `twitcher.sendMessage` send a message to the chat
* `twitcher.refreshViewerCount` refreshes the counte requires Clientid
* `twitcher.clearConfig` remove client-id and oauth from the internal config file

## 👷 Todos

* Noticiation only when mentionen or keyword based
* Feedback when Viewers are updating because slow api
