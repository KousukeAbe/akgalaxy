let pdflist;
let send;
let main;
let parts;
let flag;

let auth;
let brow;
let pre;
let ana;

window.onload = function(){
  main = document.getElementById('main');
  send = document.getElementById("send");
  parts = document.getElementsByClassName("button").length;
  if(parts > 1){
    flag = true;
  }else{
    flag = false;
  }
}

//PDF登録ボタンを押した時の挙動
function add(){
  let parts = document.getElementsByClassName("parts");
  for(let i = parts.length - 1; i > 0; i--){
    main.removeChild(parts[i]);
  };
  main.innerHTML += `
    <div class="parts">
      <div class="background">
        <h1>2. PDF登録</h1>
        <hr color="#eeeeee">
        <form action="storepdf" method="post" style="margin: 0 auto; width:200px;" enctype="multipart/form-data">
          <input type="file" name="pdffile" accept="application/pdf">
          <input type="submit">
        </form>
      </div>
    </div>
  `;
};

//PDFセレクト押した時の挙動
function select(){
  let parts = document.getElementsByClassName("parts");
  for(let i = parts.length - 1; i > 0; i--){
    main.removeChild(parts[i]);
  };

  main.innerHTML += `
  <div class="parts">
    <div class="background">
      <h1>2. PDF選択</h1>
      <hr color="#eeeeee">
      <h2 id="selectpdf"></h2>
      <select id="pdflist" size="3"></select>
    </div>
  </div>
  `;

  pdflist = document.getElementById("pdflist");
  let requestUrl = '/api/getPdfList';
  window.superagent.get(requestUrl).query("").set('Accept', 'application/json').then((response) => {
    for(let i = 0; i < response.body.length; i++){
      pdflist.innerHTML += `
      <option value="${response.body[i].name}">${response.body[i].name}</option>
      `
    };
  });
  pdflist.addEventListener('change', pdfadd);
};

  function pdfadd(){
    if(flag){
     let pdflist = document.getElementById("pdflist");
     document.getElementById("selectpdf").innerHTML = "選択PDF： " + pdflist.value;

     let three = document.getElementById("three");
     if(three != null)three.parentNode.removeChild(three);

     main.innerHTML += `
     <div class="parts" id="three">
         <div class="background">
           <h1>3. モード選択</h1>
           <hr color="#eeeeee">
           <div id="auth" class="button browsingbutton">
             <img src="/images/auth.svg" class="modeicon"/>
             <p>オーサリングモード</p>
           </div>

           <div id="brow" class="button browsingbutton">
             <img src="/images/bro.svg" class="modeicon"/>
             <p>ブラウジングモード</p>
           </div>

           <div id="pre" class="button browsingbutton">
             <img src="/images/pre.svg" class="modeicon"/>
             <p>プレゼンモード</p>
           </div>

           <div id="ana" class="button browsingbutton">
             <img src="/images/ana.svg" class="modeicon"/>
             <p>アナリティクスモード</p>
           </div>
         </div>
     </div>
     `;
     auth = document.getElementById('auth');
     brow = document.getElementById('brow');
     pre = document.getElementById('pre');
     ana = document.getElementById('ana');

     auth.addEventListener('click', function(e){
       window.sessionStorage.setItem("url", pdflist.value);
       location.href = "/authoring";
     });

     brow.addEventListener('click', function(e){
       window.sessionStorage.setItem("url", pdflist.value);
       location.href = "/browsing";
     });

     pre.addEventListener('click', function(e){
       window.sessionStorage.setItem("url", pdflist.value);
       location.href = "/prezen";
     });

     ana.addEventListener('click', function(e){
       window.sessionStorage.setItem("url", pdflist.value);
       location.href = "/analytics";
     });
   }else{
     let pdflist = document.getElementById("pdflist");
     document.getElementById("selectpdf").innerHTML = "選択PDF： " + pdflist.value;

    let three = document.getElementById("three");
    if(three != null)three.parentNode.removeChild(three);

     main.innerHTML += `
     <div class="parts" id="three">
         <div class="background">
           <h1>3. モード選択</h1>
           <hr color="#eeeeee">

           <div id="brow" class="button browsingbutton">
             <img src="/images/bro.svg" class="modeicon"/>
             <p>ブラウジングモード</p>
           </div>
     </div>
     `;

     brow = document.getElementById('brow');
     brow.addEventListener('click', function(e){
       window.sessionStorage.setItem("url", pdflist.value);
       location.href = "/browsing";
     });
   }
   let pdflist = document.getElementById("pdflist");
   pdflist.addEventListener('change', pdfadd);
 }
