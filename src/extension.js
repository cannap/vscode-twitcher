const { window, workspace, commands } = require('vscode')
const Tmi = require('tmi.js')

const { resolve } = require('path')
const ConfigStore = require('configstore')
const ms = require('ms')
const Notification = require('./Notification')
const localConfig = new ConfigStore('vscodetwitcher')
const TwticherExplorerProvider = require('./TwitchExplorerProvider')
const TwitchStatusBar = require('./TwitchStatusBar')
const TwitchApi = require('./TwitchApi')
const TWITCH_CHAT_OAUTH = 'TWITCH_CHAT_OAUTH'
const TWITCH_CLIENT_ID = 'TWITCH_CLIENT_ID'

let viewerCountUpdater = false

//Todo: Clean the whole mess xD
async function activate(context) {
  const twitcherConfig = workspace.getConfiguration('twitcher')

  if (!twitcherConfig.enabled) return
  //#region config
  const twitchConfig = await startupConfig()

  if (!twitchConfig.oauth) {
    const askForOAuth = await window.showErrorMessage(
      'Please Enter a Oauth token for twitch',
      { title: 'Enter Oauth' }
    )

    if (askForOAuth) {
      const twitchOAuth = await inputCommands.twitchChatOAuth()
      if (twitchOAuth) {
        localConfig.set(TWITCH_CHAT_OAUTH, twitchOAuth)
        twitchConfig.oauth = twitchOAuth
      }
    }
  }

  const twitchChatConfig = {
    options: {
      debug: twitcherConfig.debug
    },
    connection: {
      reconnect: true
    },
    identity: {
      username: twitcherConfig.username,
      password: twitchConfig.oauth
    },
    channels: [`#${twitcherConfig.channel}`]
  }
  //#endregion

  /**
   * Initalize
   */
  const bot = new Tmi.client(twitchChatConfig)
  const twitchStatusBar = new TwitchStatusBar(twitcherConfig)
  const twitchApi = new TwitchApi(twitchConfig.clientID)

  let soundFile = false
  if (typeof twitcherConfig.notificationSound !== 'boolean') {
    soundFile = resolve(twitcherConfig.notificationSound)
  } else if (twitcherConfig.notificationSound) {
    soundFile = resolve(
      __dirname,
      '..',
      'resources',
      'audio',
      'new_message.wav'
    )
  }
  const notification = new Notification(soundFile)
  bot.connect()

  /**
   * Register Data provider
   */
  const twitcherExplorerProvider = new TwticherExplorerProvider()
  window.registerTreeDataProvider('twitcher', twitcherExplorerProvider)
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
      twitcherExplorerProvider.enableChat()
    }
  )
  context.subscriptions.push(switchToChatCommand)
  const oAuthCommand = commands.registerCommand(
    'twitcher.setOAuth',
    async () => {
      const oAuthToken = await inputCommands.twitchChatOAuth()
      if (oAuthToken) {
        localConfig.set(TWITCH_CHAT_OAUTH, oAuthToken)
        window.showInformationMessage('Twitch OAuth updated')
      }
    }
  )
  context.subscriptions.push(oAuthCommand)
  const clientIDCommand = commands.registerCommand(
    'twitcher.setClientID',
    async () => {
      const twitchClientID = await inputCommands.twitchClientID()
      if (twitchClientID) {
        localConfig.set(TWITCH_CLIENT_ID, twitchClientID)
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

  if (twitchConfig.clientID) {
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
      twitcherExplorerProvider.showLoading('Loading User list')
      const userlist = await twitchApi.getViewerList()
      twitcherExplorerProvider.hideLoading()
      twitcherExplorerProvider.loadUserList(userlist)
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

  bot.on('message', async (channel, userstate, message, self) => {
    //Todo: Add Filter
    switch (userstate['message-type']) {
      case 'chat':
        twitcherExplorerProvider.addChatItem(userstate.username, message)

        if (!self) {
          const replyText = await notification.showNotifcation(
            userstate.username,
            message
          )
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

function deactivate() {
  if (viewerCountUpdater) {
    clearInterval(viewerCountUpdater)
  }
}
exports.activate = activate
exports.deactivate = deactivate
