import fs from 'node:fs';
import path from 'node:path';

// モデルの型定義を直接コピー
const categories = ["head", "chest", "arms", "waist", "legs"] as const;
type Category = (typeof categories)[number];
const genders = ["m", "w"] as const;
type Gender = (typeof genders)[number];

interface Armer {
  id: string;
  type: Category;
  gender: Gender;
  color0: string;
  color1: string;
}

interface LayerSet {
  id: string;
  name: string;
  armers: Armer[];
  description: string;
  images: string[];
  tags: string[];
  createdAt: string;
}

// 装備品のIDを仮想的に生成するための関数（実際のAPIから取得する場合は、この関数を変更する）
// 削除：この関数は不要になりました

// ランダムな名前を生成
function generateRandomName(): string {
  const prefixes = ['炎龍の', '氷霜の', '雷神の', '岩砕の', '風切りの', '黒鉄の', '星屑の', 
                    '古代の', '蒼穹の', '猛毒の', '灼熱の', '凍結の', '雷鳴の', '大地の', 
                    '嵐風の', '混沌の', '神秘の', '金剛の', '霧氷の', '爆炎の'];
  
  const suffixes = ['装束', '鎧', '重装', 'アーマー', 'スーツ', '防具', 'メイル', 'ガード', 
                    'プレート', 'バインド', 'コート', 'ローブ', 'ガーブ', 'ウェア', 'クロス'];
  
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${randomPrefix}${randomSuffix}`;
}

// ランダムな説明文を生成
function generateRandomDescription(): string {
  const introductions = [
    'この重ね着は、',
    '伝説のハンターが愛用した、',
    '新大陸で発見された素材から作られた、',
    '古代文明の技術を応用した、',
    '長い年月をかけて改良された、',
    '熟練の鍛冶師が作り上げた、'
  ];
  
  const features = [
    '優れた防御力と機動性を兼ね備えた装備です。',
    '独特の輝きを放つ美しい装備セットです。',
    '過酷な環境でも快適に使用できる実用的な防具です。',
    '高いスキル発動率が特徴の上級者向け装備です。',
    '見た目の美しさと機能性を両立させた傑作と言えます。',
    '特殊な素材を使用することで驚異的な耐性を実現しました。'
  ];
  
  const usages = [
    '氷雪地帯での狩猟に最適です。',
    '火山地帯での高温にも耐えられます。',
    '水中での活動をサポートします。',
    '雷属性モンスターとの戦闘で真価を発揮します。',
    'あらゆる環境で安定したパフォーマンスを発揮します。',
    '長時間の狩猟でも疲労を軽減する効果があります。'
  ];
  
  const randomIntro = introductions[Math.floor(Math.random() * introductions.length)];
  const randomFeature = features[Math.floor(Math.random() * features.length)];
  const randomUsage = usages[Math.floor(Math.random() * usages.length)];
  
  return `${randomIntro}${randomFeature} ${randomUsage}`;
}

// ランダムなタグを生成
function generateRandomTags(): string[] {
  const allTags = [
    'かっこいい', 'かわいい', 'エレガント', 'ゴージャス', 'シンプル', 'クール',
    '重装', '軽装', '実用的', 'レア', '限定', 'イベント',
    '火属性', '水属性', '雷属性', '氷属性', '龍属性',
    '古龍', 'モンスター', '英雄', '伝説', '神秘', '秘伝',
    '剣士用', 'ガンナー用', '男性用', '女性用', 'ユニセックス',
    '初心者向け', '上級者向け', 'バランス型', '攻撃特化', '防御特化'
  ];
  
  // 3〜5個のタグをランダムに選択
  const tagCount = Math.floor(Math.random() * 3) + 3; // 3〜5個
  const selectedTags: string[] = [];
  
  for (let i = 0; i < tagCount; i++) {
    const randomTagIndex = Math.floor(Math.random() * allTags.length);
    const tag = allTags[randomTagIndex];
    
    // 重複を避ける
    if (!selectedTags.includes(tag)) {
      selectedTags.push(tag);
    }
  }
  
  return selectedTags;
}

// ランダムな日付を生成（過去2年以内）
function generateRandomDate(): string {
  const now = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(now.getFullYear() - 2);
  
  const randomTimestamp = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime());
  const randomDate = new Date(randomTimestamp);
  
  return randomDate.toISOString();
}

// ランダムなカラーコード（HEX形式）を生成
function generateRandomColorHex(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  
  return color;
}

// APIから装備データを取得する関数
async function fetchArmorData(): Promise<Record<Category, string[]>> {
  console.log('APIから装備データを取得しています...');
  
  try {
    // 装備セットの一覧を取得
    const response = await fetch('https://wilds.mhdb.io/ja/armor/sets');
    
    if (!response.ok) {
      throw new Error(`装備セットデータの取得に失敗しました: ${response.statusText}`);
    }
    
    // API レスポンスを解析
    const armorSets = await response.json();
    
    // 各カテゴリごとの装備IDを格納するオブジェクト
    const armorIdsByCategory: Record<Category, string[]> = {
      head: [],
      chest: [],
      arms: [],
      waist: [],
      legs: []
    };
    
    // 最小レアリティ値（この値未満の装備は除外）
    const MIN_RARITY = 5;
    
    // 装備セットからカテゴリごとに装備IDを抽出
    for (const set of armorSets) {
      if (set.pieces && set.pieces.length > 0) {
        for (const piece of set.pieces) {
          // 装備タイプを小文字に変換
          const normalizedKind = String(piece.kind).toLowerCase();
          
          // 正規化したkindがcategoriesに含まれるかチェック
          if (categories.includes(normalizedKind as Category)) {
            // レアリティフィルタリング
            if (piece.rarity >= MIN_RARITY) {
              // IDを適切な形式で取得（APIの返すIDはslug形式と想定）
              const armorId = piece.id.toString();
              armorIdsByCategory[normalizedKind as Category].push(armorId);
            }
          }
        }
      }
    }
    
    // 各カテゴリに少なくとも10個のIDがあることを確認（なければ警告を表示）
    for (const category of categories) {
      if (armorIdsByCategory[category].length < 10) {
        console.warn(`警告: ${category}カテゴリの装備が10個未満です（${armorIdsByCategory[category].length}個）`);
      }
    }
    
    console.log('装備データの取得が完了しました');
    return armorIdsByCategory;
  } catch (error) {
    console.error('装備データの取得中にエラーが発生しました:', error);
    
    // エラー時はダミーデータを返す
    return {
      head: [
        "blood-malice-helm",
        "demon-conqueror-helm",
        "kamura-head-scarf",
        "leather-headgear",
        "alloy-helm"
      ],
      chest: [
        "blood-malice-mail",
        "demon-conqueror-mail",
        "kamura-garb",
        "leather-vest",
        "alloy-mail"
      ],
      arms: [
        "blood-malice-braces",
        "demon-conqueror-braces",
        "kamura-braces",
        "leather-gloves",
        "alloy-vambraces"
      ],
      waist: [
        "blood-malice-tassets",
        "demon-conqueror-tassets",
        "kamura-tasset",
        "leather-belt",
        "alloy-coil"
      ],
      legs: [
        "blood-malice-greaves",
        "demon-conqueror-greaves",
        "kamura-leggings",
        "leather-pants",
        "alloy-greaves"
      ]
    };
  }
}

// 実際のアーマーID（この変数は後で初期化されます）
let realArmorIds: Record<Category, string[]>;

// Armerオブジェクトを生成
function generateArmer(armorIds: Record<Category, string[]>): Armer[] {
  return categories.map((category) => {
    // 性別をランダムに選択（"m" または "w"）
    const gender: Gender = Math.random() > 0.5 ? "m" : "w";
    
    // 各カテゴリからランダムにアーマーIDを選択
    const idList = armorIds[category];
    const randomIdIndex = Math.floor(Math.random() * idList.length);
    
    return {
      id: idList[randomIdIndex],
      type: category,
      gender: gender,
      color0: generateRandomColorHex(),
      color1: generateRandomColorHex()
    };
  });
}

// 画像パスを生成（相対パスに修正）
function generateImagePath(index: number): string[] {
  // インデックスを0-99の範囲に制限
  const imageIndex = index % 100;
  // ゼロパディングして4桁の文字列に変換（0000〜0099）
  const paddedIndex = String(imageIndex).padStart(4, '0');
  return [`dummy/images/${paddedIndex}.png`]; // ダミーデータのパスからの相対パス
}

// LayerSetオブジェクトを生成
function generateLayerSet(index: number, armorIds: Record<Category, string[]>): LayerSet {
  return {
    id: `${index}`, // 数値のみの文字列
    name: generateRandomName(),
    armers: generateArmer(armorIds),
    description: generateRandomDescription(),
    images: generateImagePath(index),
    tags: generateRandomTags(),
    createdAt: generateRandomDate()
  };
}

// メイン関数：ダミーデータを生成して保存
async function generateDummyData(count: number): Promise<void> {
  console.log('ダミーデータの生成を開始します...');
  
  // APIから装備データを取得
  const armorIds = await fetchArmorData();
  
  const dummyData: LayerSet[] = [];
  
  for (let i = 0; i < count; i++) {
    dummyData.push(generateLayerSet(i, armorIds));
  }
  
  // JSONファイルに保存
  fs.writeFileSync(
    path.join(process.cwd(), 'public/dummy', 'layerSets.json'),
    JSON.stringify(dummyData, null, 2)
  );
  
  console.log(`${count}個のダミーデータを生成し、public/dummy/layerSets.jsonに保存しました。`);
}

// 100個のダミーデータを生成（プロンプトに従って数を変更）
generateDummyData(100).catch(error => {
  console.error('ダミーデータ生成中にエラーが発生しました:', error);
  process.exit(1);
});
