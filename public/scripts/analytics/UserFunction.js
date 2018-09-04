'use strict';

class UserFunction{
	//BasePdfControllerを持ってきていると言ってもいい
	constructor (pdfUrl, student_number) {
		this.pdfUrl = pdfUrl;
    this.student_number = student_number;

		view.innerHTML = `
		<div id="usermain">
			<div id="graph">
				<h2>ページ推移</h3>
				<form>
					<label>
						<select id="date"></select>
					</label>
				</form>
				<canvas id="pagegraph" width=${window.parent.screen.width * 0.4} height=${window.parent.screen.height * 0.7}></canvas>
			</div>
			<div id="keyborad">
				<h2>キーボード入力平均</h2>
				<canvas id="OutkeyboradChart" width="400" height="300"></canvas>
				<canvas id="InsidekeyboradChart" width="230" height="300" style="margin:-300px auto;"></canvas>
				<p class="maindata">110</p>
				<p class="innerdata">80</p>
			</div>

			<div id="keyborad">
				<h2>クリック数平均</h2>
				<canvas id="OutclickChart" width="400" height="300"></canvas>
				<canvas id="InsideclickChart" width="230" height="300" style="margin:-300px auto;"></canvas>
				<p class="maindata">110</p>
				<p class="innerdata">80</p>
			</div>

			<div id="info">
				<h3 id="answer_title">回答状況</h3>
				<div id="answerbox"></div>
			</div>
		</div>
		`;
		Outcircle.OutkeyboradChart ={};
		Outcircle.OutkeyboradChart.ctx = document.getElementById("OutkeyboradChart").getContext("2d");
		Insidecircle.InsidekeyboradChart ={};
		Insidecircle.InsidekeyboradChart.ctx = document.getElementById("InsidekeyboradChart").getContext("2d");

		Outcircle.OutclickChart ={};
		Outcircle.OutclickChart.ctx = document.getElementById("OutclickChart").getContext("2d");
		Insidecircle.InsideclickChart ={};
		Insidecircle.InsideclickChart.ctx = document.getElementById("InsideclickChart").getContext("2d");

		maindata = document.getElementsByClassName('maindata');
		innerdata = document.getElementsByClassName('innerdata');

		this.getData();
		date.addEventListener("change", () => {
			this.changeDate(date.value);
		});
	}

	changeDate(date){
		let requestUrl = '/api/getUserDateData';
		let params = {
			url: this.pdfUrl,
			student_number: this.student_number,
			date: date
		};
		window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
			this.viewChart(response);
		});
	}

	getData(){
		let requestUrl = '/api/getUserAnalyticsData';
		let params = {
			url: this.pdfUrl,
			student_number: this.student_number
		};
		window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
			this.viewAnswer(response);
			this.viewGraph(response);
			this.viewChart(response);
			this.viewDate(response);
		});
	}

	viewDate(response){
		console.log(response.body.dateTurning);
		var datenum = response.body.dateTurning.length;
		let date = document.getElementById('date');
		for(let n = 0; n < datenum - 1; n++){
			date.innerHTML += `<option value="${response.body.dateTurning[n].date}">${response.body.dateTurning[n].date}</option>`;
		}
		date.innerHTML += `<option value="${response.body.dateTurning[response.body.dateTurning.length -1].date}" selected>${response.body.dateTurning[response.body.dateTurning.length -1].date}</option>`;
	}

	viewAnswer(response){
		document.getElementById('answerbox').innerHTML = "";
		let answer = response.body.answer;
		let answerlog = [];
		let box = document.getElementById('answerbox');

		for(let n = 0; n < answer.length; n++){
			if(answerlog.indexOf(answer[n].blank_id) < 0){
				box.innerHTML += `
					<div id="answer_${answer[n].blank_id}" class="innerbox">
						<p>回答: ${answer[n].input_text}</p>
						<p>正解: ${answer[n].answer_text}</p>
						<p>結果: ${(answer[n].correct_answer_status == 1) ? "正解" : "不正解"}</p>
					</div>
				`;
				answerlog.push(answer[n].blank_id);
			}
		}
	}

	viewChart(response){
		 let pageTurning = response.body.pageTurning;
		 let labels = [], data = [];
		 let lastpagenum = 0;
		 for(let n = 0; n < pageTurning.length; n++){
			 if(lastpagenum == pageTurning[n].page_num)continue;
			 lastpagenum = pageTurning[n].page_num;
		   let date = new Date(pageTurning[n].created_at);
		   labels.push(date.getHours() + ":"  + (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()));
		   data.push(pageTurning[n].page_num);
		  }
		  let ctx9 = document.getElementById('pagegraph').getContext('2d');
			ctx9.innerHTML = "";
		  var myChart = new Chart(ctx9, {
		   	type: 'line',
	     data: {
		     labels: labels,
		     datasets: [{
		       data: data,
		       backgroundColor: "rgba(153,255,51,0.4)"
		     }]
		   },
		   options: {
		     cutoutPercentage: 80,
		     responsive: false,
		     maintainAspectRatio:false,
				 legend: {
									 display: false,
									 labels: {
											 fontColor: 'rgb(255, 99, 132)'
									 }
				 }
		   }
		 });
	}

	viewGraph(response){
		let Outdataset, Insidedataset;
		let keyave = 0;
		let mouseave = 0;
		let pdfdata;
		for(let i = 0; i < response.body.keyboraddata.length; i++){
			keyave += response.body.keyboraddata[i]["合計キー"];
			mouseave += response.body.keyboraddata[i]["合計マウス"];
			if(response.body.keyboraddata[i]["student_number"] == this.student_number){
				pdfdata = response.body.keyboraddata[i];
			}
		}
		keyave = keyave / response.body.keyboraddata.length;
		mouseave = mouseave / response.body.keyboraddata.length;
		if(keyave > pdfdata["合計キー"]){
			Outdataset = [pdfdata["合計キー"], keyave - pdfdata["合計キー"]];
			Insidedataset = [keyave];

		}else{
			Outdataset = [pdfdata["合計キー"]];
			Insidedataset = [keyave, pdfdata["合計キー"] - keyave];
		}
		Outcircle.OutkeyboradChart.myDoughnutChart = new Chart(Outcircle.OutkeyboradChart.ctx, {
			type: 'doughnut',
			data:  {
				datasets: [{
				 data: Outdataset,
				 backgroundColor: ['rgba(246, 202, 6, 0.8)', 'rgba(0, 61, 92, 0)'],
				 borderColor: "rgba(246, 202, 6, 0)"
				}],
			},
			options: Circleoptions
		});
		Insidecircle.InsidekeyboradChart.myDoughnutChart = new Chart(Insidecircle.InsidekeyboradChart.ctx, {
			type: 'doughnut',
			data:  {
				datasets: [{
				 data: Insidedataset,
				 backgroundColor: ['rgba(0, 61, 92, 0.8)', 'rgba(0, 61, 92, 0)'],
				 borderColor: "rgba(0, 61, 92, 0)"
				}],
			},
			options: Circleoptions
		});
		maindata[0].innerText = Math.floor(pdfdata["合計キー"]);
		innerdata[0].innerText = Math.floor(keyave);

		if(mouseave > pdfdata["合計マウス"]){
			Outdataset = [pdfdata["合計マウス"], mouseave - pdfdata["合計マウス"]];
			Insidedataset = [mouseave];
		}else{
			Outdataset = [pdfdata["合計マウス"]];
			Insidedataset = [mouseave, pdfdata["合計マウス"] - mouseave];
		}
		Outcircle.OutclickChart.myDoughnutChart = new Chart(Outcircle.OutclickChart.ctx, {
			type: 'doughnut',
			data:  {
				datasets: [{
				 data: Outdataset,
				 backgroundColor: ['rgba(246, 202, 6, 0.8)',  'rgba(0, 61, 92, 0)'],
				 borderColor: "rgba(246, 202, 6, 0)"
				}],
			},
			options: Circleoptions
		});
		Insidecircle.InsideclickChart.myDoughnutChart = new Chart(Insidecircle.InsideclickChart.ctx, {
			type: 'doughnut',
			data:  {
				datasets: [{
				 data: Insidedataset,
				 backgroundColor: ['rgba(0, 61, 92, 0.8)', 'rgba(0, 61, 92, 0)'],
				 borderColor: "rgba(0, 61, 92, 0)"
				}],
			},
			options: Circleoptions
		});
		maindata[1].innerText = Math.floor(pdfdata["合計マウス"]);
		innerdata[1].innerText = Math.floor(mouseave);
	}
}
