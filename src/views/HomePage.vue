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

// 表示切替
const viewType = ref<'grid' | 'feed'>('grid');

// アニメーションステート
const isLoaded = ref(false);
const activePostId = ref<string | null>(null);

// 投稿データを保持するref
const posts = ref<Post[]>([]);

// データ読み込み中フラグ
const isLoading = ref(true);

// データ読み込みエラーフラグ
const hasError = ref(false);

// LayerSets（重ね着）データを取得して加工する
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

// 武器種フィルター
const weaponTypes = ['大剣', '太刀', '片手剣', '双剣', 'ハンマー', 'ランス', 'ガンランス', '操虫棍', '弓', 'ライトボウガン'];
const selectedWeapon = ref('すべて');

// 並び替えオプション
const sortOptions = ['最新', '人気', 'フォロー中'];
const selectedSort = ref('最新');

// 人気のタグを取得（データから抽出）
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

const selectedTags = ref<string[]>([]);

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

// フィルタリングされた投稿
const filteredPosts = computed(() => {
  let filtered = [...posts.value];
  
  // 並び替え
  if (selectedSort.value === '最新') {
    // 最新順（データにはcreatedAtがあるが、既にposts配列が作成時に変換されているため、ここではそのまま）
  } else if (selectedSort.value === '人気') {
    // いいね数順
    filtered = filtered.sort((a, b) => b.likes - a.likes);
  } else if (selectedSort.value === 'フォロー中') {
    // フォロー中のユーザー（実際のフォロー機能はまだ実装されていないため、ダミー）
    // 実際の実装では、フォロー中のユーザーIDリストと投稿のユーザーIDを照合する
  }
  
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

// タグの選択・解除
const toggleTag = (tag: string) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag);
  } else {
    selectedTags.value.push(tag);
  }
};

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
      
      <!-- 表示切替ボタン -->
      <div class="flex justify-end mb-16">
        <div class="flex bg-charcoal rounded-full p-4 shadow-sm">
          <button 
            class="px-12 py-6 rounded-full transition-all duration-300"
            :class="viewType === 'grid' ? 'bg-primary-gold text-dark font-medium' : 'text-light-gray hover:text-primary-gold'"
            @click="viewType = 'grid'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </button>
          <button 
            class="px-12 py-6 rounded-full transition-all duration-300"
            :class="viewType === 'feed' ? 'bg-primary-gold text-dark font-medium' : 'text-light-gray hover:text-primary-gold'"
            @click="viewType = 'feed'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
              <line x1="21" y1="10" x2="3" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="21" y1="14" x2="3" y2="14"></line>
              <line x1="21" y1="18" x2="3" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 投稿グリッド表示 -->
    <div v-if="viewType === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16">
      <div 
        v-for="post in filteredPosts" 
        :key="post.id" 
        class="bg-charcoal rounded-card overflow-hidden shadow-card hover:shadow-floating transition-all duration-300"
        :class="{'transform scale-102': isLoaded}"
      >
        <router-link :to="`/post/${post.id}`" class="block">
          <div class="relative">
            <img 
              :src="post.image" 
              :alt="post.title" 
              class="w-full aspect-video object-cover transition-transform duration-700 hover:scale-[1.05]"
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
          </div>
        </router-link>
      </div>
    </div>

    <!-- 投稿フィード表示 -->
    <div v-else class="space-y-24">
      <div 
        v-for="post in filteredPosts" 
        :key="post.id" 
        class="bg-charcoal rounded-card overflow-hidden shadow-card animate-fade"
      >
        <!-- ヘッダー -->
        <div class="p-16 flex items-center">
          <img :src="post.userImage" :alt="post.user" class="w-32 h-32 rounded-full mr-12 border-2 border-primary-gold/20">
          <div class="flex-1">
            <div class="font-medium text-light-gray">{{ post.user }}</div>
            <div class="text-caption text-light-gray/70">{{ post.weaponType }} 使い</div>
          </div>
          <button class="text-light-gray/50 hover:text-primary-gold p-8 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
        </div>
        
        <!-- 画像 -->
        <div class="relative">
          <router-link :to="`/post/${post.id}`">
            <img 
              :src="post.image" 
              :alt="post.title" 
              class="w-full aspect-video object-cover"
              loading="lazy"
            />
          </router-link>
          
          <!-- オーバーレイのいいねアニメーション -->
          <div 
            v-if="activePostId === post.id" 
            class="absolute inset-0 flex items-center justify-center bg-dark/20"
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
        </div>
        
        <!-- アクション -->
        <div class="p-16">
          <div class="flex items-center gap-16 mb-12">
            <button 
              class="tap-target flex items-center justify-center text-24 transition-transform hover:scale-110 active:scale-95"
              :class="post.isLiked ? 'text-primary-gold' : 'text-light-gray'"
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
                class="w-24 h-24"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </button>
            <button class="tap-target flex items-center justify-center text-24 text-light-gray transition-transform hover:scale-110 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </button>
            <button class="tap-target flex items-center justify-center text-24 text-light-gray transition-transform hover:scale-110 active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <!-- いいね数と説明 -->
          <p class="text-primary-gold font-medium mb-4">{{ post.likes }} いいね</p>
          <p class="mb-8">
            <span class="font-medium">{{ post.user }}</span>
            <span class="ml-8">{{ post.title }}</span>
          </p>
          <!-- タグ -->
          <div class="flex flex-wrap gap-4 mb-8">
            <span 
              v-for="tag in post.tags" 
              :key="tag" 
              class="text-caption text-primary-gold/80 hover:text-primary-gold cursor-pointer"
            >
              #{{ tag }}
            </span>
          </div>
          <!-- コメントフォーム -->
          <div class="flex items-center gap-8 mt-12 border-t border-primary-green/20 pt-12">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20 text-light-gray/70">
              <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"></path>
              <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"></path>
            </svg>
            <input 
              type="text" 
              placeholder="コメントを追加..." 
              class="bg-transparent text-light-gray placeholder-light-gray/50 border-none outline-none flex-1"
            />
            <button class="text-primary-gold font-medium opacity-60 hover:opacity-100 transition-opacity">投稿</button>
          </div>
        </div>
      </div>
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

/* マテリアルデザイン風の波紋エフェクト */
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