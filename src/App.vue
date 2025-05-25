<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';
import Navigation from './components/Navigation.vue';

// グローバルステート
const isLoading = ref(false);
const showNotification = ref(false);
const notificationMessage = ref('');
const notificationType = ref<'success' | 'error' | 'info'>('info');

// ページ読み込み時のアニメーション
onMounted(() => {
  document.body.classList.add('ready');
});

// 通知表示関数
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  notificationMessage.value = message;
  notificationType.value = type;
  showNotification.value = true;
  
  setTimeout(() => {
    showNotification.value = false;
  }, 3000);
};

// グローバルプロバイド
provide('showToast', showToast);
provide('isLoading', isLoading);
</script>

<template>
  <div class="app min-h-screen flex flex-col bg-dark text-light-gray">
    <Navigation />
    
    <!-- メインコンテンツ -->
    <main class="main-content pt-4 px-4 md:pt-8 md:px-8 lg:pt-16 lg:px-16 transition-all duration-300">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- ローディングスピナー -->
    <div v-if="isLoading" class="fixed inset-0 bg-overlay z-50 flex items-center justify-center">
      <div class="w-16 h-16 border-4 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <!-- 通知トースト -->
    <transition name="toast">
      <div v-if="showNotification" 
           class="fixed bottom-20 left-1/2 transform -translate-x-1/2 px-16 py-8 rounded-card shadow-floating z-50 animate-fade"
           :class="{
             'bg-success text-white': notificationType === 'success',
             'bg-error text-white': notificationType === 'error',
             'bg-charcoal text-light-gray': notificationType === 'info'
           }">
        {{ notificationMessage }}
      </div>
    </transition>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

button {
  cursor: pointer;
}

/* アニメーション用のユーティリティクラス */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateY(20px) translateX(-50%);
  opacity: 0;
}

/* アクセシビリティのためのユーティリティ */
.focus-visible:focus-visible {
  outline: 2px solid var(--color-primary-gold);
  outline-offset: 2px;
}

/* 要素のターゲット領域の拡大 */
.tap-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* レイアウト調整 - レスポンシブ対応 */
/* モバイル: 下部ナビゲーション対応 */
.main-content {
  /* ナビゲーション高さ分の余白 */
  padding-bottom: theme('spacing.20');
}

/* タブレット以上 */
@media (min-width: theme('screens.md')) {
  .main-content {
    padding-bottom: theme('spacing.16');
  }
}

/* デスクトップ: サイドナビゲーション対応 */
@media (min-width: theme('screens.lg')) {
  .main-content {
    width: calc(100% - theme('width.60'));
    margin-left: theme('width.60');
    padding-bottom: theme('spacing.8');
  }
}
</style>
