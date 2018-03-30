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

  addItem(user, message) {
    const formatedMessage = `${user}: ${message}`
    const treeItem = new TreeItem(
      formatedMessage,
      TreeItemCollapsibleState.None
    )
    treeItem.tooltip = formatedMessage

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
