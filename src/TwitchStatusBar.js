const { window, StatusBarAlignment } = require('vscode')
module.exports = class TwitchStatusBar {
  constructor(options) {
    this.counter = 0

    this.statucBarIcon = '$(broadcast)'
    this._statusBar = window.createStatusBarItem(StatusBarAlignment.Left)

    let tooltip = 'Click to update Viewer count'

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

  text(text, tooltip = false) {
    this._statusBar.text = '$(broadcast)' + ' ' + text

    if (tooltip) {
      this._statusBar.tooltip = tooltip
    }
  }

  setNewCounter(counter = false) {
    this._statusBar.text = `${this.statucBarIcon} ${counter || this.counter}`
  }

  get statusBarItem() {
    return this._statusBar
  }
}
