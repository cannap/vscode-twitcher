const { EventEmitter, TreeItem, TreeItemCollapsibleState } = require('vscode')

module.exports = class TwitchChatView {
  constructor() {
    this.chatlog = []
    this.userList = []
    this.userListEnabled = false
    this.isLoading = false
    this._onDidChangeTreeData = new EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }

  showLoading(message = 'Loading') {
    this.isLoading = message
    this.refresh()
  }
  hideLoading() {
    this.isLoading = false
    this.refresh()
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
    //We dont need to Refresh when userlist is active
    if (!this.userListEnabled) {
      this.refresh()
    }
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
    if (this.isLoading) {
      return new Promise(resolve => {
        resolve([new TreeItem(this.isLoading, TreeItemCollapsibleState.None)])
      })
    }

    if (!this.userListEnabled) {
      return new Promise(resolve => resolve(this.chatlog.slice().reverse()))
    } else {
      return new Promise(resolve => resolve(this.userList))
    }
  }
}
