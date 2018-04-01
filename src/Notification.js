const { window, workspace } = require('vscode')
const player = require('node-wav-player')
module.exports = class Notification {
  constructor(soundFile) {
    this._soundFile = soundFile
    this._highLightWords = workspace.getConfiguration('twitcher').highlightWords
  }

  async showNotifcation(username, message) {
    if (this._shouldShow(message)) {
      if (this._soundFile) {
        try {
          await player.play({ path: this._soundFile })
        } catch (error) {
          window.showErrorMessage(error)
        }
      }

      const reply = await window.showInformationMessage(
        `${username}: ${message}`,
        {
          title: 'reply'
        }
      )
      if (reply) {
        const replyText = await window.showInputBox({
          prompt: `@${username}`
        })
        return replyText
      }
    }
  }

  _shouldShow(message) {
    if (this._highLightWords.length === 0) {
      return false
    }

    return this._highLightWords.some(word => message.includes(word))
  }
}
