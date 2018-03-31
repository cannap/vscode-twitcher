const { window, workspace, commands } = require('vscode')
const Tmi = require('tmi.js')
const player = require('node-wav-player')
const { resolve } = require('path')
const ConfigStore = require('configstore')
const localConfig = new ConfigStore('vscodetwitcher')
const TwitchChatProvider = require('./TwitchChatProvider')
const TwitchStatusBar = require('./TwitchStatusBar')
const TwitchApi = require('./TwitchApi')
const TWITCH_CHAT_OAUTH = 'TWITCH_CHAT_OAUTH'
const TWITCH_CLIENT_ID = 'TWITCH_CLIENT_ID'
let viewerCountUpdater = false
const ms = require('ms')

//Todo: Clean the whole mess xD
async function activate(context) {
  const twitcherConfig = workspace.getConfiguration('twitcher')

  if (!twitcherConfig.enabled) return
  //#region config
  const config = await startupConfig()

  if (!config.oauth) {
    const message = await window.showErrorMessage(
      'Please Enter a Oauth token for twitch',
      { title: 'Enter Oauth' }
    )

    if (message) {
      const oAuthToken = await inputCommands.twitchChatOAuth()
      if (oAuthToken) {
        localConfig.set(TWITCH_CHAT_OAUTH, oAuthToken)
        config.oauth = oAuthToken
      }
    }
  }

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
  //#endregion

  /**
   * Initalize
   */
  const bot = new Tmi.client(tmiOptions)
  const twitchStatusBar = new TwitchStatusBar(twitcherConfig)
  const twitchApi = new TwitchApi(config.clientID)
  bot.connect()

  /**
   * Register Data provider
   */
  const twitchChatProvider = new TwitchChatProvider()
  window.registerTreeDataProvider('twitcher', twitchChatProvider)
  if (twitcherConfig.counterUpdateInterval) {
    viewerCountUpdater = setInterval(() => {},
    ms(twitcherConfig.counterUpdateInterval))
  }

  //#region Register Commands
  const clearConfig = commands.registerCommand('twitcher.clearConfig', () => {
    localConfig.clear()
  })
  context.subscriptions.push(clearConfig)

  const switchToChatCommand = commands.registerCommand(
    'twitcher.switchToChat',
    () => {
      twitchChatProvider.enableChat()
    }
  )
  context.subscriptions.push(switchToChatCommand)
  const oAuthCommand = commands.registerCommand(
    'twitcher.setOAuth',
    async () => {
      const oAuth = await inputCommands.twitchChatOAuth()
      if (oAuth) {
        localConfig.set(TWITCH_CHAT_OAUTH, oAuth)
        window.showInformationMessage('Twitch OAuth updated')
      }
    }
  )
  context.subscriptions.push(oAuthCommand)
  const clientIDCommand = commands.registerCommand(
    'twitcher.setClientID',
    async () => {
      const clientId = await inputCommands.twitchClientID()
      if (clientId) {
        localConfig.set(TWITCH_CLIENT_ID, clientId)
        window.showInformationMessage('Twitch Client-ID updated')
      }
    }
  )
  context.subscriptions.push(clientIDCommand)

  const explorerReplyCommand = commands.registerCommand(
    'twitcher.explorerReply',
    async context => {
      const userName = `@${context.label.split(':')[0]}`
      const reply = await window.showInputBox({
        prompt: userName
      })

      if (!reply) return
      bot.say(twitcherConfig.channel, `${userName} ${reply}`)
    }
  )
  context.subscriptions.push(explorerReplyCommand)

  if (config.clientID) {
    const refreshCommand = commands.registerCommand(
      'twitcher.refreshViewerCount',
      async () => {
        const viewerCount = await twitchApi.getViewerCount()
        twitchStatusBar.setNewCounter(viewerCount)
      }
    )
    context.subscriptions.push(refreshCommand)
  }

  const switchToUserListCommand = commands.registerCommand(
    'twitcher.switchToUserList',
    async () => {
      const userlist = await twitchApi.getViewerList()
      twitchChatProvider.loadUserList(userlist)
      twitchStatusBar.setNewCounter(userlist.length)
    }
  )
  context.subscriptions.push(switchToUserListCommand)
  const sendCommand = commands.registerCommand(
    'twitcher.sendMessage',
    async () => {
      try {
        const message = await window.showInputBox({
          placeHolder: 'Message to send'
        })

        if (message) {
          bot.say(twitcherConfig.channel, message)
        }
      } catch (error) {
        console.error('Failed to send Message', error)
        window.showErrorMessage('Failed to Send Message')
      }
    }
  )

  context.subscriptions.push(sendCommand)
  //#endregion
  bot.on('connected', () => {
    commands.executeCommand('twitcher.refreshViewerCount')
    window.showInformationMessage(`Connected to: ${twitcherConfig.channel}`)
  })

  let soundFile = resolve(
    __dirname,
    '..',
    'resources',
    'audio',
    'new_message.wav'
  )
  if (typeof twitcherConfig.notificationSound !== 'boolean') {
    soundFile = resolve(twitcherConfig.notificationSound)
  }

  bot.on('message', async (channel, userstate, message, self) => {
    if (self && !twitcherConfig.debug) return
    //Todo: Add Filter
    switch (userstate['message-type']) {
      case 'chat':
        if (twitcherConfig.notificationSound) {
          twitchChatProvider.addChatItem(userstate.username, message)

          await player.play({
            path: soundFile
          })
        }

        const reply = await window.showInformationMessage(
          `${userstate.username}: ${message}`,
          {
            title: 'reply'
          }
        )

        if (reply) {
          const replyText = await window.showInputBox({
            prompt: `@${userstate.username}`
          })
          if (!replyText) return
          bot.say(
            twitcherConfig.channel,
            `@${userstate.username}: ${replyText}`
          )
        }

        break
    }
  })
}

function startupConfig() {
  let twitchChatOAuth = localConfig.get(TWITCH_CHAT_OAUTH)
  let twitchAppClientID = localConfig.get(TWITCH_CLIENT_ID)

  //no idea..
  if (twitchAppClientID === 'skip') {
    twitchAppClientID = undefined
  }
  return {
    oauth: twitchChatOAuth,
    clientID: twitchAppClientID
  }
}

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
function deactivate() {
  if (viewerCountUpdater) {
    clearInterval(viewerCountUpdater)
  }
}
exports.activate = activate
exports.deactivate = deactivate
