import type { LayerSet } from '../model';

// JSONデータをLayerSet型として型付けして利用できるようにする
// fetchを使用して静的なJSONデータを取得する
export async function fetchLayerSets(): Promise<LayerSet[]> {
  try {
    const response = await fetch('/dummy/layerSets.json');
    if (!response.ok) {
      throw new Error('レイヤーセットの取得に失敗しました。');
    }
    const data = await response.json();
    return data as LayerSet[];
  } catch (error) {
    console.error('レイヤーセットの取得中にエラーが発生しました:', error);
    return []; // エラー時は空の配列を返す
  }
}

// 画像パスを修正する関数（ダミーデータの画像パスをpublic/imagesディレクトリのパスに変換）
export function getImagePath(imagePath: string): string {
  // images/0000.png 形式から /images/0000.png 形式に変換
  if (imagePath.startsWith('images/')) {
    return 'dummy/' + imagePath;
  }
  return imagePath;
}