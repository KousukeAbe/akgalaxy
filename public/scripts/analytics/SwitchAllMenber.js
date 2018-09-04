function SwitchAllMenber(){
  document.getElementById("contents").innerHTML = `
  <div id="title">
    <h1>参加人数</h1>
    <hr>
  </div>
  <div id="datainfo">
    <p>最終更新：　2018/06/15</p>
    <p id="length">累計人数: 1000人</p>
</div>
<div id="memberList">
  <table summary="Submitted table designs">
    <thead>
      <tr>
        <th scope="col">学籍番号</th>
        <th scope="col">名前</th>
        <th scope="col">最終更新日</th>
      </tr>
    </thead>
    <tfoot>
      <tr></tr>
    </tfoot>
    <tbody id="content">
    </tbody>
  </table>
</div>
  `;

  let requestUrl = '/api/getAllMember';
  let params = {
    url: "/documents/" + window.sessionStorage.getItem("url")
  };
  window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
    document.getElementById("length").innerHTML = `累計参加人数: ${response.body.length}人`;
    for(let i = 0; i < response.body.length; i++){
      if(i % 2 != 0){
        document.getElementById("content").innerHTML += `
        <tr>
          <th scope="row" id="r5">${response.body[i].student_number}</th>
          <td>${response.body[i].login_name}</td>
          <td>2018/06/15</td>
        </tr>
        `;
      }else{
        document.getElementById("content").innerHTML += `
        <tr class="odd">
          <th scope="row" id="r5">${response.body[i].student_number}</th>
          <td>${response.body[i].login_name}</td>
          <td>2018/06/15</td>
        </tr>
        `;
      }
    }
  });
}
