<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userId = computed(() => route.params.id);

// モックデータ
const user = ref({
  id: userId,
  name: 'ハンター1号',
  avatar: 'https://via.placeholder.com/150x150',
  bio: 'モンハンワイルズ歴5年。重ね着コーディネートが大好きです。特に氷属性装備のコレクターです。',
  rank: 'マスターランク 120',
  mainWeapon: '大剣',
  followers: 245,
  following: 128,
  posts: [
    {
      id: 1,
      title: '氷の女王風コーデ',
      image: 'https://via.placeholder.com/300x300?text=Ice+Queen',
      likes: 120,
      tags: ['氷属性', '女王', 'エレガント']
    },
    {
      id: 2,
      title: '古龍風の装備',
      image: 'https://via.placeholder.com/300x300?text=Elder+Dragon',
      likes: 85,
      tags: ['古龍', '重装', 'カッコいい']
    },
    {
      id: 3,
      title: '雪山探索スタイル',
      image: 'https://via.placeholder.com/300x300?text=Snow+Mountain',
      likes: 67,
      tags: ['雪山', '実用的', '防寒']
    },
    {
      id: 6,
      title: 'アイスボーンコレクション',
      image: 'https://via.placeholder.com/300x300?text=Iceborne',
      likes: 134,
      tags: ['コラボ', 'レア', '氷']
    },
    {
      id: 7,
      title: 'ミラボレアス風',
      image: 'https://via.placeholder.com/300x300?text=Fatalis',
      likes: 201,
      tags: ['黒龍', '伝説', '漆黒']
    }
  ],
  favorites: [
    {
      id: 4,
      title: '炎のバーサーカースタイル',
      image: 'https://via.placeholder.com/300x300?text=Fire+Style',
      likes: 92,
      tags: ['火属性', 'バーサーカー', '力強い']
    },
    {
      id: 5,
      title: '雷神コーデ',
      image: 'https://via.placeholder.com/300x300?text=Thunder+God',
      likes: 210,
      tags: ['雷属性', '神々しい', 'カッコいい']
    },
    {
      id: 8,
      title: '天空の騎士',
      image: 'https://via.placeholder.com/300x300?text=Sky+Knight',
      likes: 175,
      tags: ['空属性', '騎士', '優雅']
    }
  ]
});

const activeTab = ref('posts'); // 'posts' または 'favorites'
const isFollowing = ref(false);
const isLoaded = ref(false);

const toggleFollow = () => {
  isFollowing.value = !isFollowing.value;
  user.value.followers += isFollowing.value ? 1 : -1;
};

// アニメーション制御
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true;
  }, 300);
});

</script>

<template>
  <div class="max-w-[900px] mx-auto pt-[70px] lg:pt-0 px-16">
    <!-- ヘッダーセクション -->
    <div class="mb-32">
      <router-link to="/" class="inline-flex items-center gap-8 text-light-gray hover:text-primary-gold transition-colors duration-300 mb-24">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>ホームに戻る</span>
      </router-link>
      
      <!-- プロフィール情報 -->
      <div class="flex flex-col md:flex-row items-center md:items-start gap-24 mb-32 transition-opacity duration-500"
          :class="{'opacity-100': isLoaded, 'opacity-0': !isLoaded}">
        <!-- プロフィール画像 -->
        <div class="relative">
          <div class="w-[150px] h-[150px] rounded-full overflow-hidden border-4 border-primary-gold/30 shadow-card">
            <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover">
          </div>
          <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-primary-gold text-dark px-12 py-4 rounded-full text-caption font-medium shadow-sm">
            {{ user.mainWeapon }}
          </div>
        </div>
        
        <!-- プロフィール詳細 -->
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-heading-lg text-light-gray mb-8 font-display">{{ user.name }}</h1>
          <p class="text-light-gray/80 mb-16 max-w-[500px]">{{ user.bio }}</p>
          
          <div class="text-caption text-primary-gold/90 mb-16">{{ user.rank }}</div>
          
          <!-- 統計情報 -->
          <div class="flex justify-center md:justify-start gap-32 mb-24">
            <div class="flex flex-col items-center">
              <span class="text-heading-md font-display text-primary-gold">{{ user.posts.length }}</span>
              <span class="text-caption text-light-gray/70">投稿</span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-heading-md font-display text-primary-gold">{{ user.followers }}</span>
              <span class="text-caption text-light-gray/70">フォロワー</span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-heading-md font-display text-primary-gold">{{ user.following }}</span>
              <span class="text-caption text-light-gray/70">フォロー中</span>
            </div>
          </div>
          
          <!-- フォローボタン -->
          <button 
            @click="toggleFollow" 
            class="py-10 px-32 rounded-full transition-all duration-300 font-medium text-caption tap-target"
            :class="isFollowing ? 
              'bg-charcoal text-primary-gold border border-primary-gold' : 
              'bg-gradient-to-r from-primary-gold to-bright-gold text-dark shadow-button'">
            {{ isFollowing ? 'フォロー中' : 'フォローする' }}
          </button>
        </div>
      </div>
      
      <!-- タブセクション -->
      <div class="flex border-b border-primary-green/20 mb-32">
        <button 
          @click="activeTab = 'posts'" 
          class="pb-8 px-16 relative text-body font-medium transition-colors duration-300"
          :class="activeTab === 'posts' ? 'text-primary-gold' : 'text-light-gray hover:text-primary-gold/70'">
          投稿
          <div v-if="activeTab === 'posts'" class="absolute bottom-0 left-0 w-full h-[2px] bg-primary-gold"></div>
        </button>
        <button
          @click="activeTab = 'favorites'" 
          class="pb-8 px-16 relative text-body font-medium transition-colors duration-300"
          :class="activeTab === 'favorites' ? 'text-primary-gold' : 'text-light-gray hover:text-primary-gold/70'">
          お気に入り
          <div v-if="activeTab === 'favorites'" class="absolute bottom-0 left-0 w-full h-[2px] bg-primary-gold"></div>
        </button>
      </div>
    </div>
    
    <!-- 投稿グリッド -->
    <transition name="fade" mode="out-in">
      <div v-if="activeTab === 'posts'" key="posts" 
          class="grid grid-cols-2 sm:grid-cols-3 gap-16 transition-opacity duration-300"
          :class="{'opacity-100': isLoaded, 'opacity-0': !isLoaded}">
        <div 
          v-for="post in user.posts" 
          :key="post.id" 
          class="aspect-square overflow-hidden rounded-card shadow-card hover:shadow-floating transform hover:scale-[1.03] transition-all duration-300">
          <router-link :to="`/post/${post.id}`" class="block relative h-full">
            <img :src="post.image" :alt="post.title" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-16">
              <h3 class="text-heading-sm text-light-gray font-medium mb-8">{{ post.title }}</h3>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 text-primary-gold">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span class="text-light-gray">{{ post.likes }}</span>
                </div>
                <div class="text-caption text-primary-gold/80">
                  #{{ post.tags[0] }}
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
      
      <div v-else key="favorites"
          class="grid grid-cols-2 sm:grid-cols-3 gap-16 transition-opacity duration-300"
          :class="{'opacity-100': isLoaded, 'opacity-0': !isLoaded}">
        <div 
          v-for="post in user.favorites" 
          :key="post.id" 
          class="aspect-square overflow-hidden rounded-card shadow-card hover:shadow-floating transform hover:scale-[1.03] transition-all duration-300">
          <router-link :to="`/post/${post.id}`" class="block relative h-full">
            <img :src="post.image" :alt="post.title" class="w-full h-full object-cover">
            <div class="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-16">
              <h3 class="text-heading-sm text-light-gray font-medium mb-8">{{ post.title }}</h3>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-16 h-16 text-primary-gold">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span class="text-light-gray">{{ post.likes }}</span>
                </div>
                <div class="text-caption text-primary-gold/80">
                  #{{ post.tags[0] }}
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </transition>
    
    <!-- 装備管理リンク -->
    <div class="mt-48 mb-64 flex justify-center">
      <router-link to="/equipment" class="inline-flex items-center gap-8 py-12 px-24 bg-primary-green text-light-gray rounded-full shadow-button hover:shadow-floating transform hover:scale-105 transition-all duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
        <span class="font-medium">所持装備を管理する</span>
      </router-link>
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
