let memberList = [];
let pagenum;

window.onload = function(){
  url = "/documents/" + window.sessionStorage.getItem("url");
  document.getElementById('file_name').innerText = `ファイル名:  ${url}`;
  SwitchAllMenber();

  document.getElementById("All").addEventListener('click', function(e){
    switcher(e, "All");
  });

  document.getElementById("Free").addEventListener('click', function(e){
    switcher(e, "Free");
  });

  document.getElementById("Page").addEventListener('click', function(e){
    switcher(e, "Page");
  });

  let requestUrl = '/api/getAnalyticsData';
  let params = {
    url: "/documents/" + window.sessionStorage.getItem("url")
  };
  window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
    console.log(response.body.answer[response.body.answer.length - 1].page_num);
    this.viewMember(response);
    pagenum = response.body.answer[response.body.answer.length - 1].page_num;
  });
}

function viewMember(response){
  var personnum = response.body.totalperson;
  for(let n = 0; n < personnum.length; n++){
    memberList[n] = personnum[n].student_number;
  }
}

function switcher(e, type){
  if(e.target.nextElementSibling.innerHTML == ""){
    if(type == "All")All(e.target.nextElementSibling);
    else if(type == "Free")Free(e.target.nextElementSibling);
    else Page(e.target.nextElementSibling);
  }else{
    e.target.nextElementSibling.innerHTML = "";
  }
}

function All(target){
  target.innerHTML = `
    <li class="AllMenu" value="1">参加状況</li>
    <li class="AllMenu" value="2">クリック回数状況</li>
    <li class="AllMenu" value="3">キー回数状況</li>
    <li class="AllMenu" value="4">ノート作成状況</li>
    <li class="AllMenu" value="5">マーク作成状況</li>
    <li class="AllMenu" value="6">画面外時間状況</li>
    <li class="AllMenu" value="7">選択文字頻度状況</li>
    <li class="AllMenu" value="8">ヒートマップ系列状況</li>
  `;

  let contents = document.getElementsByClassName('AllMenu');
  for(i of contents) i.addEventListener('click', (e) => {SwitchAll(e)});
}

function Free(target){
  var personnum = memberList;
  for(let n = 0; n < personnum.length; n++){
    target.innerHTML += `
      <li class="FreeMenu" value=${personnum[n]}>${personnum[n]}</li>
    `;
  }
  let contents = document.getElementsByClassName('FreeMenu');
  for(i of contents) i.addEventListener('click', (e) => {SwitchUserPage(e)});
}

function Page(target){
  for(let n = 0; n < pagenum; n++){
    target.innerHTML += `
      <li class="PageMenu" value=${n + 1}>ページ${n + 1}</li>
    `;
  }
  let contents = document.getElementsByClassName('PageMenu');
  for(i of contents) i.addEventListener('click', (e) => {SwitchPageData(e)});
}
