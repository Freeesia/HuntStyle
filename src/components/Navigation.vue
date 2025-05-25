<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref } from 'vue';

const route = useRoute();
const isSearchActive = ref(false);

// 検索フォームの表示切替
const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value;
  if (isSearchActive.value) {
    setTimeout(() => {
      document.getElementById('search-input')?.focus();
    }, 100);
  }
};
</script>

<template>
  <!-- デスクトップナビゲーション - 左側サイドバー -->
  <nav class="hidden lg:flex fixed left-0 top-0 h-full w-60 bg-charcoal flex-col z-30 border-r border-r-primary-green/20 shadow-card">
    <!-- ロゴ部分 -->
    <div class="p-24 flex justify-center mb-16">
      <router-link to="/" class="block transition-transform hover:scale-105">
        <img src="/icons/icon.svg" alt="HuntStyle" class="h-40 w-auto" />
      </router-link>
    </div>
    
    <!-- ナビゲーションリンク -->
    <div class="nav-links flex flex-col gap-8 px-16">
      <router-link to="/" 
        class="nav-item flex items-center gap-16 p-12 rounded-card text-light-gray hover:bg-dark transition-all duration-300"
        :class="{ 'text-primary-gold bg-dark/60 font-medium': route.path === '/' }">
        <div class="nav-icon w-[24px] h-[24px] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <span class="text-body">ホーム</span>
      </router-link>
      
      <router-link to="/favorites" 
        class="nav-item flex items-center gap-16 p-12 rounded-card text-light-gray hover:bg-dark transition-all duration-300"
        :class="{ 'text-primary-gold bg-dark/60 font-medium': route.path === '/favorites' }">
        <div class="nav-icon w-[24px] h-[24px] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        <span class="text-body">お気に入り</span>
      </router-link>
      
      <router-link to="/equipment" 
        class="nav-item flex items-center gap-16 p-12 rounded-card text-light-gray hover:bg-dark transition-all duration-300"
        :class="{ 'text-primary-gold bg-dark/60 font-medium': route.path === '/equipment' }">
        <div class="nav-icon w-[24px] h-[24px] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </div>
        <span class="text-body">所持装備</span>
      </router-link>
      
      <router-link to="/profile/1" 
        class="nav-item flex items-center gap-16 p-12 rounded-card text-light-gray hover:bg-dark transition-all duration-300"
        :class="{ 'text-primary-gold bg-dark/60 font-medium': route.path.startsWith('/profile') }">
        <div class="nav-icon w-[24px] h-[24px] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span class="text-body">プロフィール</span>
      </router-link>
    </div>
    
    <!-- 新規投稿ボタン -->
    <div class="mt-auto p-16">
      <router-link to="/post/new" class="block">
        <button class="w-full py-10 px-16 bg-gradient-to-r from-primary-gold to-bright-gold text-dark font-bold rounded-full shadow-button transition-all hover:shadow-floating hover:scale-[1.03] active:scale-95">
          新規投稿
        </button>
      </router-link>
    </div>
  </nav>

  <!-- モバイルナビゲーション - 下部固定 (Instagram/TikTok風) -->
  <nav class="fixed bottom-0 left-0 right-0 bg-charcoal border-t border-t-primary-green/20 z-30 lg:hidden shadow-floating">
    <div class="flex justify-around items-center h-[60px] px-16">
      <router-link to="/" 
        class="tap-target flex flex-col items-center justify-center text-light-gray transition-all"
        :class="{ 'text-primary-gold': route.path === '/' }">
        <div class="nav-icon w-[24px] h-[24px] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <span class="text-[10px] mt-2">ホーム</span>
      </router-link>
      
      <router-link to="/favorites" 
        class="tap-target flex flex-col items-center justify-center text-light-gray transition-all"
        :class="{ 'text-primary-gold': route.path === '/favorites' }">
        <div class="nav-icon w-[24px] h-[24px] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        <span class="text-[10px] mt-2">お気に入り</span>
      </router-link>
      
      <!-- 中央の新規投稿ボタン -->
      <router-link to="/post/new" class="relative -top-16">
        <button class="w-[56px] h-[56px] flex items-center justify-center bg-gradient-to-r from-primary-gold to-bright-gold text-dark rounded-full shadow-floating transform transition-all hover:scale-105 active:scale-95 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </router-link>
      
      <router-link to="/equipment" 
        class="tap-target flex flex-col items-center justify-center text-light-gray transition-all"
        :class="{ 'text-primary-gold': route.path === '/equipment' }">
        <div class="nav-icon w-[24px] h-[24px] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </div>
        <span class="text-[10px] mt-2">装備</span>
      </router-link>
      
      <router-link to="/profile/1" 
        class="tap-target flex flex-col items-center justify-center text-light-gray transition-all"
        :class="{ 'text-primary-gold': route.path.startsWith('/profile') }">
        <div class="nav-icon w-[24px] h-[24px] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <span class="text-[10px] mt-2">プロフィール</span>
      </router-link>
    </div>
  </nav>

  <!-- モバイル用のヘッダー (トップバー) -->
  <header class="lg:hidden fixed top-0 left-0 right-0 bg-charcoal border-b border-b-primary-green/20 z-40 h-[60px] flex items-center px-16 shadow-card">
    <div class="flex justify-between items-center w-full">
      <router-link to="/" class="block transition-transform">
        <img src="/icons/icon.svg" alt="HuntStyle" class="h-32 w-auto" />
      </router-link>

      <!-- 検索ボタン -->
      <button 
        class="tap-target w-[44px] h-[44px] flex items-center justify-center text-light-gray rounded-full hover:bg-dark/60 transition-all"
        @click="toggleSearch">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-[20px] h-[20px]">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>
    
    <!-- 検索オーバーレイ -->
    <transition name="fade">
      <div v-if="isSearchActive" class="fixed inset-0 bg-overlay z-50 flex flex-col pt-[80px] px-16">
        <div class="bg-charcoal rounded-card shadow-floating p-16 w-full max-w-[600px] mx-auto">
          <div class="flex items-center gap-8 mb-16">
            <input 
              id="search-input"
              type="text" 
              placeholder="装備やタグを検索..."
              class="w-full bg-dark text-light-gray py-12 px-16 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-gold"
            />
            <button 
              class="tap-target w-[44px] h-[44px] flex items-center justify-center text-light-gray bg-primary-gold rounded-full"
              @click="toggleSearch">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-[20px] h-[20px]">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <!-- 武器フィルター -->
          <h3 class="text-heading-sm mb-8 text-primary-gold">武器種</h3>
          <div class="flex flex-wrap gap-8 mb-16">
            <button class="bg-dark/60 hover:bg-primary-green/30 text-light-gray px-12 py-8 rounded-full text-caption transition-all">
              大剣
            </button>
            <button class="bg-dark/60 hover:bg-primary-green/30 text-light-gray px-12 py-8 rounded-full text-caption transition-all">
              太刀
            </button>
            <button class="bg-dark/60 hover:bg-primary-green/30 text-light-gray px-12 py-8 rounded-full text-caption transition-all">
              ハンマー
            </button>
            <button class="bg-dark/60 hover:bg-primary-green/30 text-light-gray px-12 py-8 rounded-full text-caption transition-all">
              双剣
            </button>
            <button class="bg-primary-gold text-dark px-12 py-8 rounded-full text-caption transition-all font-medium">
              ランス
            </button>
          </div>
          
          <!-- タグクラウド -->
          <h3 class="text-heading-sm mb-8 text-primary-gold">人気のタグ</h3>
          <div class="flex flex-wrap gap-8">
            <button class="bg-dark/60 hover:bg-primary-green/30 text-light-gray px-12 py-8 rounded-full text-caption transition-all">
              #かっこいい
            </button>
            <button class="bg-dark/60 hover:bg-primary-green/30 text-light-gray px-12 py-8 rounded-full text-caption transition-all">
              #鎧系
            </button>
            <button class="bg-primary-gold text-dark px-12 py-8 rounded-full text-caption transition-all font-medium">
              #モフモフ
            </button>
            <button class="bg-dark/60 hover:bg-primary-green/30 text-light-gray px-12 py-8 rounded-full text-caption transition-all">
              #ドラゴン
            </button>
            <button class="bg-dark/60 hover:bg-primary-green/30 text-light-gray px-12 py-8 rounded-full text-caption transition-all">
              #ミニマル
            </button>
          </div>
        </div>
      </div>
    </transition>
  </header>
</template>