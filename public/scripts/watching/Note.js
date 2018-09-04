'use strict';

class Note {
    constructor (url, socket) {
        this.pdfUrl = url;
        this.socket = socket;
        this.socket.on('event:update_note_browsing', (data) => {
            this.getNote(data);
        });
    }
    //コメントが送ってきたら表示
    getNote (data) {
      if(data.target == 'page' && data.page_num != currentPageNum)return;
      let note = document.getElementById(`note_for_${data.target}`);
      let format = `[${data.student_number}　画面外時間: ${data.time}分]${data.note.replace("\n", "") + "\n" + note.value}`;
      note.value = format;
    }
}
