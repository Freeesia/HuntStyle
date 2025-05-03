<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const userId = computed(() => route.params.id);

// モックデータ
const user = ref({
  id: userId,
  name: 'ハンター1号',
  avatar: 'https://via.placeholder.com/150x150',
  bio: 'モンハンワイルズ歴5年。重ね着コーディネートが大好きです。特に氷属性装備のコレクターです。',
  followers: 245,
  following: 128,
  posts: [
    {
      id: 1,
      title: '氷の女王風コーデ',
      image: 'https://via.placeholder.com/300x300?text=Ice+Queen',
      likes: 120
    },
    {
      id: 2,
      title: '古龍風の装備',
      image: 'https://via.placeholder.com/300x300?text=Elder+Dragon',
      likes: 85
    },
    {
      id: 3,
      title: '雪山探索スタイル',
      image: 'https://via.placeholder.com/300x300?text=Snow+Mountain',
      likes: 67
    }
  ],
  favorites: [
    {
      id: 4,
      title: '炎のバーサーカースタイル',
      image: 'https://via.placeholder.com/300x300?text=Fire+Style',
      likes: 92
    },
    {
      id: 5,
      title: '雷神コーデ',
      image: 'https://via.placeholder.com/300x300?text=Thunder+God',
      likes: 210
    }
  ]
});

const activeTab = ref('posts'); // 'posts' または 'favorites'
const isFollowing = ref(false);

const toggleFollow = () => {
  isFollowing.value = !isFollowing.value;
};
</script>

<template>
  <div class="profile-page">
    <div class="profile-header">
      <router-link to="/" class="back-link">← ホームに戻る</router-link>
      
      <div class="profile-info">
        <img :src="user.avatar" :alt="user.name" class="profile-avatar">
        
        <div class="profile-details">
          <h1>{{ user.name }}</h1>
          <p class="bio">{{ user.bio }}</p>
          
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">{{ user.posts.length }}</span>
              <span class="stat-label">投稿</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ user.followers }}</span>
              <span class="stat-label">フォロワー</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ user.following }}</span>
              <span class="stat-label">フォロー中</span>
            </div>
          </div>
          
          <button @click="toggleFollow" class="follow-btn" :class="{ 'following': isFollowing }">
            {{ isFollowing ? 'フォロー中' : 'フォローする' }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="content-tabs">
      <button 
        @click="activeTab = 'posts'" 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'posts' }">
        投稿
      </button>
      <button 
        @click="activeTab = 'favorites'" 
        class="tab-btn" 
        :class="{ 'active': activeTab === 'favorites' }">
        お気に入り
      </button>
    </div>
    
    <div v-if="activeTab === 'posts'" class="posts-grid">
      <div v-for="post in user.posts" :key="post.id" class="post-item">
        <router-link :to="`/post/${post.id}`">
          <img :src="post.image" :alt="post.title" class="post-image">
          <div class="post-overlay">
            <h3>{{ post.title }}</h3>
            <p>♥ {{ post.likes }}</p>
          </div>
        </router-link>
      </div>
    </div>
    
    <div v-else-if="activeTab === 'favorites'" class="posts-grid">
      <div v-for="post in user.favorites" :key="post.id" class="post-item">
        <router-link :to="`/post/${post.id}`">
          <img :src="post.image" :alt="post.title" class="post-image">
          <div class="post-overlay">
            <h3>{{ post.title }}</h3>
            <p>♥ {{ post.likes }}</p>
          </div>
        </router-link>
      </div>
    </div>
    
    <div class="equipment-link">
      <router-link to="/equipment" class="equipment-btn">
        所持装備を管理する
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.back-link {
  display: inline-block;
  margin-bottom: 20px;
  color: #333;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.profile-header {
  margin-bottom: 30px;
}

.profile-info {
  display: flex;
  align-items: flex-start;
  gap: 30px;
}

.profile-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-details {
  flex: 1;
}

.profile-details h1 {
  margin-bottom: 10px;
}

.bio {
  margin-bottom: 15px;
  color: #555;
}

.profile-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-weight: bold;
  font-size: 1.2rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.follow-btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.follow-btn:not(.following) {
  background-color: #42b883;
  color: white;
}

.follow-btn.following {
  background-color: #f1f1f1;
  color: #333;
}

.content-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  font-weight: bold;
  cursor: pointer;
  position: relative;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #42b883;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.post-item {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1/1;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
}

.equipment-link {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.equipment-btn {
  padding: 10px 20px;
  background-color: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.equipment-btn:hover {
  background-color: #3ba676;
}
</style>