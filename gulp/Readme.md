# 開発

## dev
dev フォルダ内で開発を行います。

htdocs 内ファイルは build task 実行時に作成されます。


### 画像パスについて

### .png

HTML, CSS 画像パスは「ルート相対」で記述します。

Base64 Encode 対象です。

### .jpg

HTML, CSS 画像パスは「相対」で記述します。

Base64 Encode 対象外です。

### CSSについて

個別対応が必要な場合は アンダーバー付ファイルを作成し ui.scss で import します。

* 作成 css ファイルは 1ファイル です

# GULP Task Runner

## node.js 最新版を install

[node.js](https://nodejs.org/)

.pkg をダウンロードし使用する

## install

    sudo npm install gulp -g

## npm update

    sudo npm install npm

## project set up

    cd PATH_TO_YOUR_DEV_DIR/_gulp/
    sudo npm install

## task file

taskは（原則）機能別にtasksフォルダ内にファイルを作成し設定して下さい。

1. tasks フォルダ内に(xxx.js )を作成します
2. task名称接頭詞にファイル名(xxx)を使い、単語区切りはハイフン(-)を使用します
3. 実行時は gulp xxx-TASK_NAME のようになります

## default(watch)

    gulp

あるいは

    gulp css-watch

watch task を開始します。

.scss を .css へ source map 付でコンパイルし htdocs 内に書き出します。

## build

    gulp build

htdocs フォルダへ必要ファイル(HTML, CSS)を書き出します。

.html, .css は minified 済みになります。

PNG ファイルは Base64 Encoding され inline 画像になるので書き出されません。

