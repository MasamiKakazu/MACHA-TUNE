![MACHA-TUNE — 新しい「好きな曲」と出会う。音楽タイプ診断とおすすめ曲のシェアアプリ](./docs/images/macha-tune-banner.png)

# MACHA-TUNE
音楽タイプ診断とおすすめ曲のシェアアプリのリポジトリです

公開用のビルドでは `MACHA_TUNE_PUBLIC_URL` にアプリの公開URLを設定してください。診断結果と楽曲発見の共有ページが、このURLを使って絶対URLのOGP画像を初期HTMLに出力します。サブパスで公開する場合は、同じパスを Vite の `--base` にも指定してください。

`npm run dev` と `npm run preview` では、同一オリジンのカタログ経路から検索と録音IDの照合を行います。静的ホスティングでその経路がない場合は、ブラウザーからAppleのAPIに接続します。
