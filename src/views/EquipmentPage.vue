<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// カテゴリーのリスト（内部管理は英語で行う）
const categories = ['head', 'chest', 'arms', 'waist', 'legs'] as const;
type Category = typeof categories[number];

// 装備シリーズの型定義
interface ArmorSet {
  id: number;
  name: string;
  pieces: ArmorItem[];  // セットに含まれる装備一覧
  bonus?: {
    id: number;
    skill: {
      id: number;
      name: string;
    };
    ranks: {
      pieces: number;
      skill: {
        level: number;
        description: string;
      };
    }[];
  };
  gameId?: number;
}

// 装備アイテムの型定義
interface ArmorItem {
  id: number;
  name: string;
  kind: Category; // APIから返されるフィールド名
  rarity: number;
  defense?: {
    base: number;
    max: number;
  };
  slots?: number[];
  armorSet?: {
    id: number;
    name: string;
  };
}

// ローカルストレージのキー
const STORAGE_KEY_OWNED_EQUIPMENT = 'huntStyle_owned_equipment';

// 装備データ
const allEquipment = ref<ArmorItem[]>([]);

// シリーズごとの装備グループ
const equipmentBySeries = ref<Record<string, ArmorItem[]>>({});

// シリーズのリスト
const seriesList = ref<ArmorSet[]>([]);

// ユーザーの所持装備IDを保存するSet
const ownedEquipmentIds = ref<Record<Category, Set<number>>>({
  'head': new Set(),
  'chest': new Set(),
  'arms': new Set(),
  'waist': new Set(),
  'legs': new Set()
});

// ローディング状態
const isLoading = ref(true);
const loadError = ref<string | null>(null);

// 検索キーワード
const searchQuery = ref('');

// 表示のフィルター（全て、所持、未所持）
const equipmentFilter = ref('全て'); // '全て', '所持', '未所持'

// APIから装備データを取得する関数
const fetchEquipment = async () => {
  isLoading.value = true;
  loadError.value = null;

  try {
    // 装備セット一覧を取得
    const response = await fetch(`https://wilds.mhdb.io/ja/armor/sets`);

    if (!response.ok) {
      throw new Error(`装備セットデータの取得に失敗しました: ${response.statusText}`);
    }

    const armorSets: ArmorSet[] = await response.json();
    
    // シリーズのリストを保存
    seriesList.value = armorSets
      .filter(set => set.pieces && set.pieces.length > 0) // 装備が存在するセットのみを保持
      .sort((a, b) => a.id - b.id);
    
    const allArmorItems: ArmorItem[] = [];
    const groupedEquipment: Record<string, ArmorItem[]> = {};

    // セットごとの装備を処理
    for (const set of seriesList.value) {
      // セット内のすべての装備を取り出す
      const setItems: ArmorItem[] = [];
      
      for (const piece of set.pieces) {
        // 装備タイプを小文字に変換して処理
        const normalizedKind = String(piece.kind).toLowerCase();
        
        // 正規化したkindがcategoriesに含まれるかチェック
        if (categories.includes(normalizedKind as Category)) {
          // 正規化したカテゴリ値を使用
          setItems.push({
            ...piece,
            kind: normalizedKind as Category,
            armorSet: {
              id: set.id,
              name: set.name
            }
          });
        } else {
          console.warn(`不明な装備タイプがスキップされました: ${piece.id} ${piece.name} (kind: ${piece.kind})`);
        }
      }

      // 全装備リストに追加
      allArmorItems.push(...setItems);

      // セットごとにグループ化
      const seriesKey = `${set.id}`;
      groupedEquipment[seriesKey] = setItems;
    }

    // 全装備データを保存
    allEquipment.value = allArmorItems;

    // グループ化した装備を保存
    equipmentBySeries.value = groupedEquipment;

    // ローカルストレージから所持装備データを読み込む
    loadOwnedEquipment();

  } catch (error) {
    console.error('装備データの取得中にエラーが発生しました:', error);
    loadError.value = error instanceof Error ? error.message : '不明なエラーが発生しました';

    // エラー時は空の配列を設定
    allEquipment.value = [];
    equipmentBySeries.value = {};
    seriesList.value = [];
  } finally {
    isLoading.value = false;
  }
};

// ローカルストレージから所持装備データを読み込む
const loadOwnedEquipment = () => {
  // すべてのカテゴリの所持装備を一つのキーで保存
  const storedDataJson = localStorage.getItem(STORAGE_KEY_OWNED_EQUIPMENT);

  if (storedDataJson) {
    try {
      const storedData = JSON.parse(storedDataJson);

      // 各カテゴリのデータを取り出して設定
      for (const category of categories) {
        if (storedData[category] && Array.isArray(storedData[category])) {
          ownedEquipmentIds.value[category] = new Set(storedData[category]);
        } else {
          ownedEquipmentIds.value[category] = new Set();
        }
      }
    } catch (error) {
      console.error('所持装備データの読み込みに失敗しました:', error);
      // エラー時は空のセットで初期化
      for (const category of categories) {
        ownedEquipmentIds.value[category] = new Set();
      }
    }
  }
};

// ローカルストレージに所持装備データを保存
const saveOwnedEquipment = () => {
  // オブジェクトに変換してJSON形式で保存
  const dataToSave = Object.fromEntries(
    categories.map(category => [
      category,
      Array.from(ownedEquipmentIds.value[category])
    ])
  );

  localStorage.setItem(STORAGE_KEY_OWNED_EQUIPMENT, JSON.stringify(dataToSave));
};

// コンポーネントマウント時にデータを取得
onMounted(() => {
  fetchEquipment();
});

// シリーズ装備をカテゴリ別に取得する関数
const getCategoryEquipment = (seriesId: number, category: Category) => {
  const seriesKey = `${seriesId}`;
  const seriesEquipment = equipmentBySeries.value[seriesKey] || [];
  
  // 指定したカテゴリの装備のみをフィルタリング
  return seriesEquipment.find(item => {
    // 検索フィルターとカテゴリフィルターの両方を適用
    const matchesQuery = searchQuery.value === '' || item.name.includes(searchQuery.value);
    const matchesCategory = item.kind === category;
    
    // 所持状態フィルター
    let matchesFilter = true;
    if (equipmentFilter.value === '所持') {
      matchesFilter = isItemOwned(item);
    } else if (equipmentFilter.value === '未所持') {
      matchesFilter = !isItemOwned(item);
    }
    
    return matchesQuery && matchesCategory && matchesFilter;
  });
};

// シリーズの装備リスト（フィルタリング後）
const getFilteredSeriesEquipment = (seriesId: number) => {
  const seriesKey = `${seriesId}`;
  const seriesEquipment = equipmentBySeries.value[seriesKey] || [];

  return seriesEquipment.filter(item => {
    // 検索フィルター
    const matchesQuery = searchQuery.value === '' ||
      item.name.includes(searchQuery.value);

    // 所持状態フィルター
    let matchesFilter = true;
    
    if (item.kind && categories.includes(item.kind as Category)) {
      const isOwned = ownedEquipmentIds.value[item.kind].has(item.id);
      
      if (equipmentFilter.value === '所持') {
        matchesFilter = isOwned;
      } else if (equipmentFilter.value === '未所持') {
        matchesFilter = !isOwned;
      }
    }

    return matchesQuery && matchesFilter;
  });
};

// 所持状態の切り替え
const toggleObtained = (item: ArmorItem | undefined) => {
  // アイテムがundefinedの場合は処理しない
  if (!item) return;
  
  const category = item.kind;
  const itemId = item.id;

  if (ownedEquipmentIds.value[category].has(itemId)) {
    ownedEquipmentIds.value[category].delete(itemId);
  } else {
    ownedEquipmentIds.value[category].add(itemId);
  }

  // 変更をローカルストレージに保存（全カテゴリをまとめて保存）
  saveOwnedEquipment();
};

// 統計情報を計算
const statsData = computed(() => {
  const totalCount = allEquipment.value.length;

  const ownedCount = categories.reduce(
    (sum, category) => sum + ownedEquipmentIds.value[category].size,
    0
  );

  const notOwnedCount = totalCount - ownedCount;

  const completeRate = totalCount > 0
    ? Math.round((ownedCount / totalCount) * 100)
    : 0;

  return {
    total: totalCount,
    owned: ownedCount,
    notOwned: notOwnedCount,
    completeRate
  };
});

// アイテムが所持されているかどうかを確認する関数
const isItemOwned = (item: ArmorItem | undefined) => {
  // アイテムがundefinedまたは必要なプロパティがない場合は所持していないとみなす
  if (!item || !item.kind || !categories.includes(item.kind as Category) || !ownedEquipmentIds.value[item.kind]) {
    return false;
  }
  return ownedEquipmentIds.value[item.kind].has(item.id);
};

// シリーズの所持装備数を取得する関数
const getSeriesOwnedCount = (seriesId: number) => {
  const seriesKey = `${seriesId}`;
  const seriesEquipment = equipmentBySeries.value[seriesKey] || [];

  return seriesEquipment.reduce((count, item) => {
    return count + (isItemOwned(item) ? 1 : 0);
  }, 0);
};

// シリーズの装備数を取得する関数
const getSeriesItemCount = (seriesId: number) => {
  const seriesKey = `${seriesId}`;
  return equipmentBySeries.value[seriesKey]?.length || 0;
};

// カテゴリーの日本語表示名を取得する関数
const getCategoryDisplayName = (category: Category): string => {
  switch (category) {
    case 'head':
      return '頭';
    case 'chest':
      return '胴';
    case 'arms':
      return '腕';
    case 'waist':
      return '腰';
    case 'legs':
      return '脚';
    default:
      return '';
  }
};
</script>

<template>
  <div class="equipment-page">
    <h1 class="page-header">所持装備管理</h1>

    <div class="equipment-stats">
      <div class="stat-card">
        <span class="stat-title">総装備数</span>
        <span class="stat-value">{{ statsData.total }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-title">所持装備数</span>
        <span class="stat-value">{{ statsData.owned }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-title">未所持装備数</span>
        <span class="stat-value">{{ statsData.notOwned }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-title">コンプリート率</span>
        <span class="stat-value">{{ statsData.completeRate }}%</span>
      </div>
    </div>

    <div class="equipment-controls">
      <div class="search-bar">
        <input v-model="searchQuery" type="text" placeholder="装備名を検索...">
      </div>

      <div class="filter-options">
        <label>
          <input type="radio" v-model="equipmentFilter" value="全て">
          全て
        </label>
        <label>
          <input type="radio" v-model="equipmentFilter" value="所持">
          所持
        </label>
        <label>
          <input type="radio" v-model="equipmentFilter" value="未所持">
          未所持
        </label>
      </div>
    </div>

    <div v-if="isLoading" class="loading-indicator">
      <p>装備データを読み込み中...</p>
    </div>

    <div v-else-if="loadError" class="error-message">
      <p>{{ loadError }}</p>
      <p>APIからのデータ取得に失敗しました。後でもう一度お試しください。</p>
    </div>

    <div v-else>
      <!-- シリーズ一覧 -->
      <div class="series-list">
        <div v-for="series in seriesList" :key="series.id" class="series-container">
          <!-- シリーズヘッダー -->
          <div class="series-header">
            <div class="series-title">
              <h3>{{ series.name }}</h3>
            </div>
            <div class="series-info">
              <span class="owned-count">
                {{ getSeriesOwnedCount(series.id) }}/{{ getSeriesItemCount(series.id) }}
              </span>
            </div>
          </div>

          <!-- シリーズの装備一覧（カテゴリ別に1行で表示） -->
          <div class="series-equipment">
            <!-- 装備がフィルタリング条件に一致する場合のみ表示 -->
            <div v-if="getFilteredSeriesEquipment(series.id).length > 0" class="equipment-table">              
              <!-- 装備行 -->
              <div class="equipment-table-row">
                <!-- カテゴリ別の装備をv-forで生成 -->
                <div v-for="category in categories" :key="category" class="equipment-cell">
                  <div v-if="getCategoryEquipment(series.id, category)" 
                       class="equipment-cell-content"
                       :class="[`rarity-${getCategoryEquipment(series.id, category)?.rarity}`, 
                              { 'owned': isItemOwned(getCategoryEquipment(series.id, category)) }]"
                       @click="toggleObtained(getCategoryEquipment(series.id, category))">
                    <div class="tooltip-container">
                      <div class="equipment-name">
                        <span class="part-label">{{ getCategoryDisplayName(category) }}</span>
                      </div>
                      <span class="tooltip">{{ getCategoryEquipment(series.id, category)?.name }}</span>
                      <span v-if="isItemOwned(getCategoryEquipment(series.id, category))" class="owned-icon">🎁</span>
                    </div>
                  </div>
                  <div v-else class="empty-cell">
                    {{ getCategoryDisplayName(category) }}
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="no-results">
              条件に一致する装備がありません
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.equipment-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.equipment-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #42b883;
}

.equipment-controls {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-bar {
  flex: 1;
  margin-right: 20px;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filter-options {
  display: flex;
  gap: 15px;
}

.filter-options label {
  cursor: pointer;
}

/* シリーズ一覧 */
.series-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.series-container {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.series-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: background-color 0.2s;
}

.series-header:hover {
  background-color: #f0f0f0;
}

.series-title {
  display: flex;
  align-items: center;
}

.series-info {
  display: flex;
  align-items: center;
}

.owned-count {
  font-size: 0.9rem;
  color: #555;
  background-color: #f5f5f5;
  padding: 3px 8px;
  border-radius: 12px;
}

.series-equipment {
  border-top: 1px solid #eee;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 10px;
  padding: 10px;
}

.equipment-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 120px;
  background-color: #ffffff;
}

.equipment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.equipment-name {
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 8px;
  height: 2.7em;
  overflow: hidden;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  font-weight: bold;
}

.equipment-part {
  font-size: 1rem;
  color: #555;
  margin-bottom: 8px;
}

.equipment-detail {
  width: 100%;
  font-size: 0.8rem;
  color: #666;
  text-align: center;
  margin-bottom: 8px;
}

.defense-value {
  display: inline-block;
  background-color: #e8f5e9;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 4px;
}

.slots-info {
  margin-top: 4px;
}

.slot-indicator {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 50%;
  background-color: #f0f0f0;
  margin-right: 3px;
  font-size: 0.8rem;
}

.obtained-toggle {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.obtained-toggle.obtained {
  background-color: #42b883;
  color: white;
}

.obtained-toggle:not(.obtained) {
  background-color: #f5f5f5;
  color: #666;
}

/* レア度別の背景色 */
.rarity-5 {
  background-color: #e3f2fd; /* 水色 */
  border-color: #90caf9;
}

.rarity-6 {
  background-color: #1565c0; /* 青 */
  border-color: #0d47a1;
  color: white;
}

.rarity-6 .equipment-part {
  color: white;
}

.rarity-7 {
  background-color: #7b1fa2; /* 紫 */
  border-color: #4a148c;
  color: white;
}

.rarity-7 .equipment-part {
  color: white;
}

.rarity-8 {
  background-color: #ef6c00; /* オレンジ */
  border-color: #e65100;
  color: white;
}

.loading-indicator,
.error-message,
.no-results {
  padding: 20px;
  text-align: center;
}

.error-message {
  color: #d32f2f;
  background-color: #ffeeee;
  border-radius: 4px;
  margin-bottom: 20px;
}

.no-results {
  color: #666;
  font-style: italic;
}

/* 所持装備のスタイル強調 */
.equipment-item.owned {
  box-shadow: 0 0 0 2px #42b883;
}

/* テーブルスタイル */
.equipment-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* 固定幅テーブルレイアウト */
}

.equipment-table-header {
  display: table-header-group;
  background-color: #f9f9f9;
}

.equipment-table-row {
  display: table-row;
}

.equipment-cell {
  display: table-cell;
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center;
  vertical-align: middle;
  width: 20%; /* 5列なので各列20%の幅に設定 */
}

.equipment-cell-content {
  padding: 10px 5px;
  border-radius: 6px;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.equipment-cell-content:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.header-cell {
  font-weight: bold;
  background-color: #f0f0f0;
}

.empty-cell {
  color: #ccc;
}

/* カスタムツールチップ */
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip {
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  bottom: 125%; /* ツールチップを上に表示 */
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%; /* ツールチップの下に矢印を表示 */
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.tooltip-container:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

/* 部位ラベルのスタイル */
.part-label {
  font-weight: bold;
  margin-right: 4px;
}

/* 所持/未所持ボタンの幅を広げる */
.obtained-toggle {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 所持アイコンのスタイル */
.owned-icon {
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 1.2rem;
  color: #42b883;
}
</style>