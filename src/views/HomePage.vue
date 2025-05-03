<script setup lang="ts">
import { ref } from 'vue';

const posts = ref([
  {
    id: 1,
    title: '氷の女王風コーデ',
    image: 'https://via.placeholder.com/300x300?text=Ice+Queen',
    user: 'ハンター1号',
    likes: 120
  },
  {
    id: 2,
    title: '炎のバーサーカースタイル',
    image: 'https://via.placeholder.com/300x300?text=Fire+Style',
    user: '装備マニア',
    likes: 85
  },
  {
    id: 3,
    title: '雷神コーデ',
    image: 'https://via.placeholder.com/300x300?text=Thunder+God',
    user: '重ね着ハンター',
    likes: 210
  },
]);
</script>

<template>
  <div class="home-page">
    <div class="header">
      <h1>HuntStyle</h1>
      <div class="search-bar">
        <input type="text" placeholder="重ね着を検索..." />
        <button>検索</button>
      </div>
      <div class="filters">
        <button class="filter-btn">最新</button>
        <button class="filter-btn">人気</button>
        <button class="filter-btn">フォロー中</button>
        <select class="filter-select">
          <option>武器種: すべて</option>
          <option>大剣</option>
          <option>太刀</option>
          <option>片手剣</option>
          <!-- その他の武器種 -->
        </select>
      </div>
    </div>

    <div class="posts-container">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <router-link :to="`/post/${post.id}`">
          <img :src="post.image" :alt="post.title" class="post-image" />
          <div class="post-info">
            <h3>{{ post.title }}</h3>
            <p>投稿者: {{ post.user }}</p>
            <p>♥ {{ post.likes }}</p>
          </div>
        </router-link>
      </div>
    </div>

    <div class="new-post-button">
      <router-link to="/post/new" class="add-post-btn">+</router-link>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.search-bar {
  display: flex;
  margin-bottom: 15px;
}

.search-bar input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
}

.search-bar button {
  padding: 8px 15px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-btn {
  padding: 5px 10px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.filter-btn:hover {
  background-color: #e0e0e0;
}

.filter-select {
  padding: 5px;
}

.posts-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.post-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.post-card:hover {
  transform: translateY(-5px);
}

.post-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.post-info {
  padding: 10px;
}

.new-post-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
}

.add-post-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background-color: #42b883;
  color: white;
  border-radius: 50%;
  font-size: 30px;
  text-decoration: none;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}
</style>