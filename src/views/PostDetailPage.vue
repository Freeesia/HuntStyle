<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const postId = computed(() => route.params.id);

const isLoaded = ref(false);
const isLiked = ref(false);
const showCommentForm = ref(false);
const newComment = ref('');
const activeTab = ref('details'); // 'details', 'materials', 'comments'

// モックデータ
const post = ref({
  id: postId,
  title: '氷の女王風コーデ',
  description: '氷属性が強化されるこの重ね着は、見た目も美しく実用性も高いです。雪山でのハンティングにオススメ！最大の特徴は氷属性攻撃強化Lv5で、アイスボーンのラスボスから入手できる素材を使用しています。ぜひマスターランク100以上で挑戦してみてください。',
  images: [
    'https://via.placeholder.com/800x500?text=Ice+Queen+Style+1',
    'https://via.placeholder.com/800x500?text=Ice+Queen+Style+2',
    'https://via.placeholder.com/800x500?text=Ice+Queen+Style+3'
  ],
  user: {
    id: 'hunter1',
    name: 'ハンター1号',
    avatar: 'https://via.placeholder.com/50x50'
  },
  likes: 120,
  tags: ['氷属性', '女王', 'エレガント', '実用向け'],
  created: '2023-06-15',
  comments: [
    { id: 1, user: { name: 'モンハン大好き', avatar: 'https://via.placeholder.com/40x40' }, text: 'かっこいい！ぜひ真似してみたいです。', timestamp: '2時間前' },
    { id: 2, user: { name: '防具収集家', avatar: 'https://via.placeholder.com/40x40' }, text: '素材はどこで手に入りますか？特にフロストグリーヴがなかなか出ないのですが...', timestamp: '1時間前' },
    { id: 3, user: { name: 'ハンター1号', avatar: 'https://via.placeholder.com/50x50' }, text: '@防具収集家 イベントクエスト「氷の女王の帰還」をマルチで3回ほど周回すると高確率で出ますよ！', timestamp: '30分前' }
  ],
  equipment: {
    head: { name: '雪風ヘルム', rarity: 8, element: '氷' },
    chest: { name: '氷結マント', rarity: 9, element: '氷' },
    arms: { name: '霧氷の篭手', rarity: 8, element: '氷' },
    waist: { name: '雪山のベルト', rarity: 7, element: '氷' },
    legs: { name: 'フロストグリーヴ', rarity: 9, element: '氷' }
  },
  skills: [
    { name: '氷属性攻撃強化', level: 5, maxLevel: 5 },
    { name: '見切り', level: 3, maxLevel: 7 },
    { name: '体力増強', level: 2, maxLevel: 3 },
    { name: '耐寒', level: 3, maxLevel: 3 },
    { name: '回避性能', level: 2, maxLevel: 5 },
  ],
  materials: [
    { name: '氷竜の鱗', quantity: 5, rarity: 6, image: 'https://via.placeholder.com/40x40?text=Ice' },
    { name: '凍て肉の塊', quantity: 3, rarity: 7, image: 'https://via.placeholder.com/40x40?text=Meat' },
    { name: '霜降りの皮', quantity: 2, rarity: 8, image: 'https://via.placeholder.com/40x40?text=Skin' },
    { name: '氷結晶', quantity: 8, rarity: 5, image: 'https://via.placeholder.com/40x40?text=Crystal' },
    { name: '古龍の血', quantity: 1, rarity: 9, image: 'https://via.placeholder.com/40x40?text=Blood' }
  ]
});

// 自分が装備可能かどうか（モック）
const canEquip = ref(false);

const toggleLike = () => {
  isLiked.value = !isLiked.value;
  if (isLiked.value) {
    post.value.likes++;
  } else {
    post.value.likes--;
  }
};

const addComment = () => {
  if (newComment.value.trim()) {
    post.value.comments.unshift({
      id: post.value.comments.length + 1,
      user: { name: 'あなた', avatar: 'https://via.placeholder.com/40x40?text=You' },
      text: newComment.value,
      timestamp: 'たった今'
    });
    newComment.value = '';
    showCommentForm.value = false;
  }
};

// 現在のイメージのインデックス管理
const currentImageIndex = ref(0);
const showNextImage = () => {
  if (currentImageIndex.value < post.value.images.length - 1) {
    currentImageIndex.value++;
  }
};
const showPrevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

// スキルレベルのバー表示用
const getSkillLevelBarWidth = (level: number, maxLevel: number) => {
  return `${(level / maxLevel) * 100}%`;
};

// アニメーション
onMounted(() => {
  setTimeout(() => {
    isLoaded.value = true;
  }, 300);
});
</script>

<template>
  <div class="max-w-[1000px] mx-auto pt-[70px] lg:pt-0 px-16">
    <!-- 戻るボタン -->
    <div class="mt-24 mb-32">
      <button 
        @click="router.go(-1)" 
        class="inline-flex items-center gap-8 text-light-gray hover:text-primary-gold transition-colors duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>戻る</span>
      </button>
    </div>

    <!-- 投稿ヘッダー -->
    <div class="mb-32 transition-all duration-500" :class="{'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded}">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 gap-16">
        <h1 class="text-heading-lg font-display text-light-gray">{{ post.title }}</h1>
        
        <div class="flex items-center gap-16">
          <button 
            @click="toggleLike" 
            class="flex items-center gap-8 px-16 py-8 rounded-full border tap-target transition-all duration-300"
            :class="isLiked ? 'bg-primary-gold/10 border-primary-gold text-primary-gold' : 'bg-charcoal border-light-gray/20 text-light-gray hover:border-primary-gold/50 hover:text-primary-gold'">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" class="w-20 h-20" :class="{'animate-heart-beat': isLiked}">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>{{ post.likes }}</span>
          </button>
          
          <button class="flex items-center gap-8 px-16 py-8 rounded-full bg-charcoal border border-light-gray/20 text-light-gray tap-target hover:border-primary-gold/50 hover:text-primary-gold transition-all duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-20 h-20">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
            <span>共有</span>
          </button>
        </div>
      </div>
      
      <!-- 投稿者情報 -->
      <div class="flex items-center gap-16 mb-32">
        <router-link :to="`/profile/${post.user.id}`" class="flex items-center gap-12 tap-target">
          <img :src="post.user.avatar" :alt="post.user.name" class="w-[40px] h-[40px] rounded-full border-2 border-primary-gold/30">
          <span class="font-medium text-light-gray">{{ post.user.name }}</span>
        </router-link>
        <span class="text-caption text-light-gray/50">{{ post.created }}</span>
      </div>
      
      <!-- タグ -->
      <div class="flex flex-wrap gap-8 mb-24">
        <span 
          v-for="tag in post.tags" 
          :key="tag" 
          class="px-12 py-4 bg-primary-gold/10 text-primary-gold text-caption rounded-full">
          #{{ tag }}
        </span>
      </div>
    </div>

    <!-- イメージギャラリー -->
    <div class="relative mb-48 rounded-card overflow-hidden shadow-floating transition-all duration-500" 
        :class="{'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded}">
      <div class="relative aspect-video">
        <img 
          :src="post.images[currentImageIndex]" 
          :alt="`${post.title} ${currentImageIndex + 1}`" 
          class="w-full h-full object-cover"
        >
        
        <!-- 画像ナビゲーション -->
        <div class="absolute inset-0 flex items-center justify-between p-16 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <button 
            v-if="currentImageIndex > 0" 
            @click="showPrevImage" 
            class="w-40 h-40 rounded-full bg-dark/70 flex items-center justify-center text-light-gray hover:bg-primary-gold hover:text-dark transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button 
            v-if="currentImageIndex < post.images.length - 1" 
            @click="showNextImage" 
            class="w-40 h-40 rounded-full bg-dark/70 flex items-center justify-center text-light-gray hover:bg-primary-gold hover:text-dark transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-24 h-24">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        
        <!-- 画像インジケーター -->
        <div class="absolute bottom-16 left-0 right-0 flex justify-center gap-8">
          <button 
            v-for="(_, index) in post.images" 
            :key="index" 
            @click="currentImageIndex = index" 
            class="w-8 h-8 rounded-full transition-all duration-300"
            :class="currentImageIndex === index ? 'bg-primary-gold w-16' : 'bg-light-gray/50 hover:bg-light-gray'">
          </button>
        </div>
      </div>
    </div>

    <!-- 説明文 -->
    <div class="mb-32 text-light-gray transition-all duration-500 delay-100" 
        :class="{'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded}">
      <p class="text-body leading-relaxed">{{ post.description }}</p>
    </div>

    <!-- タブセクション -->
    <div class="mb-24 transition-all duration-500 delay-200"
        :class="{'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded}">
      <div class="flex border-b border-primary-green/20">
        <button 
          @click="activeTab = 'details'" 
          class="pb-8 px-16 relative text-body font-medium transition-colors duration-300"
          :class="activeTab === 'details' ? 'text-primary-gold' : 'text-light-gray hover:text-primary-gold/70'">
          装備詳細
          <div v-if="activeTab === 'details'" class="absolute bottom-0 left-0 w-full h-[2px] bg-primary-gold"></div>
        </button>
        <button
          @click="activeTab = 'materials'" 
          class="pb-8 px-16 relative text-body font-medium transition-colors duration-300"
          :class="activeTab === 'materials' ? 'text-primary-gold' : 'text-light-gray hover:text-primary-gold/70'">
          素材
          <div v-if="activeTab === 'materials'" class="absolute bottom-0 left-0 w-full h-[2px] bg-primary-gold"></div>
        </button>
        <button
          @click="activeTab = 'comments'" 
          class="pb-8 px-16 relative text-body font-medium transition-colors duration-300"
          :class="activeTab === 'comments' ? 'text-primary-gold' : 'text-light-gray hover:text-primary-gold/70'">
          コメント
          <div v-if="activeTab === 'comments'" class="absolute bottom-0 left-0 w-full h-[2px] bg-primary-gold"></div>
        </button>
      </div>
    </div>

    <!-- タブコンテンツ -->
    <div class="transition-all duration-500 delay-300"
        :class="{'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded}">
      <!-- 装備詳細タブ -->
      <div v-if="activeTab === 'details'" class="flex flex-col gap-32">
        <div class="p-16 rounded-card bg-dark border border-primary-green/20">
          <div class="flex items-center gap-12 mb-16">
            <div class="w-8 h-8 rounded-full" :class="canEquip ? 'bg-sage-green' : 'bg-bright-gold'"></div>
            <span class="text-caption" :class="canEquip ? 'text-sage-green' : 'text-bright-gold'">
              {{ canEquip ? '✓ 装備可能です' : '✗ 一部の装備を所持していません' }}
            </span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
            <div class="p-16 rounded-md bg-charcoal border border-primary-gold/20 flex flex-col">
              <span class="text-caption text-light-gray/70 mb-4">頭</span>
              <span class="text-body font-medium text-light-gray mb-8">{{ post.equipment.head.name }}</span>
              <div class="mt-auto flex items-center justify-between">
                <span class="text-caption text-primary-gold">レア {{ post.equipment.head.rarity }}</span>
                <span class="px-8 py-2 rounded-full text-xs bg-primary-gold/20 text-primary-gold">{{ post.equipment.head.element }}</span>
              </div>
            </div>
            
            <div class="p-16 rounded-md bg-charcoal border border-primary-gold/20 flex flex-col">
              <span class="text-caption text-light-gray/70 mb-4">胴</span>
              <span class="text-body font-medium text-light-gray mb-8">{{ post.equipment.chest.name }}</span>
              <div class="mt-auto flex items-center justify-between">
                <span class="text-caption text-primary-gold">レア {{ post.equipment.chest.rarity }}</span>
                <span class="px-8 py-2 rounded-full text-xs bg-primary-gold/20 text-primary-gold">{{ post.equipment.chest.element }}</span>
              </div>
            </div>
            
            <div class="p-16 rounded-md bg-charcoal border border-primary-gold/20 flex flex-col">
              <span class="text-caption text-light-gray/70 mb-4">腕</span>
              <span class="text-body font-medium text-light-gray mb-8">{{ post.equipment.arms.name }}</span>
              <div class="mt-auto flex items-center justify-between">
                <span class="text-caption text-primary-gold">レア {{ post.equipment.arms.rarity }}</span>
                <span class="px-8 py-2 rounded-full text-xs bg-primary-gold/20 text-primary-gold">{{ post.equipment.arms.element }}</span>
              </div>
            </div>
            
            <div class="p-16 rounded-md bg-charcoal border border-primary-gold/20 flex flex-col">
              <span class="text-caption text-light-gray/70 mb-4">腰</span>
              <span class="text-body font-medium text-light-gray mb-8">{{ post.equipment.waist.name }}</span>
              <div class="mt-auto flex items-center justify-between">
                <span class="text-caption text-primary-gold">レア {{ post.equipment.waist.rarity }}</span>
                <span class="px-8 py-2 rounded-full text-xs bg-primary-gold/20 text-primary-gold">{{ post.equipment.waist.element }}</span>
              </div>
            </div>
            
            <div class="p-16 rounded-md bg-charcoal border border-primary-gold/20 flex flex-col">
              <span class="text-caption text-light-gray/70 mb-4">脚</span>
              <span class="text-body font-medium text-light-gray mb-8">{{ post.equipment.legs.name }}</span>
              <div class="mt-auto flex items-center justify-between">
                <span class="text-caption text-primary-gold">レア {{ post.equipment.legs.rarity }}</span>
                <span class="px-8 py-2 rounded-full text-xs bg-primary-gold/20 text-primary-gold">{{ post.equipment.legs.element }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- スキルセクション -->
        <div class="p-24 rounded-card bg-dark border border-primary-green/20">
          <h3 class="text-heading-sm font-display text-primary-gold mb-24">発動スキル</h3>
          <div class="flex flex-col gap-16">
            <div v-for="skill in post.skills" :key="skill.name" class="flex flex-col">
              <div class="flex items-center justify-between mb-8">
                <span class="text-body text-light-gray">{{ skill.name }}</span>
                <span class="text-caption text-primary-gold">Lv.{{ skill.level }}/{{ skill.maxLevel }}</span>
              </div>
              <div class="h-8 bg-charcoal rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-primary-gold to-bright-gold transition-all duration-500 ease-out"
                  :style="{ width: getSkillLevelBarWidth(skill.level, skill.maxLevel) }">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 素材タブ -->
      <div v-else-if="activeTab === 'materials'" class="p-24 rounded-card bg-dark border border-primary-green/20">
        <h3 class="text-heading-sm font-display text-primary-gold mb-24">必要素材</h3>
        
        <div class="flex flex-col gap-16">
          <div v-for="material in post.materials" :key="material.name" 
              class="flex items-center gap-16 p-16 rounded-md bg-charcoal border border-primary-gold/10">
            <div class="w-[40px] h-[40px] rounded-md overflow-hidden bg-primary-gold/20">
              <img :src="material.image" :alt="material.name" class="w-full h-full object-cover">
            </div>
            
            <div class="flex-1">
              <div class="flex items-center gap-8">
                <span class="text-body font-medium text-light-gray">{{ material.name }}</span>
                <div class="flex">
                  <span v-for="i in material.rarity" :key="i" class="text-[8px] text-primary-gold">★</span>
                </div>
              </div>
            </div>
            
            <div class="px-12 py-4 rounded-full bg-primary-gold/10 text-primary-gold">
              x{{ material.quantity }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- コメントタブ -->
      <div v-else-if="activeTab === 'comments'" class="flex flex-col gap-16">
        <!-- コメントフォーム -->
        <div class="flex flex-col gap-12 p-16 rounded-card bg-dark border border-primary-green/20">
          <div v-if="!showCommentForm" class="flex justify-between items-center">
            <span class="text-light-gray">コメントを残す</span>
            <button 
              @click="showCommentForm = true" 
              class="py-8 px-16 rounded-full bg-primary-gold text-dark font-medium shadow-button hover:shadow-floating transform hover:scale-[1.03] transition-all duration-300">
              コメントを書く
            </button>
          </div>
          
          <div v-else class="flex flex-col gap-12">
            <textarea 
              v-model="newComment" 
              placeholder="コメントを入力..." 
              class="w-full p-16 rounded-md bg-charcoal text-light-gray border border-primary-gold/20 focus:border-primary-gold outline-none resize-none"
              rows="3"
            ></textarea>
            
            <div class="flex justify-end gap-12">
              <button 
                @click="showCommentForm = false" 
                class="py-8 px-16 rounded-full bg-charcoal text-light-gray hover:text-primary-gold transition-colors duration-300">
                キャンセル
              </button>
              <button 
                @click="addComment" 
                class="py-8 px-16 rounded-full bg-gradient-to-r from-primary-gold to-bright-gold text-dark font-medium shadow-button hover:shadow-floating transform hover:scale-[1.03] transition-all duration-300">
                投稿する
              </button>
            </div>
          </div>
        </div>
        
        <!-- コメントリスト -->
        <div class="flex flex-col gap-16">
          <div v-for="comment in post.comments" :key="comment.id" class="p-16 rounded-card bg-dark border border-primary-green/20">
            <div class="flex items-start gap-12 mb-12">
              <img :src="comment.user.avatar" :alt="comment.user.name" class="w-[32px] h-[32px] rounded-full">
              
              <div class="flex-1">
                <div class="flex items-center gap-8">
                  <span class="font-medium text-light-gray">{{ comment.user.name }}</span>
                  <span class="text-caption text-light-gray/50">{{ comment.timestamp }}</span>
                </div>
                
                <p class="mt-8 text-light-gray">{{ comment.text }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-16 pl-[44px]">
              <button class="text-caption text-light-gray/70 hover:text-primary-gold transition-colors duration-300">いいね</button>
              <button class="text-caption text-light-gray/70 hover:text-primary-gold transition-colors duration-300">返信</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 下部スペース -->
    <div class="h-64"></div>
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

/* いいねボタンアニメーション */
@keyframes heart-beat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.animate-heart-beat {
  animation: heart-beat 0.6s ease-in-out;
}

/* フェードトランジション */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
