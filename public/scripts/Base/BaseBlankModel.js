'use strict';

class BaseBlankModel {
  //プロパティ設定
  constructor (url) {
    this.url = url;
    this.spaces = [];
    this.superagent = window.superagent;
  }

  //空白を一通り持ってくる
  load () {
    //api設定
    let requestUrl = '/api/loadBlanks';
    let params = {url: this.url};
    //実際にやりとり。成功すれば一覧に保存。一覧を空にする処理も行なっているので更新もこれで行える
    window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
      if(response.text == "")return;
      let parse = JSON.parse(response.text);
      this.spaces = [];
      for (let i = 0; i < parse.length; ++i) {
        this.spaces.push(parse[i]);
      }
    }).catch((error) => {
      throw error;
    });
  }

  clearTemprarySpaces () {
      this.spaces = [];
  }
}
