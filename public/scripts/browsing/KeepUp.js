'use strict';

class KeepUp {
  //プロパティの設定
  constructor (pdfUrl, socket) {
    this.pdfUrl = pdfUrl;
    this.socket = socket;

    this.socket.emit('join', {
      url: this.pdfUrl,
      student_number: document.getElementById('student_number').innerText
    });
  }

  sendPageTurning () {
    let params = {
      page_num: document.getElementById('page_num').value,
      url: this.pdfUrl,
      student_number: document.getElementById('student_number').innerText,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    this.socket.emit('browsing:page_turning', params);
  }

  sendPageClose () {
    let params = {
      page_num: 0,
      url: this.pdfUrl,
      student_number: document.getElementById('student_number').innerText,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    this.socket.emit('browsing:page_turning', params);
  }
}
