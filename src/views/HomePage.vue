<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { fetchLayerSets, getImagePath } from '../data/layerSets';

// 投稿の型定義
interface Post {
  id: string;
  title: string;
  image: string;
  user: string;
  userImage: string;
  likes: number;
  isLiked: boolean;
  weaponType: string;
  tags: string[];
  description: string;
}

// UI状態の管理
const isLoaded = ref(false);
const activePostId = ref<string | null>(null);
const posts = ref<Post[]>([]);
const isLoading = ref(true);
const hasError = ref(false);
const selectedWeapon = ref('すべて');
const selectedSort = ref('最新');
const selectedTags = ref<string[]>([]);

// 武器種と並び替えオプション
const weaponTypes = ['大剣', '太刀', '片手剣', '双剣', 'ハンマー', 'ランス', 'ガンランス', '操虫棍', '弓', 'ライトボウガン'];
const sortOptions = ['最新', '人気', 'フォロー中'];

// データ取得
onMounted(async () => {
  try {
    isLoading.value = true;
    const layerSetsData = await fetchLayerSets();
    
    // 有効なデータのみフィルタリングして加工
    posts.value = layerSetsData
      .filter(set => set.name && set.images && set.images.length > 0)
      .map(layerSet => ({
        id: layerSet.id,
        title: layerSet.name,
        image: layerSet.images && layerSet.images.length > 0 ? getImagePath(layerSet.images[0]) : '',
        user: 'ハンター',  // ダミーデータにはユーザー情報がないため仮設定
        userImage: 'https://via.placeholder.com/50x50?text=User',
        likes: Math.floor(Math.random() * 200) + 10, // いいね数をランダムに設定
        isLiked: false,
        weaponType: ['大剣', '太刀', '片手剣', '双剣', 'ハンマー', 'ランス', 'ガンランス', '操虫棍', '弓', 'ライトボウガン'][Math.floor(Math.random() * 10)], // 武器種をランダムに設定
        tags: layerSet.tags || [],
        description: layerSet.description
      }));
    
    isLoaded.value = true;
  } catch (error) {
    console.error('重ね着データの取得に失敗しました:', error);
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
});

// いいねの切り替え
const toggleLike = (postId: string) => {
  const post = posts.value.find(p => p.id === postId);
  if (post) {
    activePostId.value = postId;
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
    
    // アニメーション後にリセット
    setTimeout(() => {
      activePostId.value = null;
    }, 500);
  }
};

// タグの選択・解除
const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag);
  } else {
    selectedTags.value.push(tag);
  }
};

// 人気のタグを計算
const popularTags = computed(() => {
  // すべての投稿からタグを抽出して、出現回数でソート
  const tagCounts = posts.value.reduce((acc, post) => {
    post.tags.forEach((tag: string) => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  
  // 出現回数の多い順にソートして最大10個を返す
  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag]) => tag);
});

// フィルタリングされた投稿
const filteredPosts = computed(() => {
  let filtered = [...posts.value];
  
  // 並び替え
  if (selectedSort.value === '最新') {
    // 最新順（そのまま）
  } else if (selectedSort.value === '人気') {
    // いいね数順
    filtered = filtered.sort((a, b) => b.likes - a.likes);
  } else if (selectedSort.value === 'フォロー中') {
    // フォロー中のユーザー（実際の実装ではユーザーIDと照合）
  }
  
  // 武器種とタグによるフィルタリング
  return filtered.filter(post => {
    // 武器種フィルター
    if (selectedWeapon.value !== 'すべて' && post.weaponType !== selectedWeapon.value) {
      return false;
    }
    
    // タグフィルター
    if (selectedTags.value.length > 0) {
      return post.tags.some(tag => selectedTags.value.includes(tag));
    }
    
    return true;
  });
});

// アニメーション制御
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true;
  }, 300);
});
</script>

<template>
  <div class="max-w-[1200px] mx-auto">
    <!-- ヘッダーセクション -->
    <div class="mb-32 pt-[70px] lg:pt-0">
      <h1 class="text-heading-lg font-display mb-16 flex items-center">
        <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary-gold to-bright-gold">HuntStyle</span>
      </h1>
      
      <!-- 検索&フィルターセクション -->
      <div class="mb-24">
        <!-- 検索バー -->
        <div class="relative mb-16">
          <input 
            type="text" 
            placeholder="重ね着を検索..." 
            class="w-full py-12 px-16 bg-charcoal rounded-full border border-primary-green/30 text-light-gray focus:border-primary-gold focus:outline-none focus:ring-2 focus:ring-primary-gold/30 transition-all shadow-sm" 
          />
          <button class="absolute right-16 top-1/2 transform -translate-y-1/2 text-primary-gold w-[24px] h-[24px] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        
        <!-- フィルターボタン -->
        <div class="flex flex-wrap gap-8 mb-16">
          <button 
            v-for="option in sortOptions" 
            :key="option"
            class="px-16 py-8 rounded-full border transition-all duration-300"
            :class="selectedSort === option ? 
              'bg-gradient-to-r from-primary-gold to-bright-gold text-dark font-medium border-transparent shadow-sm' : 
              'bg-charcoal text-light-gray border-primary-green/20 hover:border-primary-gold/50'"
            @click="selectedSort = option"
          >
            {{ option }}
          </button>
        </div>
        
        <!-- 武器種フィルター (横スクロール) -->
        <div class="overflow-x-auto hide-scrollbar">
          <div class="flex gap-8 py-8 min-w-max">
            <button 
              class="px-16 py-6 rounded-full text-caption whitespace-nowrap transition-all duration-300"
              :class="selectedWeapon === 'すべて' ? 'bg-primary-gold text-dark font-medium shadow-sm' : 'bg-charcoal text-light-gray hover:bg-dark'"
              @click="selectedWeapon = 'すべて'"
            >
              すべて
            </button>
            <button 
              v-for="weapon in weaponTypes"
              :key="weapon"
              class="px-16 py-6 rounded-full text-caption whitespace-nowrap transition-all duration-300"
              :class="selectedWeapon === weapon ? 'bg-primary-gold text-dark font-medium shadow-sm' : 'bg-charcoal text-light-gray hover:bg-dark'"
              @click="selectedWeapon = weapon"
            >
              {{ weapon }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 人気のタグ -->
      <div class="mb-24">
        <h3 class="text-heading-sm text-primary-gold mb-8 flex items-center gap-8">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
            <line x1="7" y1="7" x2="7.01" y2="7"></line>
          </svg>
          人気のタグ
        </h3>
        <div class="flex flex-wrap gap-8">
          <button 
            v-for="tag in popularTags" 
            :key="tag"
            class="px-12 py-6 rounded-full text-caption transition-all duration-300"
            :class="selectedTags.includes(tag) ? 
              'bg-primary-gold text-dark font-medium' : 
              'bg-dark/60 text-light-gray hover:bg-primary-green/30'"
            @click="toggleTag(tag)"
          >
            #{{ tag }}
          </button>
        </div>
      </div>
    </div>

    <!-- ローディング表示 -->
    <div v-if="isLoading" class="flex justify-center items-center py-64">
      <div class="w-48 h-48 border-4 border-primary-gold/30 border-t-primary-gold rounded-full animate-spin"></div>
    </div>

    <!-- エラー表示 -->
    <div v-else-if="hasError" class="bg-red-500/10 p-24 rounded-card text-center">
      <p class="text-red-500">データの読み込みに失敗しました。再読み込みしてください。</p>
    </div>

    <!-- 投稿グリッド表示 -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16">
      <div 
        v-for="post in filteredPosts" 
        :key="post.id" 
        class="bg-charcoal rounded-card overflow-hidden shadow-card hover:shadow-floating transition-all duration-300"
        :class="{'transform scale-102': isLoaded}"
      >
        <div class="relative">
          <router-link :to="`/post/${post.id}`" class="block">
            <img 
              :src="post.image" 
              :alt="post.title" 
              class="w-full aspect-[2/3] object-cover transition-transform duration-700 hover:scale-[1.05]"
              loading="lazy"
            />
            <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark/90 to-transparent p-16 pt-32">
              <h3 class="text-heading-sm font-medium text-light-gray mb-8">{{ post.title }}</h3>
              <div class="flex items-center justify-between text-caption text-light-gray/80">
                <div class="flex items-center gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="w-14 h-14 text-primary-gold">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span>{{ post.likes }}</span>
                </div>
                <div class="flex items-center">
                  <img :src="post.userImage" :alt="post.user" class="w-24 h-24 rounded-full mr-8">
                  <span>{{ post.user }}</span>
                </div>
              </div>
              <!-- タグ表示 -->
              <div class="flex flex-wrap gap-4 mt-8 text-caption">
                <span 
                  v-for="tag in post.tags.slice(0, 3)" 
                  :key="tag" 
                  class="text-primary-gold/80"
                >
                  #{{ tag }}
                </span>
              </div>
            </div>
          </router-link>
          
          <!-- いいねボタン -->
          <button 
            class="absolute top-8 right-8 w-32 h-32 flex items-center justify-center bg-charcoal/70 rounded-full backdrop-blur-sm transition-all hover:bg-charcoal"
            @click="toggleLike(post.id)"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              :fill="post.isLiked ? 'currentColor' : 'none'" 
              :stroke="post.isLiked ? 'none' : 'currentColor'" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              class="w-16 h-16"
              :class="post.isLiked ? 'text-primary-gold' : 'text-light-gray'"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 投稿がない場合 -->
    <div v-if="!isLoading && !hasError && filteredPosts.length === 0" class="bg-charcoal/50 p-32 rounded-card text-center">
      <p class="text-light-gray/70">表示できる投稿がありません。フィルターを変更してみてください。</p>
    </div>

    <!-- オーバーレイのいいねアニメーション -->
    <div 
      v-if="activePostId !== null" 
      class="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        class="w-64 h-64 text-primary-gold animate-bounce-sm"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    </div>

    <!-- フローティングアクションボタン (モバイル用) -->
    <div class="lg:hidden fixed right-16 bottom-[80px] z-20">
      <button class="w-[56px] h-[56px] flex items-center justify-center bg-primary-gold rounded-full shadow-floating text-dark hover:brightness-110 active:scale-95 transition-all">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* スクロールバーを隠すユーティリティクラス */
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* アニメーション */
.scale-102 {
  transform: scale(1);
  transition: transform 0.5s ease;
}

/* アニメーション */
@keyframes bounce-sm {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

.animate-bounce-sm {
  animation: bounce-sm 0.5s ease-in-out;
}
</style>