const { window, StatusBarAlignment, commands, workspace } = require('vscode')
module.exports = class TwitchStatusBar {
  constructor(options) {
    this.counter = 0

    this.statucBarIcon = '$(broadcast)'
    this._statusBar = window.createStatusBarItem(StatusBarAlignment.Left)

    let tooltip = 'Click to update Viewer count'

    if (!options.clientID) {
      tooltip = 'Twitcher Clientid is missing'
    }

    this._statusBar.tooltip = tooltip
    this._statusBar.command = 'twitcher.refreshViewerCount'

    if (options.hideStatusBar) {
      this._statusBar.dispose()
    } else {
      this._statusBar.show()
      this.setNewCounter()
    }
  }
  get getCounter() {
    return this.counter
  }
  increaseCounter(count) {
    this.counter += count
    this.setNewCounter()
  }
  decreaseCounter(count) {
    this.counter -= count

    if (this.counter < 0) {
      this.setNewCounter(0)
    } else {
      this.setNewCounter()
    }
  }

  setNewCounter(counter = false) {
    this._statusBar.text = `${this.statucBarIcon} ${counter || this.counter}`
  }
}
