function SwitchAllInactive(){
  document.getElementById("contents").innerHTML = `
  <div id="title">
    <h1>画面外時間</h1>
    <hr>
  </div>
  <div id="datainfo">
    <p>最終更新：　2018/06/15</p>
    <p id="length">累計人数: 1000人</p>
  </div>
  <div id="container" style="width: 90%; margin: 100px auto"></div>
  `;
  let requestUrl = '/api/getAllStaytime';
  let params = {
    url: "/documents/" + window.sessionStorage.getItem("url")
  };

  let data = [];
  window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
    document.getElementById("length").innerHTML = `累計参加人数: ${response.body.length}人`;
    console.log(response.body);
    let total = 0;
    //let avg = 0;
    let arr = [];
    for(res of response.body){
      total += res.key / 60000;
      arr.push(res.key / 60000);
    }
    let avg = Math.floor(total / arr.length);
    console.log(avg);
    data.push([`${avg}〜${avg - 5}`, 0]);
    for(let i = 1; i < 4; i++){
      data.push([`${avg - i * 5}〜${avg - i * 5 - 5}`, 0]);
    };
    data.push([`${avg - 4 * 5}〜`, 0]);
    for(let i = 1; i < 4; i++){
      data.unshift([`${avg + i * 5 + 5}〜${avg + i * 5}`, 0]);
    };
    let maxval = avg + 4 * 5;
    data.unshift([`〜${avg + 4 * 5}`, 0]);
    for(res of response.body){
      if(avg < res.key){
        data[0][1] += 1;
        continue;
      }else if((avg - 4 * 5) > res.key){
        data[data.length - 1][1] += 1;
        continue;
      }
      let i = Math.floor((maxval - Math.floor(res.key / 60000)) / 5);
      data[i][1] += 1;
    }

    createInactivechart(data);
  });
}

function createInactivechart(data){
  Highcharts.chart('container', {
    chart: {
      type: 'column'
    },
    title: {
      text: '画面外時間でのヒストグラム'
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
        text: 'クリック回数'
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
            rotation: -90,
            color: '#FFFFFF',
            align: 'right',
            format: '{point.y:.1f}', // one decimal
            y: 10, // 10 pixels down from the top
            style: {
                fontSize: '13px',
                fontFamily: 'Verdana, sans-serif'
            }
        }
    }]
});
}
