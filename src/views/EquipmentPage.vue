<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// カテゴリーのリスト（内部管理は英語で行う）
const categories = ['head', 'chest', 'arms', 'waist', 'legs'] as const;
type Category = typeof categories[number];

const englishToJapanese: Record<Category, string> = {
  'head': '頭',
  'chest': '胴',
  'arms': '腕',
  'waist': '腰',
  'legs': '脚'
};

// 装備シリーズの型定義
interface ArmorSet {
  id: number;
  name: string;
}

// 装備アイテムの型定義
interface ArmorItem {
  id: number;
  name: string;
  kind: Category;
  rarity: number;
  defense?: number;
  slots?: number[];
  armorSet?: ArmorSet;
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
    const allArmorItems: ArmorItem[] = [];

    // 各カテゴリ(パーツ)に対してAPIリクエストを行う
    for (const category of categories) {
      // 日本語のデータを取得するため、ロケールを'ja'に設定
      const response = await fetch(`https://wilds.mhdb.io/ja/armor?type=${category}`);

      if (!response.ok) {
        throw new Error(`装備データの取得に失敗しました: ${response.statusText}`);
      }

      const data = await response.json();

      // 装備データに種類（kind）を追加して保存
      const armorItems = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        kind: category,
        rarity: item.rarity || 1,
        defense: item.defense?.base || 0,
        slots: item.slots || [],
        armorSet: item.armorSet || { id: 0, name: 'その他' }
      }));

      allArmorItems.push(...armorItems);
    }

    // 全装備データを保存
    allEquipment.value = allArmorItems;

    // シリーズごとにグループ化
    groupEquipmentBySeries();

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

// 装備データをシリーズごとにグループ化する関数
const groupEquipmentBySeries = () => {
  const groupedEquipment: Record<string, ArmorItem[]> = {};
  const uniqueSeries = new Map<number, ArmorSet>();

  // シリーズごとにグループ化
  for (const item of allEquipment.value) {
    const seriesId = item.armorSet?.id || 0;
    const seriesName = item.armorSet?.name || 'その他';

    // シリーズIDをキーにして装備をグループ化
    const seriesKey = `${seriesId}`;
    if (!groupedEquipment[seriesKey]) {
      groupedEquipment[seriesKey] = [];

      // ユニークなシリーズのリストも作成
      if (!uniqueSeries.has(seriesId)) {
        uniqueSeries.set(seriesId, { id: seriesId, name: seriesName });
      }
    }

    groupedEquipment[seriesKey].push(item);
  }

  // 結果を保存
  equipmentBySeries.value = groupedEquipment;

  // シリーズのリストを作成（IDでソート）
  seriesList.value = Array.from(uniqueSeries.values())
    .sort((a, b) => a.id - b.id);
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
    const isOwned = ownedEquipmentIds.value[item.kind].has(item.id);

    if (equipmentFilter.value === '所持') {
      matchesFilter = isOwned;
    } else if (equipmentFilter.value === '未所持') {
      matchesFilter = !isOwned;
    }

    return matchesQuery && matchesFilter;
  });
};

// 所持状態の切り替え
const toggleObtained = (item: ArmorItem) => {
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

// 装備カテゴリの日本語名を取得する
const getJapaneseCategoryName = (englishCategory: Category) => {
  return englishToJapanese[englishCategory];
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
const isItemOwned = (item: ArmorItem) => {
  return ownedEquipmentIds.value[item.kind]?.has(item.id) || false;
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
          </div>

          <!-- シリーズの装備一覧（常に表示） -->
          <div class="series-equipment">
            <div class="equipment-grid">
              <div v-for="item in getFilteredSeriesEquipment(series.id)" :key="item.id" 
                   class="equipment-item"
                   :class="[`rarity-${item.rarity}`, { 'owned': isItemOwned(item) }]"
                   @click="toggleObtained(item)"
                   :title="item.name">
                <div class="equipment-part">{{ getJapaneseCategoryName(item.kind) }}</div>
                <div v-if="isItemOwned(item)" class="owned-icon">🎁</div>
              </div>
              <div v-if="getFilteredSeriesEquipment(series.id).length === 0" class="no-results">
                条件に一致する装備がありません
              </div>
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

.back-btn {
  padding: 8px 15px;
  background-color: #f1f1f1;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
}

.back-btn:hover {
  background-color: #e0e0e0;
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

.series-header.expanded {
  background-color: #e8f5e9;
}

.series-title {
  display: flex;
  align-items: center;
}

.expand-icon {
  margin-right: 10px;
  font-size: 0.8em;
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
  justify-content: center;
  padding: 15px 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 60px;
}

.equipment-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.equipment-part {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.owned-icon {
  position: absolute;
  bottom: 5px;
  right: 5px;
  font-size: 1rem;
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

.rarity-8 .equipment-part {
  color: white;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  font-weight: bold;
  background-color: #f9f9f9;
}

.rarity-cell {
  color: #ff9800;
}

.obtained-toggle {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.obtained-toggle.obtained {
  background-color: #ddffdd;
  color: #388e3c;
}

.obtained-toggle:not(.obtained) {
  background-color: #ffdddd;
  color: #d32f2f;
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
</style>