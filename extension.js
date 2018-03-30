const { window, workspace, commands, TreeItem } = require('vscode')
const Tmi = require('tmi.js')
const TwitchStatusBar = require('./src/TwitchStatusBar')
const player = require('node-wav-player')
const { resolve } = require('path')
const ConfigStore = require('configstore')
const TwitchChatProvider = require('./src/TwitchChatProvider')

async function activate(context) {
  const twitcherConfig = workspace.getConfiguration('twitcher')

  if (!twitcherConfig.enabled) return

  const twitchChatProvider = new TwitchChatProvider()

  const config = await startupConfig()

  window.registerTreeDataProvider('twitcher/chat', twitchChatProvider)
  const tmiOptions = {
    options: {
      debug: twitcherConfig.debug
    },
    connection: {
      reconnect: true
    },
    identity: {
      username: twitcherConfig.username,
      password: config.oauth
    },
    channels: [`#${twitcherConfig.channel}`]
  }

  const bot = new Tmi.client(tmiOptions)
  const twitchStatusBar = new TwitchStatusBar(twitcherConfig)

  if (twitcherConfig.clientID) {
    commands.registerCommand('twitcher.refreshViewerCount', function() {
      bot.api(
        {
          url: `https://api.twitch.tv/kraken/streams/${twitcherConfig.channel}`,
          headers: {
            'Client-ID': config.clientID
          }
        },
        (err, res) => {
          //Todo: handle some error
          const currentViewer = res.body.stream.viewers
          window.showInformationMessage(`Twitch user online: ${currentViewer}`)
          twitchStatusBar.setNewCounter(currentViewer)
        }
      )
    })
  }

  const messageTemplate = function(data) {
    return `${data.username}: ${data.message}`
  }

  bot.connect()

  bot.on('connected', () => {
    commands.executeCommand('twitcher.refreshViewerCount')
    window.showInformationMessage(`Connected to: ${twitcherConfig.channel}`)
  })

  /**
   * Hande Join Part events to count users
   */
  bot.on('join', (channel, username, self) => {
    if (self) return
    twitchStatusBar.increaseCounter(1)
  })

  bot.on('part', (channel, username, self) => {
    if (self) return

    twitchStatusBar.decreaseCounter(1)
  })

  bot.on('message', (channel, userstate, message, self) => {
    switch (userstate['message-type']) {
      case 'chat':
        console.log(typeof twitcherConfig.notificationSound)
        player.play({
          path: resolve(__dirname, 'resources', 'audio', 'new_message.wav')
        })

        twitchChatProvider.addItem(message)
        window
          .showInformationMessage(
            messageTemplate({
              message,
              username: userstate.username
            }),
            {
              title: 'reply'
            }
          )
          .then(reply => {
            if (!reply) return
            return window.showInputBox({
              prompt: `answer -> ${userstate.username} to ${
                twitcherConfig.channel
              }`
            })
          })
          .then(answer => {
            if (!answer) return
            bot.say(twitcherConfig.channel, `@${userstate.username}: ${answer}`)
          })
        break
    }
  })
}

async function startupConfig() {
  let initalizeCommands = []
  //Todo: way to delete
  const TWITCH_CHAT_OAUTH = 'TWITCH_CHAT_OAUTH'
  const TWITCH_CLIENT_ID = 'TWITCH_CLIENT_ID'

  const localConfig = new ConfigStore('vscodetwitcher')
  let twitchChatOAuth = localConfig.get(TWITCH_CHAT_OAUTH)
  let twitchAppClientID = localConfig.get(TWITCH_CLIENT_ID)

  if (!twitchChatOAuth) {
    twitchChatOAuth = await inputCommands.twitchChatOAuth()
    if (twitchChatOAuth) {
      localConfig.set(TWITCH_CHAT_OAUTH, twitchChatOAuth)
    }
  }
  if (!twitchAppClientID || !twitchAppClientID === 'skip') {
    twitchAppClientID = await inputCommands.twitchClientID()
    if (twitchAppClientID) {
      localConfig.set(TWITCH_CLIENT_ID, twitchAppClientID)
    }
  }
  //no idea..
  if (twitchAppClientID === 'skip') {
    twitchAppClientID = undefined
  }
  return {
    oauth: twitchChatOAuth,
    clientID: twitchAppClientID
  }
}
exports.activate = activate

const inputCommands = {
  twitchChatOAuth() {
    return window.showInputBox({
      password: true,
      placeHolder: 'twitch chat oauth token',
      prompt: 'required'
    })
  },
  twitchClientID() {
    return window.showInputBox({
      password: true,
      placeHolder: 'twitch app client-id',
      prompt: 'not required enter skip to leave this field blank'
    })
  }
}
// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate
