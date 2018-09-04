# PDF -1.0-
PDFの学習システム。開発内容の解説Ver

## 環境
- Node v7.x
- MySQL

## Install
1. Githubから取得
  - git clone https://github.com/Kait-tt/template-express-socketio-auth.git
1. npmパッケージの用意。packageは記述済み
  - cd template-express-socketio-auth
  - npm install
  - npm run build
1. mysqlにテーブルを用意する
  - mysql -u root -p -e 'create database template_express_socketio_auth;'

## 引っ張って来たパッケージとか外部ソース
  1. config
    - パラメータを設定ファイルとして保存できるようにしておくことができる
  1. PDFjs
    - １番のメイン。PDFを表示する
  1. superagent
    - Ajaxの進化系。まあ非同期通信を行うためのライブラリ
## 使い方
### サーバーの起動

```
npm start
```

### sslの有効か
```
cp config/default.json config/development.json
# Change ssl.enabled to true, and set ssl.key and ssl.cert.
# e.g.,
# "ssl": {
#   "enabled": true,
#   "key": "c:/XAMPP/apache/conf/ssl.key/server.key",
#   "c:/XAMPP/apache/conf/ssl.crt/server.crt"
# }
```

## 構成
### ファイル構成

```
(root)
├── bin/www : Webサーバを起動する実行ファイル。いじるべからず
├── config/ : コンフィグ群。node-configで使うやつ
│   └── default.json : デフォルトのコンフィグファイル。名前を保存してくれる。この名前なら自動で読み取ってくれる
├── lib/ :  サーバー側のファイル群
│   ├── controllers/ : Controller
│   │   ├── auth.js : ログイン、ログイン関連のメソッドの集まり
│   │   ├── mode_select.js : mode_selectをレンダリングするだけ
│   │   └── index.js : IndexController (Top, 404, 500)
│   ├── modules/ : Modules
│   │   ├── db_model.js : データベースを接続、解除をモジュール化している
│   │   ├── user.model.js : ユーザーログイン関連の関数軍団
│   │   └── session.js : Sessionの共有・永続化モジュール
│   └── socket/ : ソケット通信のライブラリ群
│       ├── client.js : ソケット通信のクライアント
│       └── router.js : ソケット通信のルーティング
├── public/ : クライアントのソースコード
│   ├── dist/ : 配布用 (webpackにより生成される)。触るべからず
│   ├── images/ : 配布用イメージ。Expressで生成されてる。空
│   ├── lib/ : 使う外部ライブラリを保存している。触るべからず
│   ├── scripts/ : フロント周りのスクリプトはだいたいここに入っている
│   │   ├── Base/ : いろんなところで使えそうなモジュールが入っている
│   │   │     ├── BaseBlankModel.js: 空白を持ってきたり登録したりの場所
│   │   │     └── BasePdfController.js : PDFの取得やレンダリングなど。PDFjsとのやりとりはここでやる
│   │   ├── authoring/ : オーソリングモードで使うモジュール一式
│   │   │     ├── main.js: ボタン制御、イベント設定が多め。
│   │   │     ├── BlankModel.js: 空白の設定がメイン
│   │   │     └── authoring.js: オーソリングで使うメインファイル。ページレンダー系が多い
│   │   ├── browsing/ : ブラウジングモードで使うモジュール一式
│   │   │     ├── main.js: ボタン制御、イベント設定が多め。メモの設定や下線の設定などが固有の機能
│   │   │     ├── BlankModel.js: ここのBlankModelでは空白の読み込みと空白の答えあわせがメイン
│   │   │     ├── KeepUp.js: 生存確認をサーバーに送っている感じ
│   │   │     ├── note.js: ノート関連でAPIを投げている
│   │   │     ├── mark.js: 下線のレンダリングを行う
│   │   │     ├── comment.js: コメントのレンダリング。登録、更新。などなどコメント関連なら何でもやってる
│   │   │     └── browsing.js: ブラウジングモードの基本機能が入っている
│   │   ├── analytics/ : アナリティクスモードで使うモジュール一式
│   │   │     ├── note.js: 上のと変わらない。getNoteが増えたぐらい
│   │   │     ├── main.js: 他のmainと変わらない
│   │   │     ├── KeepUp.js: ヒートマップが追加。他は変わらない
│   │   │     ├── analytics.js: これもPDFのレンダリングが基本か
│   │   │     ├── BlankModel.js: 正解数を表示する機能が追加されてる
│   ├── src/ : ソース。これたぶんいらない
│   │   ├── js/ : JavaScript
│   │   │   └── entries/ : エントリーファイル群。　おそらくいらない
│   │   │       └── top.js : トップページのエントリーファイル
│   │   └── scss/ : SCSS
│   └── styles/ : CSS一式。説明はいらないでしょ
├── views/ : ビューファイル群
|   ├── index.ejs : / のトップページ
│   ├── login.ejs : ログインページ
│   ├── mode_select.ejs : モードセレクトのページ。教師用しかないので増やす必要あり
│   ├── authoring.ejs : オーソリングページ
│   ├── browsing.ejs : ブラウジングページ
│   ├── error.ejs : エラーページ
│   └── analytics.ejs : アナリティクスページ
├── README.md: これ。
├── package.json: パッケージ一式のリストが入ってる npm installで一瞬。
├── webpack.config.js : webpackの設定ファイル。結構後になりそう
├── router.js : サーバのルーティング定義
└── app.js : サーバー側のメインファイル
```

### データベースについて
1. blank : オーサリングモードで作った空白の情報を保存するテーブル
  - id : 主キー
  - url : これでどのPDFの空欄かを特定する
  - page_num : ページ番号も無いとわからない
  - rect... : あとは座標系
  - rect_text : 空欄の答えが入っている

1. blank_answer : ブラウジングモードで実際に生徒が答えた物を保存する
  - id : 主キー
  - url : これでどのPDFの空欄かを特定する
  - student_number : 学籍番号
  - page_num : これはテーブル合成で取得できそう
  - blank_id : どこの空欄を回答したか
  - answer_time : 回答した日時

1. comment : ブラウジングモードでコメントを作った時にそれを保存する
  - id : 主キー
  - url : これでどのPDFの空欄かを特定する
  - page_num : ページ番号も無いとわからない
  - あと座標諸々
  - text : 何を書いたか
  - student_number : 誰が書いたか

1. correct_answers : 回答状況を保存している。ここは回答履歴は重複せず更新されていく
  - id : 主キー
  - url : これでどのPDFの空欄かを特定する
  - page_num : これはテーブル合成で取得できそう
  - blank_id : どこの空欄を回答したか
  - answer_text : 答え
  - input_text : 回答
  - student_number : 学籍番号
  - correct_answer_status : 正解か不正解か。これは保存しなくても平気か
  - created_at : 作成日時
  - update_at : 更新日時

1. learning_action_log : 学生が何をしたか事細かに保存している
  - id : 主キー
  - url : これでどのPDFの空欄かを特定する
  - student_number : 学籍番号
  - page_num : どのページでやったかを特定するため
  - type: 何したか
  - created_at : いつしたか

1. learning_operation_log : 学生が一定時間何回操作したかを保存
  - id : 主キー
  - url : これでどのPDFの空欄かを特定する
  - student_number : 学籍番号
  - page_num : どのページでやったかを特定するため
  - key, mouseup, staytime : 記録する内容
  - created_at : 作成日時

1. mark : ブラウジングモードで下線を引いた場所を保存
  - id : 主キー
  - url : これでどのPDFの空欄かを特定する
  - student_number : 学籍番号
  - page_num : どのページでやったかを特定するため
  - あと座標系

1. notes : 何にも入っていない。廃棄か？
1. sessions : これにも何にも入っていない
1. student_page_turning : ブラウジングモードでページ変更したことを保存
  - id : 主キー  
  - url : これで どのPDFの空欄かを特定する
  - student_number : 学籍番号
  - page_num : どのページでやったかを特定するため
  - created_at : 作成日時

1. user_info : ここでユーザ情報が保存される
  id : いつもの
  name : その人の名前




## ロードマップ

![エビフライトライアングル](https://github.com/Kait-tt/Fill-in_Workbook--2018Edition-/blob/master/public/images/%E3%83%AD%E3%83%BC%E3%83%89%E3%83%9E%E3%83%83%E3%83%97%E3%82%82%E3%81%A9%E3%81%8D.jpg "サンプル")
