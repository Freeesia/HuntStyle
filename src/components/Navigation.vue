<script setup lang="ts">
// 現在のページでアクティブなナビゲーションアイテムをハイライトするために使用します
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <nav class="navigation">
    <div class="nav-container">
      <div class="nav-logo">
        <router-link to="/">
          <h1>HuntStyle</h1>
        </router-link>
      </div>
      
      <div class="nav-links">
        <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
          <i class="nav-icon">🏠</i>
          <span>ホーム</span>
        </router-link>
        
        <router-link to="/favorites" class="nav-item" :class="{ active: route.path === '/favorites' }">
          <i class="nav-icon">❤️</i>
          <span>お気に入り</span>
        </router-link>
        
        <router-link to="/equipment" class="nav-item" :class="{ active: route.path === '/equipment' }">
          <i class="nav-icon">⚔️</i>
          <span>所持装備</span>
        </router-link>
        
        <router-link to="/profile/1" class="nav-item" :class="{ active: route.path.startsWith('/profile') }">
          <i class="nav-icon">👤</i>
          <span>プロフィール</span>
        </router-link>
      </div>
      
      <div class="nav-user">
        <router-link to="/post/new" class="new-post-link">
          <button class="new-post-btn">投稿</button>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navigation {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo h1 {
  margin: 0;
  color: #42b883;
  font-size: 1.5rem;
}

.nav-logo a {
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #666;
  transition: color 0.3s;
  font-size: 0.9rem;
}

.nav-item.active {
  color: #42b883;
}

.nav-item:hover {
  color: #42b883;
}

.nav-icon {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.new-post-btn {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.new-post-btn:hover {
  background-color: #3ba676;
}

@media (max-width: 600px) {
  .nav-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .nav-links {
    width: 100%;
    justify-content: space-around;
  }
  
  .nav-user {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
</style>