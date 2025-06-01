# プロンプト集

## ダミーデータ生成

```
#file:dummy フォルダに投稿データのダミーデータを1つjsonファイルで出力してください。
Jsonファイルは #sym:LayerSet の配列で93個のダミーデータを含みます。
#sym:name  #sym:description  #sym:tags #sym:createdAt には適当なデータを入れてください。
#sym:armers には #sym:Category 全ての種類の装備が1種類ずつ格納され必ず5つになります。
#sym:id には https://wilds.mhdb.io/ja/armor から取得されるidが入ります。
#sym:images には #file:images から連番で1枚だけ画像の相対パスを入れてください。
#sym:color0  #sym:color1 にはHEXフォーマットのカラーコードを入れてください。
```