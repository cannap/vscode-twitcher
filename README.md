# Twitcher

Add simple Twitch Chat to Vscode in Explorer

## Features

* Read Chat in Explorer
* Reply to a User
* Notification with Sound
* Viewer Count in Statusbar

## Requirements

* Twitch OAuth https://twitchapps.com/tmi/
* Twitch app client id https://dev.twitch.tv/dashboard/apps/create just enter http://localhost as url

## Setup

When the Extensions starts the first time you get asked for OAuth and Client-id(optional).
You can Skip the Client id by writting "skip"

## Settings

| Key                          | Default | Description               | Required |
| ---------------------------- | ------- | ------------------------- | -------- |
| `twitcher.enabled`           | true    | Disable Extension         | ✅       |
| `twitcher.username`          | Empty   | Username for the Chat     | ✅       |
| `twitcher.channel`           | Empty   | Channel                   | ✅       |
| `twitcher.notificationSound` | true    | Path to a `.wav` file     |          |
| `twitcher.hideStatusBar`     | false   | hides Twitch viewer count |          |

## Commands

via "Twitcher"

* `twitcher.setOAuth` sets oauth token restart required
* `twitcher.setClientID` sets client-id token restart required
* `twitcher.sendMessage` send a message to the chat
* `twitcher.refreshViewerCount` refreshes the counter

## Todos

* Commands for Adding oauth and Client-ID
* Noticiation only when mentionen or keyword based
