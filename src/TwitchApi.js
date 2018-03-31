const axios = require('axios')
const { workspace, window } = require('vscode')
const { get } = require('lodash')
module.exports = class TwitchApi {
  constructor(clientID) {
    this.API = 'https://api.twitch.tv/helix/'
    this.loginUser = workspace.getConfiguration('twitcher').twitchLoginName
    this.lastResponse = null

    this.http = axios.create({
      debug: true,
      baseURL: this.API,
      headers: {
        'Client-ID': clientID
      }
    })

    /**
     * We store the response maybe we want later update a title or something
     */
    this.http.interceptors.response.use(
      response => {
        this.lastResponse = response
        return response
      },
      function(err) {
        window.showErrorMessage('Twitch Api Request fail')

        return Promise.reject(err)
      }
    )
  }

  getLastResponse() {
    return this.lastResponse
  }
  async getViewerCount() {
    const { data: { data } } = await this.http(
      `streams?first=1&user_login=${this.loginUser}`
    )

    if (data.lenght !== 0) {
      return data[0].viewer_count
    } else {
      return 'Stream Offline'
    }
  }

  async getViewerList() {
    const result = await this.http(
      `https://tmi.twitch.tv/group/user/${this.loginUser}/chatters`
    )

    return get(result, 'data.chatters.viewers', [])
  }
}
