<script setup lang="ts">
import { ref } from 'vue';

const title = ref('');
const description = ref('');
const selectedImages = ref<File[]>([]);
const imageUrls = ref<string[]>([]);

// 装備情報
const equipment = ref({
  head: { name: '', rarity: 1 },
  chest: { name: '', rarity: 1 },
  arms: { name: '', rarity: 1 },
  waist: { name: '', rarity: 1 },
  legs: { name: '', rarity: 1 }
});

// スキル情報
const skills = ref([
  { name: '', level: 1 }
]);

// 素材情報
const materials = ref([
  { name: '', quantity: 1 }
]);

// 画像選択ハンドラ
const handleImageSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      selectedImages.value.push(file);
      
      // プレビュー用にURLを生成
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          imageUrls.value.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }
};

// スキル行の追加
const addSkill = () => {
  skills.value.push({ name: '', level: 1 });
};

// 素材行の追加
const addMaterial = () => {
  materials.value.push({ name: '', quantity: 1 });
};

// 投稿送信
const submitPost = () => {
  // 実際の実装では、APIにデータを送信する処理を行う
  console.log({
    title: title.value,
    description: description.value,
    equipment: equipment.value,
    skills: skills.value,
    materials: materials.value
  });
  alert('投稿が完了しました！');
};
</script>

<template>
  <div class="new-post-page">
    <div class="page-header">
      <h1>新しい重ね着の投稿</h1>
      <router-link to="/" class="cancel-link">キャンセル</router-link>
    </div>

    <form @submit.prevent="submitPost" class="post-form">
      <div class="form-section">
        <h2>基本情報</h2>
        <div class="form-group">
          <label for="title">タイトル</label>
          <input id="title" v-model="title" type="text" required placeholder="重ね着の名前やテーマを入力...">
        </div>

        <div class="form-group">
          <label for="description">説明</label>
          <textarea id="description" v-model="description" rows="3" placeholder="重ね着の特徴や使いやすいシチュエーションなどを説明..."></textarea>
        </div>
      </div>

      <div class="form-section">
        <h2>画像</h2>
        <div class="image-upload">
          <label for="images" class="upload-label">
            <div class="upload-icon">+</div>
            <div>画像をアップロード</div>
          </label>
          <input id="images" type="file" accept="image/*" multiple @change="handleImageSelect" class="file-input">
        </div>
        
        <div v-if="imageUrls.length > 0" class="image-preview">
          <div v-for="(url, index) in imageUrls" :key="index" class="preview-item">
            <img :src="url" :alt="`Preview ${index + 1}`">
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2>装備詳細</h2>
        
        <div class="equipment-form">
          <div class="form-group">
            <label>頭装備</label>
            <input v-model="equipment.head.name" type="text" placeholder="装備名">
            <input v-model.number="equipment.head.rarity" type="number" min="1" max="10" placeholder="レア度">
          </div>
          
          <div class="form-group">
            <label>胴装備</label>
            <input v-model="equipment.chest.name" type="text" placeholder="装備名">
            <input v-model.number="equipment.chest.rarity" type="number" min="1" max="10" placeholder="レア度">
          </div>
          
          <div class="form-group">
            <label>腕装備</label>
            <input v-model="equipment.arms.name" type="text" placeholder="装備名">
            <input v-model.number="equipment.arms.rarity" type="number" min="1" max="10" placeholder="レア度">
          </div>
          
          <div class="form-group">
            <label>腰装備</label>
            <input v-model="equipment.waist.name" type="text" placeholder="装備名">
            <input v-model.number="equipment.waist.rarity" type="number" min="1" max="10" placeholder="レア度">
          </div>
          
          <div class="form-group">
            <label>脚装備</label>
            <input v-model="equipment.legs.name" type="text" placeholder="装備名">
            <input v-model.number="equipment.legs.rarity" type="number" min="1" max="10" placeholder="レア度">
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2>発動スキル</h2>
        <div v-for="(skill, index) in skills" :key="index" class="skill-row">
          <input v-model="skill.name" type="text" placeholder="スキル名">
          <input v-model.number="skill.level" type="number" min="1" max="10" placeholder="レベル">
          <button type="button" v-if="index === skills.length - 1" @click="addSkill" class="add-btn">+</button>
        </div>
      </div>

      <div class="form-section">
        <h2>必要素材</h2>
        <div v-for="(material, index) in materials" :key="index" class="material-row">
          <input v-model="material.name" type="text" placeholder="素材名">
          <input v-model.number="material.quantity" type="number" min="1" placeholder="個数">
          <button type="button" v-if="index === materials.length - 1" @click="addMaterial" class="add-btn">+</button>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-btn">投稿する</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.new-post-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.cancel-link {
  color: #666;
  text-decoration: none;
}

.cancel-link:hover {
  text-decoration: underline;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"],
input[type="number"],
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  resize: vertical;
}

.image-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 150px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-label:hover {
  border-color: #42b883;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.file-input {
  display: none;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-item {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 4px;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.equipment-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.equipment-form .form-group {
  display: grid;
  grid-template-columns: 100px 2fr 1fr;
  gap: 10px;
  align-items: center;
}

.equipment-form label {
  margin-bottom: 0;
}

.skill-row, .material-row {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: 10px;
  margin-bottom: 10px;
}

.add-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #42b883;
  color: white;
  border: none;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.submit-btn {
  padding: 12px 30px;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #3ba676;
}

@media (max-width: 600px) {
  .equipment-form .form-group {
    grid-template-columns: 1fr;
  }

  .skill-row, .material-row {
    grid-template-columns: 1fr 80px auto;
  }
}
</style>