<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// モックデータ - お気に入りに登録された投稿
const favorites = ref([
  {
    id: 1,
    title: '氷の女王風コーデ',
    image: 'https://via.placeholder.com/300x300?text=Ice+Queen',
    user: {
      id: 'hunter1',
      name: 'ハンター1号',
      avatar: 'https://via.placeholder.com/40x40?text=User1'
    },
    likes: 120,
    collection: '氷属性装備',
    tags: ['氷属性', '女王', 'エレガント']
  },
  {
    id: 2,
    title: '炎のバーサーカースタイル',
    image: 'https://via.placeholder.com/300x300?text=Fire+Style',
    user: {
      id: 'hunter2',
      name: '装備マニア',
      avatar: 'https://via.placeholder.com/40x40?text=User2'
    },
    likes: 85,
    collection: '炎属性装備',
    tags: ['火属性', 'バーサーカー', '力強い']
  },
  {
    id: 3,
    title: '雷神コーデ',
    image: 'https://via.placeholder.com/300x300?text=Thunder+God',
    user: {
      id: 'hunter3',
      name: '重ね着ハンター',
      avatar: 'https://via.placeholder.com/40x40?text=User3'
    },
    likes: 210,
    collection: '雷属性装備',
    tags: ['雷属性', '神々しい', 'カッコいい']
  },
  {
    id: 4,
    title: '古龍風の装備',
    image: 'https://via.placeholder.com/300x300?text=Elder+Dragon',
    user: {
      id: 'hunter1',
      name: 'ハンター1号',
      avatar: 'https://via.placeholder.com/40x40?text=User1'
    },
    likes: 156,
    collection: 'かっこいい装備',
    tags: ['古龍', '重装', 'カッコいい']
  },
  {
    id: 5,
    title: '雪山探索スタイル',
    image: 'https://via.placeholder.com/300x300?text=Snow+Mountain',
    user: {
      id: 'hunter4',
      name: '装備収集家',
      avatar: 'https://via.placeholder.com/40x40?text=User4'
    },
    likes: 78,
    collection: '氷属性装備',
    tags: ['雪山', '実用的', '防寒']
  }
]);

// コレクション一覧
const collections = ref(['すべて', '氷属性装備', '炎属性装備', '雷属性装備', 'かっこいい装備']);
const activeCollection = ref('すべて');

// 表示・アニメーション用の状態
const isLoaded = ref(false);
const showNewCollectionForm = ref(false);
const editMode = ref(false);

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
    showNewCollectionForm.value = false;
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

// コレクション編集モードの切り替え
const toggleEditMode = () => {
  editMode.value = !editMode.value;
};

// コレクションの削除 (すべて以外)
const removeCollection = (collection: string) => {
  if (collection !== 'すべて') {
    // コレクションの削除
    const index = collections.value.findIndex(c => c === collection);
    if (index !== -1) {
      collections.value.splice(index, 1);
    }
    
    // そのコレクションにある投稿をすべてに移動
    favorites.value.forEach(favorite => {
      if (favorite.collection === collection) {
        favorite.collection = 'すべて';
      }
    });
    
    // アクティブコレクションを「すべて」に変更
    if (activeCollection.value === collection) {
      activeCollection.value = 'すべて';
    }
  }
};

// アニメーション
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true;
  }, 300);
});
</script>

<template>
  <div class="max-w-[1000px] mx-auto pt-[70px] lg:pt-0 px-16">
    <!-- ヘッダーセクション -->
    <div class="mb-32">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 gap-16">
        <h1 class="text-heading-lg font-display text-light-gray">お気に入りコレクション</h1>
        
        <router-link to="/" class="inline-flex items-center gap-8 text-light-gray hover:text-primary-gold transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>ホームに戻る</span>
        </router-link>
      </div>
      
      <!-- コレクションセクション -->
      <div class="mb-32 transition-all duration-500"
          :class="{'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded}">
        <div class="flex justify-between items-center mb-16">
          <h2 class="text-heading-sm font-display text-primary-gold">コレクション</h2>
          
          <div class="flex gap-8">
            <button 
              v-if="!showNewCollectionForm" 
              @click="showNewCollectionForm = true" 
              class="py-6 px-12 rounded-full text-caption text-light-gray hover:text-primary-gold transition-colors duration-300"
              :class="{ 'hidden': editMode }">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            
            <button 
              @click="toggleEditMode" 
              class="py-6 px-12 rounded-full text-caption text-light-gray hover:text-primary-gold transition-colors duration-300">
              <span v-if="editMode">完了</span>
              <span v-else>編集</span>
            </button>
          </div>
        </div>
        
        <!-- コレクションタブ -->
        <div class="flex flex-wrap gap-8 mb-16">
          <button 
            v-for="collection in collections" 
            :key="collection"
            @click="activeCollection = collection"
            class="flex items-center gap-8 px-16 py-8 rounded-full text-body relative tap-target transition-all duration-300"
            :class="activeCollection === collection ? 
              'bg-primary-gold/10 text-primary-gold border border-primary-gold' : 
              'bg-charcoal border border-light-gray/20 text-light-gray hover:text-primary-gold hover:border-primary-gold/50'">
            {{ collection }}
            
            <!-- 削除ボタン (編集モード中、すべて以外) -->
            <button 
              v-if="editMode && collection !== 'すべて'" 
              @click.stop="removeCollection(collection)" 
              class="ml-4 w-16 h-16 flex items-center justify-center rounded-full hover:bg-error/20 hover:text-error transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </button>
        </div>
        
        <!-- 新しいコレクション追加フォーム -->
        <div v-if="showNewCollectionForm" class="flex gap-8 mb-16">
          <input 
            v-model="newCollectionName" 
            type="text" 
            placeholder="新しいコレクション名..."
            class="flex-1 px-16 py-8 bg-charcoal border border-primary-gold/50 rounded-full text-light-gray focus:outline-none focus:border-primary-gold"
            @keyup.enter="addNewCollection">
          
          <div class="flex gap-8">
            <button 
              @click="addNewCollection" 
              class="px-16 py-8 rounded-full bg-primary-gold text-dark font-medium shadow-button hover:shadow-floating transform hover:scale-[1.03] transition-all duration-300">
              追加
            </button>
            
            <button 
              @click="showNewCollectionForm = false" 
              class="px-16 py-8 rounded-full border border-light-gray/20 text-light-gray hover:text-primary-gold hover:border-primary-gold/50 transition-colors duration-300">
              キャンセル
            </button>
          </div>
        </div>
      </div>
      
      <!-- お気に入りリスト -->
      <div class="transition-all duration-500 delay-100"
          :class="{'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded}">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
          <div 
            v-for="favorite in filteredFavorites" 
            :key="favorite.id" 
            class="bg-charcoal rounded-card overflow-hidden shadow-card hover:shadow-floating transform hover:scale-[1.03] transition-all duration-300 relative">
            
            <!-- 削除ボタン -->
            <button 
              @click="removeFavorite(favorite.id)" 
              class="absolute top-8 right-8 z-10 w-24 h-24 rounded-full bg-dark/50 text-light-gray hover:bg-error hover:text-white flex items-center justify-center transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <!-- 投稿画像 -->
            <router-link :to="`/post/${favorite.id}`" class="block">
              <div class="aspect-square relative overflow-hidden">
                <img :src="favorite.image" :alt="favorite.title" class="w-full h-full object-cover">
                
                <!-- オーバーレイ情報 -->
                <div class="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-16">
                  <h3 class="text-heading-sm text-light-gray font-medium mb-8">{{ favorite.title }}</h3>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 text-primary-gold">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      <span class="text-light-gray">{{ favorite.likes }}</span>
                    </div>
                    <div class="text-caption text-primary-gold/80" v-if="favorite.tags && favorite.tags.length > 0">
                      #{{ favorite.tags[0] }}
                    </div>
                  </div>
                </div>
              </div>
            </router-link>
            
            <!-- 投稿情報 -->
            <div class="p-16">
              <div class="flex items-center gap-8 mb-8">
                <router-link :to="`/profile/${favorite.user.id}`" class="flex items-center gap-8">
                  <img :src="favorite.user.avatar" :alt="favorite.user.name" class="w-24 h-24 rounded-full">
                  <span class="text-light-gray text-caption">{{ favorite.user.name }}</span>
                </router-link>
              </div>
              
              <!-- コレクション選択 -->
              <div class="flex items-center gap-8">
                <span class="text-caption text-light-gray/50">コレクション:</span>
                <select 
                  v-model="favorite.collection"
                  @change="changeCollection(favorite, $event.target.value)"
                  class="bg-dark border border-primary-gold/30 text-light-gray rounded-md py-2 px-8 text-caption focus:outline-none focus:border-primary-gold">
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
          
          <!-- 投稿がない場合 -->
          <div 
            v-if="filteredFavorites.length === 0" 
            class="col-span-full p-32 text-center bg-charcoal rounded-card border border-primary-green/20">
            <div class="text-light-gray/60 mb-16">このコレクションにはまだ何も保存されていません。</div>
            <router-link to="/" class="inline-block py-8 px-16 bg-primary-gold text-dark rounded-full shadow-button hover:shadow-floating transform hover:scale-[1.03] transition-all duration-300">
              ホームから探す
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* タップエフェクト */
.tap-target {
  position: relative;
  overflow: hidden;
}

.tap-target::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%, -50%);
  transform-origin: 50% 50%;
}

.tap-target:active::after {
  opacity: 1;
  width: 100px;
  height: 100px;
  transform: scale(0, 0) translate(-50%, -50%);
  transition: transform 0.5s, opacity 0.5s;
}
</style>