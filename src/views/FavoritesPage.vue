<script setup lang="ts">
import { ref, computed } from 'vue';

// モックデータ - お気に入りに登録された投稿
const favorites = ref([
  {
    id: 1,
    title: '氷の女王風コーデ',
    image: 'https://via.placeholder.com/300x300?text=Ice+Queen',
    user: 'ハンター1号',
    likes: 120,
    collection: '氷属性装備'
  },
  {
    id: 2,
    title: '炎のバーサーカースタイル',
    image: 'https://via.placeholder.com/300x300?text=Fire+Style',
    user: '装備マニア',
    likes: 85,
    collection: '炎属性装備'
  },
  {
    id: 3,
    title: '雷神コーデ',
    image: 'https://via.placeholder.com/300x300?text=Thunder+God',
    user: '重ね着ハンター',
    likes: 210,
    collection: '雷属性装備'
  },
  {
    id: 4,
    title: '古龍風の装備',
    image: 'https://via.placeholder.com/300x300?text=Elder+Dragon',
    user: 'ハンター1号',
    likes: 156,
    collection: 'かっこいい装備'
  },
  {
    id: 5,
    title: '雪山探索スタイル',
    image: 'https://via.placeholder.com/300x300?text=Snow+Mountain',
    user: '装備収集家',
    likes: 78,
    collection: '氷属性装備'
  }
]);

// コレクション一覧
const collections = ref(['すべて', '氷属性装備', '炎属性装備', '雷属性装備', 'かっこいい装備']);
const activeCollection = ref('すべて');

// フィルター適用後のお気に入り
const filteredFavorites = computed(() => {
  if (activeCollection.value === 'すべて') {
    return favorites.value;
  }
  return favorites.value.filter(item => item.collection === activeCollection.value);
});

// 新しいコレクションの追加
const newCollectionName = ref('');
const addNewCollection = () => {
  if (newCollectionName.value.trim() !== '' && !collections.value.includes(newCollectionName.value)) {
    collections.value.push(newCollectionName.value);
    newCollectionName.value = '';
  }
};

// お気に入りの削除
const removeFavorite = (id: number) => {
  const index = favorites.value.findIndex(item => item.id === id);
  if (index !== -1) {
    favorites.value.splice(index, 1);
  }
};

// コレクションの変更
const changeCollection = (favorite: any, collection: string) => {
  favorite.collection = collection;
};
</script>

<template>
  <div class="favorites-page">
    <div class="page-header">
      <h1>お気に入りコレクション</h1>
      <router-link to="/" class="back-btn">ホームに戻る</router-link>
    </div>

    <div class="collections-section">
      <h2>コレクション</h2>
      <div class="collection-tabs">
        <button 
          v-for="collection in collections" 
          :key="collection"
          @click="activeCollection = collection"
          class="collection-tab"
          :class="{ 'active': activeCollection === collection }">
          {{ collection }}
        </button>
      </div>

      <div class="add-collection">
        <input 
          v-model="newCollectionName" 
          type="text" 
          placeholder="新しいコレクション名...">
        <button @click="addNewCollection" class="add-btn">追加</button>
      </div>
    </div>

    <div class="favorites-list">
      <div v-for="favorite in filteredFavorites" :key="favorite.id" class="favorite-card">
        <div class="favorite-image">
          <router-link :to="`/post/${favorite.id}`">
            <img :src="favorite.image" :alt="favorite.title">
          </router-link>
          <button @click="removeFavorite(favorite.id)" class="remove-btn">×</button>
        </div>
        
        <div class="favorite-info">
          <h3>{{ favorite.title }}</h3>
          <p>投稿者: {{ favorite.user }}</p>
          <p>♥ {{ favorite.likes }}</p>
          
          <div class="collection-select">
            <label>コレクション:</label>
            <select 
              v-model="favorite.collection"
              @change="changeCollection(favorite, $event.target.value)">
              <option 
                v-for="collection in collections.filter(c => c !== 'すべて')" 
                :key="collection"
                :value="collection">
                {{ collection }}
              </option>
            </select>
          </div>
        </div>
      </div>
      
      <div v-if="filteredFavorites.length === 0" class="no-favorites">
        <p>このコレクションにはまだ何も保存されていません。</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.favorites-page {
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

.collections-section {
  margin-bottom: 30px;
}

.collection-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.collection-tab {
  padding: 8px 15px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.collection-tab.active {
  background-color: #42b883;
  color: white;
  border-color: #42b883;
}

.add-collection {
  display: flex;
  margin-top: 15px;
}

.add-collection input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
}

.add-btn {
  padding: 8px 15px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.favorites-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.favorite-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.favorite-image {
  position: relative;
}

.favorite-image img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.favorite-info {
  padding: 15px;
}

.favorite-info h3 {
  margin-bottom: 5px;
}

.collection-select {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.collection-select select {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.no-favorites {
  grid-column: 1 / -1;
  text-align: center;
  padding: 30px;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>