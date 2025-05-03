<script setup lang="ts">
import { ref, computed } from 'vue';

// カテゴリーのリスト
const categories = ['頭', '胴', '腕', '腰', '脚'];
const activeCategory = ref('頭');

// 所持装備のモックデータ
const ownedEquipment = ref({
  '頭': [
    { id: 1, name: '雪風ヘルム', rarity: 8, obtained: true },
    { id: 2, name: '炎神の兜', rarity: 9, obtained: true },
    { id: 3, name: '雷獣の冠', rarity: 7, obtained: false },
    { id: 4, name: 'ドラゴンヘッド', rarity: 10, obtained: false },
    { id: 5, name: '古龍のマスク', rarity: 8, obtained: true }
  ],
  '胴': [
    { id: 6, name: '氷結マント', rarity: 9, obtained: true },
    { id: 7, name: '炎の鎧', rarity: 8, obtained: true },
    { id: 8, name: '雷神の胴', rarity: 9, obtained: false },
    { id: 9, name: 'ドラゴンメイル', rarity: 10, obtained: false }
  ],
  '腕': [
    { id: 10, name: '霧氷の篭手', rarity: 8, obtained: true },
    { id: 11, name: '炎の腕甲', rarity: 7, obtained: true },
    { id: 12, name: '雷光のグローブ', rarity: 8, obtained: false },
    { id: 13, name: 'ドラゴンクロー', rarity: 9, obtained: false }
  ],
  '腰': [
    { id: 14, name: '雪山のベルト', rarity: 7, obtained: true },
    { id: 15, name: '炎の腰帯', rarity: 8, obtained: false },
    { id: 16, name: '雷の帯', rarity: 9, obtained: false },
    { id: 17, name: 'ドラゴンコイル', rarity: 10, obtained: false }
  ],
  '脚': [
    { id: 18, name: 'フロストグリーヴ', rarity: 9, obtained: true },
    { id: 19, name: '炎の脚', rarity: 8, obtained: true },
    { id: 20, name: '雷獣の足', rarity: 7, obtained: false },
    { id: 21, name: 'ドラゴンフィート', rarity: 10, obtained: false }
  ]
});

// 検索キーワード
const searchQuery = ref('');

// 表示のフィルター（全て、所持、未所持）
const equipmentFilter = ref('全て'); // '全て', '所持', '未所持'

// フィルター後の装備リスト
const filteredEquipment = computed(() => {
  return ownedEquipment.value[activeCategory.value].filter(item => {
    // 検索フィルター
    const matchesQuery = searchQuery.value === '' || item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // 所持状態フィルター
    let matchesFilter = true;
    if (equipmentFilter.value === '所持') {
      matchesFilter = item.obtained;
    } else if (equipmentFilter.value === '未所持') {
      matchesFilter = !item.obtained;
    }
    
    return matchesQuery && matchesFilter;
  });
});

// 所持状態の切り替え
const toggleObtained = (item: any) => {
  item.obtained = !item.obtained;
};

// 新しい装備の追加（モック）
const newEquipmentName = ref('');
const newEquipmentRarity = ref<number>(7);

const addNewEquipment = () => {
  if (newEquipmentName.value.trim() !== '') {
    const newId = Math.max(...ownedEquipment.value[activeCategory.value].map(item => item.id)) + 1;
    
    ownedEquipment.value[activeCategory.value].push({
      id: newId,
      name: newEquipmentName.value,
      rarity: newEquipmentRarity.value,
      obtained: true
    });
    
    newEquipmentName.value = '';
    newEquipmentRarity.value = 7;
  }
};
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
        <span class="stat-value">{{ Object.values(ownedEquipment).flat().length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-title">所持装備数</span>
        <span class="stat-value">{{ Object.values(ownedEquipment).flat().filter(item => item.obtained).length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-title">未所持装備数</span>
        <span class="stat-value">{{ Object.values(ownedEquipment).flat().filter(item => !item.obtained).length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-title">コンプリート率</span>
        <span class="stat-value">
          {{ Math.round((Object.values(ownedEquipment).flat().filter(item => item.obtained).length / Object.values(ownedEquipment).flat().length) * 100) }}%
        </span>
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
      <button 
        v-for="category in categories" 
        :key="category"
        @click="activeCategory = category"
        class="category-tab"
        :class="{ 'active': activeCategory === category }">
        {{ category }}
      </button>
    </div>

    <div class="equipment-list">
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
              <button 
                @click="toggleObtained(item)" 
                class="obtained-toggle" 
                :class="{ 'obtained': item.obtained }">
                {{ item.obtained ? '所持済み' : '未所持' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="add-equipment">
      <h3>新しい装備を追加</h3>
      <div class="add-form">
        <input 
          v-model="newEquipmentName" 
          type="text" 
          placeholder="装備名を入力..."
          class="add-input">
        <div class="rarity-select">
          <label>レア度:</label>
          <select v-model.number="newEquipmentRarity">
            <option v-for="i in 10" :key="i" :value="i">{{ i }}</option>
          </select>
        </div>
        <button @click="addNewEquipment" class="add-btn">追加</button>
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

th, td {
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

.add-equipment {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
}

.add-form {
  display: flex;
  gap: 10px;
  align-items: center;
}

.add-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.rarity-select {
  display: flex;
  align-items: center;
  gap: 5px;
}

.rarity-select select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-btn {
  padding: 8px 15px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-btn:hover {
  background-color: #3ba676;
}
</style>