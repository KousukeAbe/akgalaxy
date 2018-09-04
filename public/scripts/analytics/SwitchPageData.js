function SwitchPageData(e){
  let PageNumber = e.target.value;
  document.getElementById("contents").innerHTML = `
  <div id="title">
    <h1>ページ${PageNumber}　のデータ</h1>
    <hr>
  </div>
  <div id="datainfo">
    <p>最終更新：　<span id="finalupdate"></span></p>
    <div></div>
  </div>
  <div id="main">
    <div id="UserGraph"></div>
    <div id="UserNum">
      <h3 style="text-align:center !important">操作履歴</h3>
      <p>クリック回数: <span id="click"></span><p>
      <p class="avg">全体平均: <span id="clickavg"></span><p>
      <p>キー回数: <span id="key"></span><p>
      <p class="avg">全体平均: <span id="keyavg"></span><p>
      <p>ノート作成回数: <span id="note"></span><p>
      <p class="avg">全体平均: <span id="noteavg"></span><p>
      <p>マーク作成回数: <span id="mark"></span><p>
      <p class="avg">全体平均: <span id="markavg"></span><p>
    <div>
  <div>
  `;
  requestUrl = '/api/getPageAnalyticsData';
  params = {
    url: "/documents/" + window.sessionStorage.getItem("url"),
    page_number: PageNumber,
  };
  let data = [];

  window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
    console.log(response);
    let arr = [];
    let category = [];
//    document.getElementById("finalupdate").innerHTML = response.body.dateTurning[response.body.dateTurning.length - 1].date;
    for(res of response.body.selectText){
      data.push([res.text, res["count(*)"]]);
    }
    if(data.length <= 0){
      data.push(["選択単語なし", 0]);
    }

    let keyavg = 0, mouseavg = 0, noteavg = 0, markavg = 0, mykey = 0, mymouse = 0, mynote = 0, mymark = 0, myinactive = 0;
    for(res of response.body.keyboraddata){
      if(PageNumber == res.page_num){
        mykey = res["合計キー"];
        mymouse = res["合計マウス"];
        myinactive = res["合計待機時間"];
      }
      keyavg += res["合計キー"];
      mouseavg += res["合計マウス"];
    }

    for(res of response.body.mark){
      if(PageNumber == res.page_num){
        mymark = res["count(*)"];
      }
      markavg += res["count(*)"];
    }

    for(res of response.body.comment){
      if(PageNumber == res.page_num){
        mynote = res["count(*)"];
      }
      noteavg += res["count(*)"];
    }

    document.getElementById("click").innerHTML = mymouse + "回";
    document.getElementById("clickavg").innerHTML = Math.floor(mouseavg / response.body.keyboraddata.length) + "回";
    document.getElementById("key").innerHTML = mykey + "回";
    document.getElementById("keyavg").innerHTML = Math.floor(keyavg / response.body.keyboraddata.length) + "回";
    document.getElementById("note").innerHTML = mynote < 0 ? 0 : mynote + "回";
    document.getElementById("noteavg").innerHTML = noteavg / response.body.comment.length < 0 ? 0 : Math.floor(noteavg / response.body.comment.length) + "回";
    document.getElementById("mark").innerHTML = mymark < 0 ? 0 : mymark + "回";
    document.getElementById("markavg").innerHTML = markavg / response.body.comment.length < 0 ? 0 : Math.floor(markavg / response.body.comment.length) + "回";

    createPagechart(data);
  });
}
function createPagechart(data){
  Highcharts.chart('UserGraph', {
    chart: {
      type: 'column'
    },
    title: {
      text: '選択文字列でのヒストグラム'
    },
    xAxis: {
      type: 'category',
      labels: {
        rotation: 0,
        style: {
          fontSize: '17px',
          fontFamily: 'Verdana, sans-serif'
        }
      },
      title: {
        text: '単語'
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: '回数'
      }
    },
    legend: {
      enabled: false
    },
    tooltip: {
      pointFormat: '<b>{point.y:.1f} 人</b>'
    },
    series: [{
      name: 'Population',
      data: data,
        dataLabels: {
            enabled: true,
            rotation: 0,
            color: '#FFFFFF',
            align: 'right',
            format: '{point.y:.1f}', // one decimal
            y: 0, // 10 pixels down from the top
            x: -25,
            style: {
                fontSize: '13px',
                fontFamily: 'Verdana, sans-serif'
            }
        }
    }]
});
}
