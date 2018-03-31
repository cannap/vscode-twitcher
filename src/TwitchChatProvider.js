const { EventEmitter, TreeItem, TreeItemCollapsibleState } = require('vscode')

module.exports = class TwitchChatView {
  constructor() {
    this.chatlog = []
    this.userList = []
    this.userListEnabled = false
    this._onDidChangeTreeData = new EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }

  addChatItem(user, message) {
    const currentDate = new Date()
    const timeStamp = `${currentDate.getHours()}:${currentDate.getMinutes()}`
    //Todo: Add History Size
    const formatedMessage = `[${timeStamp}] ${user}: ${message}`
    const treeItem = new TreeItem(
      formatedMessage,
      TreeItemCollapsibleState.None
    )
    treeItem.tooltip = formatedMessage

    this.chatlog.push(treeItem)
    this.refresh()
  }

  loadUserList(userList) {
    this.userListEnabled = true

    this.userList = userList.map(user => {
      return new TreeItem(user, TreeItemCollapsibleState.None)
    })
    this.refresh()
  }
  enableChat() {
    this.userListEnabled = false
    this.refresh()
  }
  getTreeItem(element) {
    return element
  }
  getChildren() {
    if (!this.userListEnabled) {
      return new Promise(resolve => resolve(this.chatlog.slice().reverse()))
    } else {
      return new Promise(resolve => resolve(this.userList))
    }
  }
}
