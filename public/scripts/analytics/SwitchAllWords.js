function SwitchAllWords(){
  document.getElementById("contents").innerHTML = `
  <div id="title">
    <h1>選択文字頻度状況</h1>
    <hr>
  </div>
  <div id="datainfo">
    <p>最終更新：　2018/06/15</p>
    <p> </p>
  </div>
  <div id="container" style="width: 90%; margin: 100px auto"></div>
  `;
  let requestUrl = '/api/getAllWords';
  let params = {
    url: "/documents/" + window.sessionStorage.getItem("url")
  };
    let data = [];
    window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
      //cument.getElementById("length").innerHTML = `累計参加人数: ${response.body.length}人`;
      console.log(response);
      let total = 0;
      let avg = 0;
      let arr = [];
      for(res of response.body){
        data.push([res.text, res["count(*)"]]);
      }
      createWordchart(data);
    });
  }

  function createWordchart(data){
    Highcharts.chart('container', {
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
