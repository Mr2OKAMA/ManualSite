# ManualSite

JSON データを使って manual を検索・管理できるテスト用ポータルです。

## 起動方法

任意の静的ファイルサーバーで起動できます。例:

```bash
cd /home/runner/work/ManualSite/ManualSite
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開いてください。

## 使い方

- 上部の検索ボックスで manual をキーワード検索できます
- フォームから manual を新規追加できます
- 一覧の「編集」で既存 manual をフォームに読み込み、更新できます
- 一覧の「削除」で manual を削除できます
- 一覧の「開く」で設定済み SharePoint URL を新しいタブで開けます

## データについて

- 初期データは `manuals.json` に保存しています
- 追加/編集/削除の結果はブラウザ `localStorage` に保存されます（テスト用の擬似永続化）
