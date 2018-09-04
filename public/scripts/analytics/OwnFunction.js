'use strict';

class OwnFunction{
	//BasePdfControllerを持ってきていると言ってもいい
	constructor (pdfUrl, scale, viewerContainer, wrapper, pdfViewer) {
		this.pdfUrl = pdfUrl;
		this.getData();
	}

	getData(){
		let requestUrl = '/api/getAnalyticsData';
		let params = {
			url: this.pdfUrl
		};
		window.superagent.get(requestUrl).query(params).set('Accept', 'application/json').then((response) => {
			this.viewMember(response);
			this.viewAnswer(response);
			this.viewGraph(response);
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
			if(response.body.keyboraddata[i]["url"] == url){
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
		keyave = 0;
		for(let i = 0; i < response.body.commentdata.length; i++){
			keyave += response.body.commentdata[i]["合計ノート"];
			if(response.body.commentdata[i]["url"] == url){
				pdfdata = response.body.commentdata[i];
			}
		}
		keyave = keyave / response.body.commentdata.length;
		if(keyave > pdfdata["合計ノート"]){
			Outdataset = [pdfdata["合計ノート"], keyave - pdfdata["合計ノート"]];
			Insidedataset = [keyave];

		}else{
			Outdataset = [pdfdata["合計ノート"]];
			Insidedataset = [keyave, pdfdata["合計ノート"] - keyave];
		}
		Outcircle.OutnoteChart.myDoughnutChart = new Chart(Outcircle.OutnoteChart.ctx, {
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
		Insidecircle.InsidenoteChart.myDoughnutChart = new Chart(Insidecircle.InsidenoteChart.ctx, {
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
		maindata[2].innerText = Math.floor(pdfdata["合計ノート"]);
		innerdata[2].innerText = Math.floor(keyave);

		keyave = 0;
		for(let i = 0; i < response.body.markdata.length; i++){
			keyave += response.body.markdata[i]["合計マーク"];
			if(response.body.markdata[i]["url"] == url){
				pdfdata = response.body.markdata[i];
			}
		}
		keyave = keyave / response.body.markdata.length;
		if(keyave > pdfdata["合計マーク"]){
			Outdataset = [pdfdata["合計マーク"], keyave - pdfdata["合計マーク"]];
			Insidedataset = [keyave];

		}else{
			Outdataset = [pdfdata["合計マーク"]];
			Insidedataset = [keyave, pdfdata["合計マーク"] - keyave];
		}
		Outcircle.OutmarkChart.myDoughnutChart = new Chart(Outcircle.OutmarkChart.ctx, {
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
		Insidecircle.InsidemarkChart.myDoughnutChart = new Chart(Insidecircle.InsidemarkChart.ctx, {
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
		maindata[3].innerText = Math.floor(pdfdata["合計マーク"]);
		innerdata[3].innerText = Math.floor(keyave);
	}

	viewMember(response){
		var personnum = response.body.totalperson.length;
		document.getElementById("population").innerText = `累計閲覧人数:  ${personnum}人`;
		menu.innerHTML = `<option value= "all" selected>全体のデータ</option>`;
		for(let n = 0; n < personnum; n++){
			menu.innerHTML += `<option value="${response.body.totalperson[n].student_number}">${response.body.totalperson[n].student_number}</option>`;
		}
	}

	viewAnswer(response){
		var personnum = response.body.totalperson.length;
		document.getElementById('answerbox').innerHTML = "";
		let answer = response.body.answer;
		let correct = {};
		for(let n = 0; n < answer.length; n++){
			if(!correct["answer_" + answer[n].blank_id]){
				correct["answer_" + answer[n].blank_id] = {};
				correct["answer_" + answer[n].blank_id].text = answer[n].answer_text;
				correct["answer_" + answer[n].blank_id].page_num = answer[n].page_num;
				correct["answer_" + answer[n].blank_id].totalnumber = 1;
			}else{
				correct["answer_" + answer[n].blank_id].totalnumber++;
			}
		}

		let box = document.getElementById('answerbox');
		for(var target in correct){
			let percent = 0;
			if(correct[target].totalnumber > 1){
				percent = correct[target].totalnumber / personnum * 100;
				if(percent > 100){
					percent = 100;
				}
			}
			box.innerHTML += `
				<div id="answer_${correct[target].blank_id}" class="innerbox">
					<p>${correct[target].text}</p>
					<p>正答率: ${percent}%</p>
					<meter min=0 max=100 value=${percent}>
				</div>
			`;
		};
	}
}
