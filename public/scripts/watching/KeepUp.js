'use strict';

class KeepUp {
    constructor (pdfUrl, socket, scale) {
      this.pdfUrl = pdfUrl;
      this.socket = socket;
      this.scale = scale;

      this.heatmap = document.getElementById('HeatMap');
      this.views = document.getElementById('views');

      this.socket.emit('join', {
        url: this.pdfUrl,
        student_number: 999999
      });
    }

    //これなんだろ
    sendPageTurning  () {
      let params = {
        page_num: 1,
        url: this.pdfUrl
      };

      this.socket.emit('analytics:page_turning', params);
    }

    //閲覧状況のソケットを貰った時の処理
    getKeepUp (data) {
    //  this._updateHeatMap(data);
    }

    //ヒートアップゲージの更新
    _updateHeatMap (data) {
      //これがバーそのもの
      let keepupDiv = document.createElement('div');
      keepupDiv.id = 'keep_up_with';
      //人数のやつ
      let keepupNum = data.keepup_num;
      let population = data.population;

      //座標取得
      let concentrationHeatmap = document.getElementsByClassName('Concentration_HeatMap')[0];
      let heatmapRect = document.getElementById('HeatMap').getBoundingClientRect();
      let concentrationHeatmapRect = concentrationHeatmap.getBoundingClientRect();

      //定数にする必要があるか
      const MAX_PERCENT = 100;

      if (document.getElementById('keep_up_with')) {
        let heatmap = document.getElementById('keep_up_with');
        heatmap.parentNode.removeChild(heatmap);
  //      this._removeKeepupHeatmap();
      }


      //単純計算★
      let percent = MAX_PERCENT * keepupNum / population;

      //レンダリングする幅を決定
      let keepupWidth = concentrationHeatmapRect.width * percent / MAX_PERCENT;
      let keepupHeight = 30;

      //レンダリング★
      concentrationHeatmap.appendChild(keepupDiv);
      keepupDiv.style.top = `${-30}px`;
      keepupDiv.style.width = `${keepupWidth}px`;
      keepupDiv.style.height = `${keepupHeight}px`;
      keepupDiv.style.position = 'relative';
      keepupDiv.style.display = 'block';
    }
    //
    // _removeKeepupHeatmap () {
    //   let heatmap = document.getElementById('keep_up_with');
    //   heatmap.parentNode.removeChild(heatmap);
    // }

}
