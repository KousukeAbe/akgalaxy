function SwitchUserPage(e){
  let student_number = e.target.value;
  document.getElementById("contents").innerHTML = `
  <div id="title">
    <h1>${student_number}　のデータ</h1>
    <hr>
  </div>
  <div id="datainfo">
    <p>最終更新：　<span id="finalupdate"></span></p>
    <div>
      <div class="checkinfo">
        <div class="checktitle">全問正解</div>
        <div class="checkboolean" id="allpass"></div>
      </div>
      <div class="checkinfo">
        <div class="checktitle">３０分以上画面外</div>
        <div class="checkboolean" id="inactive"></div>
      </div>
    </div>
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

  let requestUrl = '/api/getUserAnalyticsDate';
  let params = {
    url: "/documents/" + window.sessionStorage.getItem("url"),
    student_number: student_number
  };
  window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
    console.log(response);

      requestUrl = '/api/getUserAnalyticsData';
       params = {
        url: "/documents/" + window.sessionStorage.getItem("url"),
        student_number: student_number,
        date: response.body[response.body.length - 1].date
      };

      window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
        console.log(response);
        let arr = [];
        let category = [];
        document.getElementById("finalupdate").innerHTML = response.body.dateTurning[response.body.dateTurning.length - 1].date;
        for(let i = 0; i < response.body.pageTurning.length; i++){
          let res = response.body.pageTurning[i];
          if(i != 0){
            if(res.page_num != response.body.pageTurning[i - 1].page_num)arr.push(res.page_num);
          }
          let date = new Date(res.created_at);
          category.push(date.getHours() + ":" + date.getMinutes());
        }

        let keyavg = 0, mouseavg = 0, noteavg = 0, markavg = 0, mykey = 0, mymouse = 0, mynote = 0, mymark = 0, myinactive = 0;
        for(res of response.body.keyboraddata){
          if(student_number == res.student_number){
            mykey = res["合計キー"];
            mymouse = res["合計マウス"];
            myinactive = res["合計待機時間"];
          }
          keyavg += res["合計キー"];
          mouseavg += res["合計マウス"];
        }

        for(res of response.body.mark){
          if(student_number == res.student_number){
            mymark = res["count(*)"];
          }
          markavg += res["count(*)"];
        }

        for(res of response.body.comment){
          if(student_number == res.student_number){
            mynote = res["count(*)"];
          }
          noteavg += res["count(*)"];
        }

        document.getElementById("click").innerHTML = mymouse + "回";
        document.getElementById("clickavg").innerHTML = mouseavg / response.body.keyboraddata.length + "回";
        document.getElementById("key").innerHTML = mykey + "回";
        document.getElementById("keyavg").innerHTML = keyavg / response.body.keyboraddata.length + "回";
        document.getElementById("note").innerHTML = mynote < 0 ? 0 : mynote + "回";
        document.getElementById("noteavg").innerHTML = noteavg / response.body.comment.length < 0 ? 0 : noteavg / response.body.comment.length + "回";
        document.getElementById("mark").innerHTML = mymark < 0 ? 0 : mymark + "回";
        document.getElementById("markavg").innerHTML = markavg / response.body.comment.length < 0 ? 0 : markavg / response.body.comment.length + "回";

        if(myinactive / 60000 > 30)document.getElementById("inactive").innerHTML = "○";

        createUserchart(arr, category);
      });
    });
}
function createUserchart(data, category){
Highcharts.chart('UserGraph', {
  title: {
    text: 'ページ遷移時系列'
  },

  yAxis: {
    title: {
      text: 'ページ番号'
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
        name: 'ページNo',
        data: data
    }],

    responsive: {
    }
  });
}
