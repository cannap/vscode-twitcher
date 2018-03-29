// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const { window, workspace, commands, TreeItem } = require('vscode')
const Tmi = require('tmi.js')
const TwitchStatusBar = require('./src/TwitchStatusBar')
// create player instance
const TwitchChatProvider = require('./src/TwitchChatProvider')
function activate(context) {
  const twitcherConfig = workspace.getConfiguration('twitcher')
  const terminal = window.createTerminal({ name: 'twitch' })
  if (!twitcherConfig.enabled) return

  const twitchChatProvider = new TwitchChatProvider()
  window.registerTreeDataProvider('twitcher', twitchChatProvider)
  const tmiOptions = {
    options: {
      debug: twitcherConfig.debug
    },
    connection: {
      reconnect: true
    },
    identity: {
      username: twitcherConfig.username,
      password: twitcherConfig.oauth
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
            'Client-ID': twitcherConfig.clientID
          }
        },
        (err, res) => {
          //Todo: handle some error
          terminal.sendText('wtf')
          const currentViewer = res.body.stream.viewers
          window.showInformationMessage(`Twitch user online: ${currentViewer}`)
          twitchStatusBar.setNewCounter(currentViewer)
        }
      )
    })
  } else {
    window.showErrorMessage(
      'Please add a client id to the settings ("twitcher.clientID": "xxx")'
    )
  }
  const messageTemplate = function(data) {
    return `${data.username}: ${data.message}`
  }

  /**
   * Statusbar
   */

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
        twitchChatProvider.addItem(message)
        window
          .showInformationMessage(
            messageTemplate({
              message,
              username: userstate.username
            }),
            {
              title: 'Answer'
            }
          )
          .then(answer => {
            if (answer) {
              return window.showInputBox({
                prompt: `answer -> ${userstate.username} to ${
                  twitcherConfig.channel
                }`
              })
            }
          })
          .then(answer => {
            if (!answer) return
            bot.say(twitcherConfig.channel, `@${userstate.username}: ${answer}`)
          })
        break
    }
  })
}
exports.activate = activate

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate
