# 開発

sass でコンパイルを行います。

＊compass は使用しません。

# 階層

dev (開発フォルダ)  
      |_app (開発サーバールート)  
      |_gulp (gulp フォルダ)  
      |_scss (sass ライブラリフォルダ)  
htdocs (リリースファイルフォルダ)

## scss
sass(.scss) ライブラリフォルダ

### scss/*.scss
編集可能ファイルです。  
必要に応じ編集後 @import し使用します。

### scss/libs/*.scss
編集不可ファイルです。  
@import し使用します。

## app
app フォルダ内で開発を行います。

htdocs 内ファイルは build task(default) で作成されます。

# CSSについて
app 内に .scss ファイルを作成し開発を行います。

- main file（共通 css file）  
**ui.scss**

機能別などでファイルを分割する場合は アンダーバー付ファイルを作成し ui.scss で import します。

- 個別 css  
個別 .html のみで必要な css は別途 .scss を作成します。

**コンパイル**

- server 起動と同時に watch され自動コンパイルされます
- .tmp フォルダに *.css ファイルが作成されます
- server がリンク対応するのでリンク切れにはなりません
- app フォルダ内に存在するように HTML へりんくします

# Sass setup
Sass 最新版をインストール。

## rubygem update

    sudo gem update --system

## Sass install

    sudo gem install sass


# GULP setup

## node.js 最新版を install

[node.js](https://nodejs.org/)

.pkg をダウンロードし使用する

## gulp install(update)

    sudo npm install gulp -g

## npm update

    sudo npm install npm

## project set up

    cd PATH_TO_YOUR_DEV_DIR/gulp/
    sudo npm install
    

# Task

- gulpfile.js  
メインファイルです。


- setting.js  
設定ファイルです。

以下の設定を行います。

- plugin
- directory
- port
- Browser 依存
- その他

## AUTO_PREFIX_BROWSERS(setting.js)

Browser 依存 設定を行います。


## task file

taskは（原則）機能別に **tasks** フォルダ内にファイルを作成し設定して下さい。

1. tasks フォルダ内に(xxx.js )を作成します
2. task名称接頭詞にファイル名(xxx)を使い、単語区切りはハイフン(-)を使用します
3. 実行は gulp xxx-TASK_NAME のようになります

## server

    gulp serve

server を起動し watch task を開始します。

server は local IP address + port number(setting.js) として起動します。  
http://192.168.1.XXX:NNNNN  

ファイルに変更があるとリロードします。  


## build

    gulp

htdocs フォルダへ必要ファイル(HTML, CSS)を書き出します。

.html, .css は minified 済みになります。

画像ファイル(*.jpg, *.png, *.gif, *.svg)は最適化されます。

htdocs 内から .map ファイルを削除します。

## build + server

    gulp serve:dist
    

build を行い htdocs をルートに server を起動します。
