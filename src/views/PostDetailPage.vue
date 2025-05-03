<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const postId = computed(() => route.params.id);

// モックデータ
const post = ref({
  id: postId,
  title: '氷の女王風コーデ',
  description: '氷属性が強化されるこの重ね着は、見た目も美しく実用性も高いです。雪山でのハンティングにオススメ！',
  images: ['https://via.placeholder.com/800x500?text=Ice+Queen+Style'],
  user: {
    name: 'ハンター1号',
    avatar: 'https://via.placeholder.com/50x50'
  },
  likes: 120,
  comments: [
    { id: 1, user: 'モンハン大好き', text: 'かっこいい！', timestamp: '2時間前' },
    { id: 2, user: '防具収集家', text: '素材はどこで手に入りますか？', timestamp: '1時間前' }
  ],
  equipment: {
    head: { name: '雪風ヘルム', rarity: 8 },
    chest: { name: '氷結マント', rarity: 9 },
    arms: { name: '霧氷の篭手', rarity: 8 },
    waist: { name: '雪山のベルト', rarity: 7 },
    legs: { name: 'フロストグリーヴ', rarity: 9 }
  },
  skills: [
    { name: '氷属性攻撃強化', level: 5 },
    { name: '見切り', level: 3 },
    { name: '体力増強', level: 2 }
  ],
  materials: [
    { name: '氷竜の鱗', quantity: 5 },
    { name: '凍て肉の塊', quantity: 3 },
    { name: '霜降りの皮', quantity: 2 },
    { name: '氷結晶', quantity: 8 }
  ]
});

// 自分が装備可能かどうか（モック）
const canEquip = ref(false);
</script>

<template>
  <div class="post-detail">
    <div class="back-button">
      <router-link to="/">← 戻る</router-link>
    </div>

    <div class="post-header">
      <h1>{{ post.title }}</h1>
      <div class="post-meta">
        <div class="user-info">
          <img :src="post.user.avatar" :alt="post.user.name" class="user-avatar">
          <span>{{ post.user.name }}</span>
        </div>
        <div class="actions">
          <button class="like-btn">♥ {{ post.likes }}</button>
          <button class="share-btn">共有</button>
        </div>
      </div>
    </div>

    <div class="post-images">
      <img v-for="(image, index) in post.images" :key="index" :src="image" :alt="`${post.title} ${index+1}`" class="post-image">
    </div>

    <div class="post-description">
      <p>{{ post.description }}</p>
    </div>

    <div class="equipment-section">
      <h2>装備詳細</h2>
      <div class="equipment-alert" :class="{ 'can-equip': canEquip }">
        {{ canEquip ? '✓ 装備可能です' : '✗ 一部の装備を所持していません' }}
      </div>
      
      <div class="equipment-list">
        <div class="equipment-item">
          <h3>頭：{{ post.equipment.head.name }}</h3>
          <span class="rarity">レア度 {{ post.equipment.head.rarity }}</span>
        </div>
        <div class="equipment-item">
          <h3>胴：{{ post.equipment.chest.name }}</h3>
          <span class="rarity">レア度 {{ post.equipment.chest.rarity }}</span>
        </div>
        <div class="equipment-item">
          <h3>腕：{{ post.equipment.arms.name }}</h3>
          <span class="rarity">レア度 {{ post.equipment.arms.rarity }}</span>
        </div>
        <div class="equipment-item">
          <h3>腰：{{ post.equipment.waist.name }}</h3>
          <span class="rarity">レア度 {{ post.equipment.waist.rarity }}</span>
        </div>
        <div class="equipment-item">
          <h3>脚：{{ post.equipment.legs.name }}</h3>
          <span class="rarity">レア度 {{ post.equipment.legs.rarity }}</span>
        </div>
      </div>

      <div class="skills-section">
        <h2>発動スキル</h2>
        <div class="skills-list">
          <div v-for="skill in post.skills" :key="skill.name" class="skill-item">
            <span class="skill-name">{{ skill.name }}</span>
            <span class="skill-level">Lv.{{ skill.level }}</span>
          </div>
        </div>
      </div>

      <div class="materials-section">
        <h2>必要素材</h2>
        <div class="materials-list">
          <div v-for="material in post.materials" :key="material.name" class="material-item">
            <span class="material-name">{{ material.name }}</span>
            <span class="material-quantity">x{{ material.quantity }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="comments-section">
      <h2>コメント</h2>
      <div class="comment-form">
        <input type="text" placeholder="コメントを追加...">
        <button>送信</button>
      </div>
      <div class="comments-list">
        <div v-for="comment in post.comments" :key="comment.id" class="comment-item">
          <div class="comment-user">{{ comment.user }}</div>
          <div class="comment-text">{{ comment.text }}</div>
          <div class="comment-timestamp">{{ comment.timestamp }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-detail {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.back-button {
  margin-bottom: 20px;
}

.post-header {
  margin-bottom: 20px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.actions {
  display: flex;
  gap: 10px;
}

.like-btn, .share-btn {
  padding: 8px 15px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.like-btn:hover, .share-btn:hover {
  background-color: #e0e0e0;
}

.post-images {
  margin-bottom: 20px;
}

.post-image {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 10px;
}

.post-description {
  margin-bottom: 30px;
}

.equipment-section {
  margin-bottom: 30px;
}

.equipment-alert {
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
  background-color: #ffdddd;
  color: #d32f2f;
}

.equipment-alert.can-equip {
  background-color: #ddffdd;
  color: #388e3c;
}

.equipment-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.equipment-item {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.rarity {
  color: #ff9800;
}

.skills-section, .materials-section {
  margin-bottom: 30px;
}

.skills-list, .materials-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}

.skill-item, .material-item {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
}

.comment-form {
  display: flex;
  margin-bottom: 20px;
}

.comment-form input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
}

.comment-form button {
  padding: 8px 15px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.comment-user {
  font-weight: bold;
  margin-bottom: 5px;
}

.comment-timestamp {
  font-size: 0.8rem;
  color: #888;
  margin-top: 5px;
}
</style>