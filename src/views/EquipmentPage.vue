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
const activeCategory = ref<Category>('head');

// 装備データ（カテゴリーのみをキーにできるように型定義）
const equipment = ref<Record<Category, Array<any>>>({
  'head': [],
  'chest': [],
  'arms': [],
  'waist': [],
  'legs': []
});

// ユーザーの所持装備IDを保存するSet（カテゴリーのみをキーにできるように型定義）
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
    // 各カテゴリ(パーツ)に対してAPIリクエストを行う
    for (const category of categories) {
      // 日本語のデータを取得するため、ロケールを'ja'に設定
      const response = await fetch(`https://wilds.mhdb.io/ja/armor?type=${category}`);
      
      if (!response.ok) {
        throw new Error(`装備データの取得に失敗しました: ${response.statusText}`);
      }
      
      const data = await response.json();
      equipment.value[category] = data.map((item: any) => ({
        id: item.id,
        name: item.name, // APIから取得した日本語名
        rarity: item.rarity || 1,
        defense: item.defense?.base || 0,
        slots: item.slots || []
      }));
    }
    
    // ローカルストレージから所持装備データを読み込む
    loadOwnedEquipment();
    
  } catch (error) {
    console.error('装備データの取得中にエラーが発生しました:', error);
    loadError.value = error instanceof Error ? error.message : '不明なエラーが発生しました';
    
    // エラー時は空の配列を設定
    for (const category of categories) {
      equipment.value[category] = [];
    }
  } finally {
    isLoading.value = false;
  }
};

// ローカルストレージから所持装備データを読み込む
const loadOwnedEquipment = () => {
  // すべてのカテゴリの所持装備を一つのキーで保存
  const storageKey = 'huntStyle_owned_equipment';
  const storedDataJson = localStorage.getItem(storageKey);
  
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
  const storageKey = 'huntStyle_owned_equipment';
  
  // オブジェクトに変換してJSON形式で保存
  const dataToSave = Object.fromEntries(
    categories.map(category => [
      category, 
      Array.from(ownedEquipmentIds.value[category])
    ])
  );
  
  localStorage.setItem(storageKey, JSON.stringify(dataToSave));
};

// コンポーネントマウント時にデータを取得
onMounted(() => {
  fetchEquipment();
});

// フィルター後の装備リスト
const filteredEquipment = computed(() => {
  return equipment.value[activeCategory.value].filter(item => {
    // 検索フィルター
    const matchesQuery = searchQuery.value === '' || 
      item.name.includes(searchQuery.value);
    
    // 所持状態フィルター
    let matchesFilter = true;
    const isOwned = ownedEquipmentIds.value[activeCategory.value].has(item.id);
    
    if (equipmentFilter.value === '所持') {
      matchesFilter = isOwned;
    } else if (equipmentFilter.value === '未所持') {
      matchesFilter = !isOwned;
    }
    
    return matchesQuery && matchesFilter;
  });
});

// 所持状態の切り替え
const toggleObtained = (item: any) => {
  const category = activeCategory.value;
  const itemId = item.id;
  
  if (ownedEquipmentIds.value[category].has(itemId)) {
    ownedEquipmentIds.value[category].delete(itemId);
  } else {
    ownedEquipmentIds.value[category].add(itemId);
  }
  
  // 変更をローカルストレージに保存（全カテゴリをまとめて保存）
  saveOwnedEquipment();
};

// 表示用のカテゴリー名（日本語）を取得する
const getJapaneseCategoryName = (englishCategory: Category) => {
  return englishToJapanese[englishCategory];
};

// 統計情報を計算
const statsData = computed(() => {
  const totalCount = categories.reduce(
    (sum, category) => sum + equipment.value[category].length,
    0
  );
  
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
</script>

<template>
    <div class="equipment-page">
        <div class="page-header">
            <h1>所持装備管理</h1>
            <router-link to="/" class="back-btn">ホームに戻る</router-link>
        </div>

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

        <div class="category-tabs">
            <button v-for="category in categories" :key="category" @click="activeCategory = category"
                class="category-tab" :class="{ 'active': activeCategory === category }">
                {{ getJapaneseCategoryName(category) }}
            </button>
        </div>

        <div v-if="isLoading" class="loading-indicator">
            <p>装備データを読み込み中...</p>
        </div>

        <div v-else-if="loadError" class="error-message">
            <p>{{ loadError }}</p>
            <p>APIからのデータ取得に失敗しました。後でもう一度お試しください。</p>
        </div>

        <div v-else class="equipment-list">
            <table>
                <thead>
                    <tr>
                        <th>名前</th>
                        <th>レア度</th>
                        <th>所持</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in filteredEquipment" :key="item.id">
                        <td>{{ item.name }}</td>
                        <td class="rarity-cell">★{{ item.rarity }}</td>
                        <td>
                            <button @click="toggleObtained(item)" class="obtained-toggle"
                                :class="{ 'obtained': ownedEquipmentIds[activeCategory].has(item.id) }">
                                {{ ownedEquipmentIds[activeCategory].has(item.id) ? '所持済み' : '未所持' }}
                            </button>
                        </td>
                    </tr>
                    <tr v-if="filteredEquipment.length === 0">
                        <td colspan="3" class="no-results">条件に一致する装備がありません</td>
                    </tr>
                </tbody>
            </table>
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

.category-tabs {
    display: flex;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
}

.category-tab {
    padding: 10px 20px;
    background: none;
    border: none;
    font-weight: bold;
    cursor: pointer;
    position: relative;
}

.category-tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: #42b883;
}

.equipment-list {
    margin-bottom: 30px;
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