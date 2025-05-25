<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoaded = ref(false);

// フォームデータ
const title = ref('');
const description = ref('');
const selectedImages = ref<File[]>([]);
const imageUrls = ref<string[]>([]);
const tags = ref(['']);

// 装備情報
const equipment = ref({
  head: { name: '', rarity: 1, element: '' },
  chest: { name: '', rarity: 1, element: '' },
  arms: { name: '', rarity: 1, element: '' },
  waist: { name: '', rarity: 1, element: '' },
  legs: { name: '', rarity: 1, element: '' }
});

// スキル情報
const skills = ref([
  { name: '', level: 1, maxLevel: 5 }
]);

// 素材情報
const materials = ref([
  { name: '', quantity: 1, rarity: 1 }
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

// 画像の削除
const removeImage = (index: number) => {
  selectedImages.value.splice(index, 1);
  imageUrls.value.splice(index, 1);
};

// スキル行の追加
const addSkill = () => {
  skills.value.push({ name: '', level: 1, maxLevel: 5 });
};

// スキル行の削除
const removeSkill = (index: number) => {
  if (skills.value.length > 1) {
    skills.value.splice(index, 1);
  }
};

// 素材行の追加
const addMaterial = () => {
  materials.value.push({ name: '', quantity: 1, rarity: 1 });
};

// 素材行の削除
const removeMaterial = (index: number) => {
  if (materials.value.length > 1) {
    materials.value.splice(index, 1);
  }
};

// タグの追加
const addTag = () => {
  tags.value.push('');
};

// タグの削除
const removeTag = (index: number) => {
  if (tags.value.length > 1) {
    tags.value.splice(index, 1);
  }
};

// フォーム送信前のバリデーション
const isFormValid = () => {
  return title.value.trim() !== '' && 
         description.value.trim() !== '' && 
         imageUrls.value.length > 0 &&
         equipment.value.head.name.trim() !== '' &&
         equipment.value.chest.name.trim() !== '' &&
         equipment.value.arms.name.trim() !== '' &&
         equipment.value.waist.name.trim() !== '' &&
         equipment.value.legs.name.trim() !== '';
};

// 投稿送信
const submitPost = () => {
  if (!isFormValid()) {
    alert('必須項目を入力してください。');
    return;
  }

  // 実際の実装では、APIにデータを送信する処理を行う
  console.log({
    title: title.value,
    description: description.value,
    tags: tags.value.filter(tag => tag.trim() !== ''),
    equipment: equipment.value,
    skills: skills.value.filter(skill => skill.name.trim() !== ''),
    materials: materials.value.filter(material => material.name.trim() !== '')
  });
  
  // 成功時の処理
  alert('投稿が完了しました！');
  router.push('/');
};

// アニメーション
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true;
  }, 300);
});
</script>

<template>
  <div class="max-w-[900px] mx-auto pt-[70px] lg:pt-0 px-16 pb-64">
    <!-- ページヘッダー -->
    <div class="mb-48 transition-all duration-500"
         :class="{'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded}">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-16 mb-32">
        <h1 class="text-heading-lg font-display text-light-gray">新しい重ね着の投稿</h1>
        
        <router-link to="/" class="inline-flex items-center gap-8 text-light-gray hover:text-primary-gold transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>キャンセル</span>
        </router-link>
      </div>
    </div>

    <!-- フォーム -->
    <form @submit.prevent="submitPost" class="flex flex-col gap-40 transition-all duration-500 delay-100"
          :class="{'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded}">
      
      <!-- 基本情報セクション -->
      <div class="p-24 rounded-card bg-dark border border-primary-green/20 shadow-card">
        <h2 class="text-heading-sm font-display text-primary-gold mb-24">基本情報</h2>
        
        <div class="flex flex-col gap-24">
          <div>
            <label for="title" class="block text-caption text-light-gray/70 mb-8">タイトル <span class="text-bright-gold">*</span></label>
            <input 
              id="title" 
              v-model="title" 
              type="text" 
              required 
              placeholder="重ね着の名前やテーマを入力..." 
              class="w-full p-16 bg-charcoal border border-primary-gold/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
          </div>

          <div>
            <label for="description" class="block text-caption text-light-gray/70 mb-8">説明 <span class="text-bright-gold">*</span></label>
            <textarea 
              id="description" 
              v-model="description" 
              rows="4" 
              placeholder="重ね着の特徴や使いやすいシチュエーションなどを説明..." 
              class="w-full p-16 bg-charcoal border border-primary-gold/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold resize-none"></textarea>
          </div>
          
          <div>
            <label class="block text-caption text-light-gray/70 mb-8">タグ</label>
            <div class="flex flex-col gap-8">
              <div v-for="(_tag, index) in tags" :key="index" class="flex gap-8">
                <input 
                  v-model="tags[index]" 
                  type="text" 
                  :placeholder="index === 0 ? '例: 氷属性' : '追加のタグ'" 
                  class="flex-1 p-12 bg-charcoal border border-primary-gold/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
                
                <button 
                  type="button" 
                  @click="removeTag(index)" 
                  v-if="tags.length > 1" 
                  class="w-40 h-[44px] flex items-center justify-center rounded-md bg-dark border border-light-gray/20 text-light-gray hover:text-error transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                
                <button 
                  type="button" 
                  @click="addTag" 
                  v-if="index === tags.length - 1" 
                  class="w-40 h-[44px] flex items-center justify-center rounded-md bg-primary-gold/10 border border-primary-gold/30 text-primary-gold hover:bg-primary-gold/20 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 画像セクション -->
      <div class="p-24 rounded-card bg-dark border border-primary-green/20 shadow-card">
        <h2 class="text-heading-sm font-display text-primary-gold mb-24">画像 <span class="text-bright-gold">*</span></h2>
        
        <div class="flex flex-col gap-16">
          <div class="flex justify-center">
            <label for="images" class="flex flex-col items-center justify-center w-full md:w-[300px] h-[200px] border-2 border-dashed border-primary-gold/30 rounded-md cursor-pointer bg-charcoal hover:bg-charcoal/70 transition-colors duration-300 group">
              <div class="flex flex-col items-center justify-center gap-12">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-32 h-32 text-primary-gold/50 group-hover:text-primary-gold transition-colors duration-300">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="9" cy="9" r="2"></circle>
                  <path d="M21 15l-5-5L5 21"></path>
                </svg>
                <span class="text-caption text-light-gray/70 group-hover:text-light-gray transition-colors duration-300">クリックして画像をアップロード</span>
                <span class="text-[10px] text-light-gray/50">.jpg, .png, .gif (最大5MB)</span>
              </div>
            </label>
            <input id="images" type="file" accept="image/*" multiple @change="handleImageSelect" class="hidden">
          </div>
          
          <div v-if="imageUrls.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-16">
            <div v-for="(url, index) in imageUrls" :key="index" class="relative aspect-square overflow-hidden rounded-md border border-primary-gold/20 group">
              <img :src="url" :alt="`Preview ${index + 1}`" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-dark/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button 
                  type="button" 
                  @click="removeImage(index)" 
                  class="w-40 h-40 rounded-full bg-error/80 text-white flex items-center justify-center hover:bg-error transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-20 h-20">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 装備詳細セクション -->
      <div class="p-24 rounded-card bg-dark border border-primary-green/20 shadow-card">
        <h2 class="text-heading-sm font-display text-primary-gold mb-24">装備詳細 <span class="text-bright-gold">*</span></h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-16">
          <div class="p-16 rounded-md bg-charcoal border border-primary-gold/20 flex flex-col">
            <span class="text-caption text-light-gray/70 mb-8">頭</span>
            <input 
              v-model="equipment.head.name" 
              type="text" 
              placeholder="装備名" 
              class="p-8 mb-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
            
            <div class="flex gap-8">
              <div class="flex-1">
                <span class="text-caption text-light-gray/70 mb-2 block">レア度</span>
                <input 
                  v-model.number="equipment.head.rarity" 
                  type="number" 
                  min="1" 
                  max="10" 
                  class="w-full p-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
              </div>
              <div class="flex-1">
                <span class="text-caption text-light-gray/70 mb-2 block">属性</span>
                <input 
                  v-model="equipment.head.element" 
                  type="text" 
                  placeholder="例: 氷" 
                  class="w-full p-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
              </div>
            </div>
          </div>
          
          <div class="p-16 rounded-md bg-charcoal border border-primary-gold/20 flex flex-col">
            <span class="text-caption text-light-gray/70 mb-8">胴</span>
            <input 
              v-model="equipment.chest.name" 
              type="text" 
              placeholder="装備名" 
              class="p-8 mb-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
            
            <div class="flex gap-8">
              <div class="flex-1">
                <span class="text-caption text-light-gray/70 mb-2 block">レア度</span>
                <input 
                  v-model.number="equipment.chest.rarity" 
                  type="number" 
                  min="1" 
                  max="10" 
                  class="w-full p-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
              </div>
              <div class="flex-1">
                <span class="text-caption text-light-gray/70 mb-2 block">属性</span>
                <input 
                  v-model="equipment.chest.element" 
                  type="text" 
                  placeholder="例: 氷" 
                  class="w-full p-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
              </div>
            </div>
          </div>
          
          <div class="p-16 rounded-md bg-charcoal border border-primary-gold/20 flex flex-col">
            <span class="text-caption text-light-gray/70 mb-8">腕</span>
            <input 
              v-model="equipment.arms.name" 
              type="text" 
              placeholder="装備名" 
              class="p-8 mb-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
            
            <div class="flex gap-8">
              <div class="flex-1">
                <span class="text-caption text-light-gray/70 mb-2 block">レア度</span>
                <input 
                  v-model.number="equipment.arms.rarity" 
                  type="number" 
                  min="1" 
                  max="10" 
                  class="w-full p-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
              </div>
              <div class="flex-1">
                <span class="text-caption text-light-gray/70 mb-2 block">属性</span>
                <input 
                  v-model="equipment.arms.element" 
                  type="text" 
                  placeholder="例: 氷" 
                  class="w-full p-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
              </div>
            </div>
          </div>
          
          <div class="p-16 rounded-md bg-charcoal border border-primary-gold/20 flex flex-col">
            <span class="text-caption text-light-gray/70 mb-8">腰</span>
            <input 
              v-model="equipment.waist.name" 
              type="text" 
              placeholder="装備名" 
              class="p-8 mb-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
            
            <div class="flex gap-8">
              <div class="flex-1">
                <span class="text-caption text-light-gray/70 mb-2 block">レア度</span>
                <input 
                  v-model.number="equipment.waist.rarity" 
                  type="number" 
                  min="1" 
                  max="10" 
                  class="w-full p-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
              </div>
              <div class="flex-1">
                <span class="text-caption text-light-gray/70 mb-2 block">属性</span>
                <input 
                  v-model="equipment.waist.element" 
                  type="text" 
                  placeholder="例: 氷" 
                  class="w-full p-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
              </div>
            </div>
          </div>
          
          <div class="p-16 rounded-md bg-charcoal border border-primary-gold/20 flex flex-col">
            <span class="text-caption text-light-gray/70 mb-8">脚</span>
            <input 
              v-model="equipment.legs.name" 
              type="text" 
              placeholder="装備名" 
              class="p-8 mb-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
            
            <div class="flex gap-8">
              <div class="flex-1">
                <span class="text-caption text-light-gray/70 mb-2 block">レア度</span>
                <input 
                  v-model.number="equipment.legs.rarity" 
                  type="number" 
                  min="1" 
                  max="10" 
                  class="w-full p-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
              </div>
              <div class="flex-1">
                <span class="text-caption text-light-gray/70 mb-2 block">属性</span>
                <input 
                  v-model="equipment.legs.element" 
                  type="text" 
                  placeholder="例: 氷" 
                  class="w-full p-8 bg-dark border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- スキルセクション -->
      <div class="p-24 rounded-card bg-dark border border-primary-green/20 shadow-card">
        <h2 class="text-heading-sm font-display text-primary-gold mb-24">発動スキル</h2>
        
        <div class="flex flex-col gap-16">
          <div v-for="(skill, index) in skills" :key="index" class="flex flex-col sm:flex-row items-start gap-8">
            <input 
              v-model="skill.name" 
              type="text" 
              placeholder="スキル名" 
              class="flex-1 p-12 bg-charcoal border border-primary-gold/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
            
            <div class="flex items-center gap-8 w-full sm:w-auto">
              <div class="w-full sm:w-[100px]">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-caption text-light-gray/70">レベル</span>
                  <span class="text-caption text-primary-gold">{{ skill.level }}/{{ skill.maxLevel }}</span>
                </div>
                
                <input 
                  v-model.number="skill.level" 
                  type="range" 
                  min="1" 
                  :max="skill.maxLevel" 
                  class="w-full h-4 bg-charcoal appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-12 [&::-webkit-slider-thumb]:w-12 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-gold">
              </div>
              
              <div class="w-full sm:w-[80px]">
                <span class="text-caption text-light-gray/70 block mb-4">最大レベル</span>
                <input 
                  v-model.number="skill.maxLevel" 
                  type="number" 
                  min="1" 
                  max="10" 
                  class="w-full p-8 bg-charcoal border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
              </div>
              
              <div class="flex gap-8">
                <button 
                  type="button" 
                  @click="removeSkill(index)" 
                  class="w-40 h-[44px] flex items-center justify-center rounded-md bg-dark border border-light-gray/20 text-light-gray hover:text-error transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                
                <button 
                  v-if="index === skills.length - 1" 
                  type="button" 
                  @click="addSkill" 
                  class="w-40 h-[44px] flex items-center justify-center rounded-md bg-primary-gold/10 border border-primary-gold/30 text-primary-gold hover:bg-primary-gold/20 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 素材セクション -->
      <div class="p-24 rounded-card bg-dark border border-primary-green/20 shadow-card">
        <h2 class="text-heading-sm font-display text-primary-gold mb-24">必要素材</h2>
        
        <div class="flex flex-col gap-16">
          <div v-for="(material, index) in materials" :key="index" class="flex flex-col sm:flex-row items-start gap-8">
            <input 
              v-model="material.name" 
              type="text" 
              placeholder="素材名" 
              class="flex-1 p-12 bg-charcoal border border-primary-gold/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
            
            <div class="flex items-center gap-8 w-full sm:w-auto">
              <div class="w-full sm:w-[100px]">
                <span class="text-caption text-light-gray/70 block mb-4">個数</span>
                <input 
                  v-model.number="material.quantity" 
                  type="number" 
                  min="1" 
                  class="w-full p-8 bg-charcoal border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
              </div>
              
              <div class="w-full sm:w-[100px]">
                <span class="text-caption text-light-gray/70 block mb-4">レア度</span>
                <input 
                  v-model.number="material.rarity" 
                  type="number" 
                  min="1" 
                  max="10" 
                  class="w-full p-8 bg-charcoal border border-light-gray/20 rounded-md text-light-gray focus:outline-none focus:border-primary-gold">
              </div>
              
              <div class="flex gap-8">
                <button 
                  type="button" 
                  @click="removeMaterial(index)" 
                  class="w-40 h-[44px] flex items-center justify-center rounded-md bg-dark border border-light-gray/20 text-light-gray hover:text-error transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                
                <button 
                  v-if="index === materials.length - 1" 
                  type="button" 
                  @click="addMaterial" 
                  class="w-40 h-[44px] flex items-center justify-center rounded-md bg-primary-gold/10 border border-primary-gold/30 text-primary-gold hover:bg-primary-gold/20 transition-colors duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 送信ボタン -->
      <div class="flex justify-center">
        <button 
          type="submit" 
          class="py-16 px-64 rounded-full bg-gradient-to-r from-primary-gold to-bright-gold text-dark font-display font-bold text-heading-sm shadow-button hover:shadow-floating transform hover:scale-[1.03] transition-all duration-300 tap-target">
          投稿する
        </button>
      </div>
    </form>
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

/* アニメーション */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fade-in-up 0.5s ease-out forwards;
}
</style>
