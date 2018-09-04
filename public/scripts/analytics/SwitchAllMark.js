function SwitchAllMark(){
  document.getElementById("contents").innerHTML = `
  <div id="title">
    <h1>マーク作成回数</h1>
    <hr>
  </div>
  <div id="datainfo">
    <p>最終更新：　2018/06/15</p>
    <p id="length">累計人数: 1000人</p>
  </div>
  <div id="container" style="width: 90%; margin: 100px auto"></div>
  `;

  let requestUrl = '/api/getAllMark';
  let params = {
    url: "/documents/" + window.sessionStorage.getItem("url")
  };

  let data = [];
  window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
    document.getElementById("length").innerHTML = `累計参加人数: ${response.body.length}人`;
    let total = 0;
    let avg = 0;
    let arr = [];
    for(res of response.body){
      total += res.key;
      arr.push(res.key);
    }
    let max = Math.floor(Math.max(...arr) / 5) * 5 <= 0 ? 5 : Math.floor(Math.max(...arr) / 5) * 5;
    let maxval = Math.max(...arr) < max ? 5 : Math.max(...arr);
    data.push([`〜${max}`, 0]);
    for(let i = 1; i < 6; i++){
      data.push([`${max - (i - 1) * 2}〜${max - i * 2}`, 0]);
    };
    data.push([`${max - 10}〜`, 0]);
    for(res of response.body){
      let i = Math.floor((maxval - res.key) / 2) > data.length - 1  ? data.length - 1 : Math.floor((maxval - res.key) / 2);
      data[i][1] += 1;
    }

    createMarkchart(data);
  });
}

function createMarkchart(data){
  Highcharts.chart('container', {
    chart: {
      type: 'column'
    },
    title: {
      text: 'ノート作成数でのヒストグラム'
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
        text: 'ノート作成回数'
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: '人数'
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
