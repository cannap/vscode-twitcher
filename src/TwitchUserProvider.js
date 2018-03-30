const { EventEmitter, TreeItem, TreeItemCollapsibleState } = require('vscode')

module.exports = class TwitchChatView {
  constructor() {
    this.chatlog = []
    this._onDidChangeTreeData = new EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }

  addItem(message) {
    const treeItem = new TreeItem(message, TreeItemCollapsibleState.None)
    treeItem.tooltip = message

    this.chatlog.push(treeItem)
    this.refresh()
  }
  getTreeItem(element) {
    return element
  }
  getChildren() {
    return new Promise(resolve => {
      resolve(this.chatlog.slice().reverse())
    })
  }
}
