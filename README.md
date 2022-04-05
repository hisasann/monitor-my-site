# monitor-my-site

自分のサイトが落ちていないかを確認するチェッカーです。

最終的に結果を Slack 通知するようにしています。

`https://hisasann.dev/` が `https://www.hisasann.dev/` にリダイレクトさせるようになってるようで、 **308** が返ってきた。

ので、それも考慮した。

## local 開発

一般的な開発。

firebase config を使っているので、 こちらは常に実行しておく必要がある。

```bash
yarn serve
```

スケジューラーの開発の場合は、以下のように登録したファンクションを追加で実行します。

```bash
yarn shell
firebase> scheduledFunction()
```

## lint

lint が通らないとデプロイも通らないので、 error がなくなるようにしておく。

```bash
yarn lint:fix
```

## 本番 deploy

```bash
yarn deploy
```
