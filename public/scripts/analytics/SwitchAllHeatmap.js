function SwitchAllHeatmap(){
  document.getElementById("contents").innerHTML = `
  <div id="title">
    <h1>ヒートマップ系列状況</h1>
    <hr>
  </div>
  <div id="datainfo">
    <p>最終更新：　2018/06/15</p>
    <p id="selecter"><select id="date"></select></p>
  </div>
  <div id="container" style="width: 90%; margin: 100px auto"></div>
  `;

  let requestUrl = '/api/getAllHeatmapDate';
  let params = {
    url: "/documents/" + window.sessionStorage.getItem("url")
  };

  window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
    console.log(response);

    let requestUrl = '/api/getAllHeatmap';
    let params = {
      url: "/documents/" + window.sessionStorage.getItem("url"),
      date: response.body[response.body.length - 1].date
    };
    let dateselect = document.getElementById("date");
    dateselect.innerHTML = "";
    for(res of response.body){
      let date = new Date(res.date);
      console.log(date.getDate());
      dateselect.innerHTML += "<option>" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "</option>";
    }
    let data = [];
    window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
      let arr = [];
      let category = [];
      for(res of response.body){
        arr.push(res.heatup);
        let date = new Date(res.date);
        category.push(date.getHours() + ":" + date.getMinutes());
      }

      // console.log(total / response.body.length);
      // let max = Math.floor(Math.max(...arr) / 100) * 100;
      // let maxval = Math.max(...arr);
      // data.push([`〜${max}`, 0]);
      // for(let i = 1; i < 6; i++){
      //   data.push([`${max - (i - 1) * 100}〜${max - i * 100}`, 0]);
      // };
      // data.push([`${max - 500}〜`, 0]);
      // console.log(response.body);
      // for(res of response.body){
      //   let i = Math.floor((maxval - res.key) / 100) > data.length - 1 ? data.length - 1 : Math.floor((maxval - res.key) / 100);
      //   data[i][1] += 1;
      // }

      createHeatmapchart(arr, category);
    });
  });
}

function createHeatmapchart(data, category){
  console.log(document.getElementById("container"));
Highcharts.chart('container', {
  title: {
    text: 'ヒートマップ時系列'
  },

  yAxis: {
    title: {
      text: '数値（％）'
    }
  },

  xAxis: {
    title: {
      text: '時間'
    },
    categories: category
  },
  legend: {
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'middle'
  },

    series: [{
        name: 'ヒートマップ',
        data: data
    }],

    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
      }],
    }
  });
}
