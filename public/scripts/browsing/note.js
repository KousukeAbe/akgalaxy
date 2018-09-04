'use strict';

class Note {
  constructor(url, socket) {
    this.pdfUrl = url;
    this.socket = socket;
  }

  sendNoteDoc (note) {
    let time = Math.floor(totalstaytime / 60000);
    const params = {
      socket_id: this.socket.id,
      sender: 'browsing',
      note: note,
      target: 'doc',
      client_url: this.pdfUrl,
      student_number: document.getElementById('student_number').innerText,
      time: time,
      page_num: document.getElementById('page_num').value
    };
    this.socket.emit('update_note', params);
    log(this.pdfUrl, document.getElementById('page_num').value, Log.WriteNote, note);
  }

  sendNotePage (note) {
    let time = Math.floor(totalstaytime / 60000);
    const params = {
      socket_id: this.socket.id,
      sender: 'browsing',
      note: note,
      target: 'page',
      client_url: this.pdfUrl,
      student_number: document.getElementById('student_number').innerText,
      time: time,
      page_num: document.getElementById('page_num').value
    };
    this.socket.emit('update_note', params);
    log(this.pdfUrl, document.getElementById('page_num').value, Log.WriteNote, note);
  }
}
