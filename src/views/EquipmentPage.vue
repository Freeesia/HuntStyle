<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';

// カテゴリーのリスト（内部管理は英語で行う）
const categories = ['head', 'chest', 'arms', 'waist', 'legs'] as const;
type Category = typeof categories[number];

// 装備シリーズの型定義
interface ArmorSet {
  id: number;
  name: string;
  pieces: ArmorItem[];  // セットに含まれる装備一覧
  bonus?: {
    id: number;
    skill: {
      id: number;
      name: string;
    };
    ranks: {
      pieces: number;
      skill: {
        level: number;
        description: string;
      };
    }[];
  };
  gameId?: number;
}

// 装備アイテムの型定義
interface ArmorItem {
  id: number;
  name: string;
  kind: Category; // APIから返されるフィールド名
  rarity: number;
  defense?: {
    base: number;
    max: number;
  };
  slots?: number[];
  armorSet?: {
    id: number;
    name: string;
  };
}

// グローバル状態
const showToast = inject('showToast') as (message: string, type: 'success' | 'error' | 'info') => void;
const isPageLoading = inject('isLoading') as { value: boolean };

// ローカルストレージのキー
const STORAGE_KEY_OWNED_EQUIPMENT = 'huntStyle_owned_equipment';

// 装備データ
const allEquipment = ref<ArmorItem[]>([]);

// シリーズごとの装備グループ
const equipmentBySeries = ref<Record<string, ArmorItem[]>>({});

// シリーズのリスト
const seriesList = ref<ArmorSet[]>([]);

// 展開されているシリーズの管理
const expandedSeries = ref<Set<number>>(new Set());

// ユーザーの所持装備IDを保存するSet
const ownedEquipmentIds = ref<Record<Category, Set<number>>>({
  'head': new Set(),
  'chest': new Set(),
  'arms': new Set(),
  'waist': new Set(),
  'legs': new Set()
});

// ローディング状態
const isLoading = ref(true);
const loadError = ref<string | null>(null);
const isLoaded = ref(false);

// 検索キーワード
const searchQuery = ref('');
const isSearchFocused = ref(false);

// 表示のフィルター（全て、所持、未所持）
const equipmentFilter = ref('全て'); // '全て', '所持', '未所持'

// APIから装備データを取得する関数
const fetchEquipment = async () => {
  isLoading.value = true;
  loadError.value = null;
  if (isPageLoading) isPageLoading.value = true;

  try {
    // 装備セット一覧を取得
    const response = await fetch(`https://wilds.mhdb.io/ja/armor/sets`);

    if (!response.ok) {
      throw new Error(`装備セットデータの取得に失敗しました: ${response.statusText}`);
    }

    const armorSets: ArmorSet[] = await response.json();
    
    // シリーズのリストを保存
    seriesList.value = armorSets
      .filter(set => set.pieces && set.pieces.length > 0) // 装備が存在するセットのみを保持
      .sort((a, b) => a.id - b.id);
    
    const allArmorItems: ArmorItem[] = [];
    const groupedEquipment: Record<string, ArmorItem[]> = {};

    // セットごとの装備を処理
    for (const set of seriesList.value) {
      // セット内のすべての装備を取り出す
      const setItems: ArmorItem[] = [];
      
      for (const piece of set.pieces) {
        // 装備タイプを小文字に変換して処理
        const normalizedKind = String(piece.kind).toLowerCase();
        
        // 正規化したkindがcategoriesに含まれるかチェック
        if (categories.includes(normalizedKind as Category)) {
          // 正規化したカテゴリ値を使用
          setItems.push({
            ...piece,
            kind: normalizedKind as Category,
            armorSet: {
              id: set.id,
              name: set.name
            }
          });
        } else {
          console.warn(`不明な装備タイプがスキップされました: ${piece.id} ${piece.name} (kind: ${piece.kind})`);
        }
      }

      // 全装備リストに追加
      allArmorItems.push(...setItems);

      // セットごとにグループ化
      const seriesKey = `${set.id}`;
      groupedEquipment[seriesKey] = setItems;
    }

    // 全装備データを保存
    allEquipment.value = allArmorItems;

    // グループ化した装備を保存
    equipmentBySeries.value = groupedEquipment;

    // ローカルストレージから所持装備データを読み込む
    loadOwnedEquipment();
    
    // 正常に読み込まれたことを通知
    if (showToast) showToast('装備データの読み込みが完了しました', 'success');

  } catch (error) {
    console.error('装備データの取得中にエラーが発生しました:', error);
    loadError.value = error instanceof Error ? error.message : '不明なエラーが発生しました';

    // エラー時は空の配列を設定
    allEquipment.value = [];
    equipmentBySeries.value = {};
    seriesList.value = [];
    
    // エラー通知
    if (showToast) showToast('装備データの取得に失敗しました', 'error');
  } finally {
    isLoading.value = false;
    if (isPageLoading) isPageLoading.value = false;
    
    // アニメーション用のフラグを設定
    setTimeout(() => {
      isLoaded.value = true;
    }, 300);
  }
};

// ローカルストレージから所持装備データを読み込む
const loadOwnedEquipment = () => {
  // すべてのカテゴリの所持装備を一つのキーで保存
  const storedDataJson = localStorage.getItem(STORAGE_KEY_OWNED_EQUIPMENT);

  if (storedDataJson) {
    try {
      const storedData = JSON.parse(storedDataJson);

      // 各カテゴリのデータを取り出して設定
      for (const category of categories) {
        if (storedData[category] && Array.isArray(storedData[category])) {
          ownedEquipmentIds.value[category] = new Set(storedData[category]);
        } else {
          ownedEquipmentIds.value[category] = new Set();
        }
      }
    } catch (error) {
      console.error('所持装備データの読み込みに失敗しました:', error);
      // エラー時は空のセットで初期化
      for (const category of categories) {
        ownedEquipmentIds.value[category] = new Set();
      }
      
      if (showToast) showToast('所持装備データの読み込みに失敗しました', 'error');
    }
  }
};

// ローカルストレージに所持装備データを保存
const saveOwnedEquipment = () => {
  // オブジェクトに変換してJSON形式で保存
  const dataToSave = Object.fromEntries(
    categories.map(category => [
      category,
      Array.from(ownedEquipmentIds.value[category])
    ])
  );

  localStorage.setItem(STORAGE_KEY_OWNED_EQUIPMENT, JSON.stringify(dataToSave));
};

// コンポーネントマウント時にデータを取得
onMounted(() => {
  fetchEquipment();
});

// シリーズ装備をカテゴリ別に取得する関数
const getCategoryEquipment = (seriesId: number, category: Category) => {
  const seriesKey = `${seriesId}`;
  const seriesEquipment = equipmentBySeries.value[seriesKey] || [];
  
  // 指定したカテゴリの装備のみをフィルタリング
  return seriesEquipment.find(item => {
    // 検索フィルターとカテゴリフィルターの両方を適用
    const matchesQuery = searchQuery.value === '' || item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = item.kind === category;
    
    // 所持状態フィルター
    let matchesFilter = true;
    if (equipmentFilter.value === '所持') {
      matchesFilter = isItemOwned(item);
    } else if (equipmentFilter.value === '未所持') {
      matchesFilter = !isItemOwned(item);
    }
    
    return matchesQuery && matchesCategory && matchesFilter;
  });
};

// シリーズの装備リスト（フィルタリング後）
const getFilteredSeriesEquipment = (seriesId: number) => {
  const seriesKey = `${seriesId}`;
  const seriesEquipment = equipmentBySeries.value[seriesKey] || [];

  return seriesEquipment.filter(item => {
    // 検索フィルター
    const matchesQuery = searchQuery.value === '' ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase());

    // 所持状態フィルター
    let matchesFilter = true;
    
    if (item.kind && categories.includes(item.kind as Category)) {
      const isOwned = ownedEquipmentIds.value[item.kind].has(item.id);
      
      if (equipmentFilter.value === '所持') {
        matchesFilter = isOwned;
      } else if (equipmentFilter.value === '未所持') {
        matchesFilter = !isOwned;
      }
    }

    return matchesQuery && matchesFilter;
  });
};

// 所持状態の切り替え
const toggleObtained = (item: ArmorItem | undefined) => {
  // アイテムがundefinedの場合は処理しない
  if (!item) return;
  
  const category = item.kind;
  const itemId = item.id;

  if (ownedEquipmentIds.value[category].has(itemId)) {
    ownedEquipmentIds.value[category].delete(itemId);
    if (showToast) showToast(`「${item.name}」を所持装備から削除しました`, 'info');
  } else {
    ownedEquipmentIds.value[category].add(itemId);
    if (showToast) showToast(`「${item.name}」を所持装備に追加しました`, 'success');
  }

  // 変更をローカルストレージに保存（全カテゴリをまとめて保存）
  saveOwnedEquipment();
};

// 統計情報を計算
const statsData = computed(() => {
  const totalCount = allEquipment.value.length;

  const ownedCount = categories.reduce(
    (sum, category) => sum + ownedEquipmentIds.value[category].size,
    0
  );

  const notOwnedCount = totalCount - ownedCount;

  const completeRate = totalCount > 0
    ? Math.round((ownedCount / totalCount) * 100)
    : 0;

  return {
    total: totalCount,
    owned: ownedCount,
    notOwned: notOwnedCount,
    completeRate
  };
});

// アイテムが所持されているかどうかを確認する関数
const isItemOwned = (item: ArmorItem | undefined) => {
  // アイテムがundefinedまたは必要なプロパティがない場合は所持していないとみなす
  if (!item || !item.kind || !categories.includes(item.kind as Category) || !ownedEquipmentIds.value[item.kind]) {
    return false;
  }
  return ownedEquipmentIds.value[item.kind].has(item.id);
};

// シリーズの所持装備数を取得する関数
const getSeriesOwnedCount = (seriesId: number) => {
  const seriesKey = `${seriesId}`;
  const seriesEquipment = equipmentBySeries.value[seriesKey] || [];

  return seriesEquipment.reduce((count, item) => {
    return count + (isItemOwned(item) ? 1 : 0);
  }, 0);
};

// シリーズの装備数を取得する関数
const getSeriesItemCount = (seriesId: number) => {
  const seriesKey = `${seriesId}`;
  return equipmentBySeries.value[seriesKey]?.length || 0;
};

// カテゴリーの日本語表示名を取得する関数
const getCategoryDisplayName = (category: Category): string => {
  switch (category) {
    case 'head':
      return '頭';
    case 'chest':
      return '胴';
    case 'arms':
      return '腕';
    case 'waist':
      return '腰';
    case 'legs':
      return '脚';
    default:
      return '';
  }
};

// レア度に基づく装備のスタイルクラスを取得
const getEquipmentRarityClass = (rarity: number | undefined) => {
  if (!rarity) return '';
  
  const baseClass = 'border border-primary-gold/30';
  
  switch (rarity) {
    case 9:
      return `${baseClass} bg-primary-gold/20`;
    case 8:
      return `${baseClass} bg-sage-green/20`;
    case 7:
      return `${baseClass} bg-gradient-to-br from-charcoal to-primary-green/30`;
    default:
      return `${baseClass} bg-charcoal/50`;
  }
};

// シリーズの展開/折りたたみ切り替え
const toggleSeriesExpansion = (seriesId: number) => {
  if (expandedSeries.value.has(seriesId)) {
    expandedSeries.value.delete(seriesId);
  } else {
    expandedSeries.value.add(seriesId);
  }
};

// 全装備セットを展開/折りたたむ
const toggleAllSeries = (expand: boolean) => {
  if (expand) {
    // すべてのシリーズを展開
    seriesList.value.forEach(series => {
      expandedSeries.value.add(series.id);
    });
  } else {
    // すべてのシリーズを折りたたむ
    expandedSeries.value.clear();
  }
};

// フィルタリング済みのシリーズリスト
const filteredSeriesList = computed(() => {
  return seriesList.value.filter(series => {
    // 検索クエリがある場合、シリーズ名に一致するか、装備品が検索条件に一致するかをチェック
    if (searchQuery.value) {
      // シリーズ名が検索クエリを含む場合
      const seriesNameMatches = series.name.toLowerCase().includes(searchQuery.value.toLowerCase());
      
      // 装備が検索クエリを含むかチェック
      const seriesKey = `${series.id}`;
      const seriesEquipment = equipmentBySeries.value[seriesKey] || [];
      const anyEquipmentMatches = seriesEquipment.some(item => {
        return item.name.toLowerCase().includes(searchQuery.value.toLowerCase());
      });
      
      if (!seriesNameMatches && !anyEquipmentMatches) {
        return false;
      }
    }
    
    // 所持フィルターの条件に一致するかチェック
    if (equipmentFilter.value !== '全て') {
      const seriesKey = `${series.id}`;
      const seriesEquipment = equipmentBySeries.value[seriesKey] || [];
      
      // 所持している装備をカウント
      let ownedCount = 0;
      seriesEquipment.forEach(item => {
        if (isItemOwned(item)) {
          ownedCount++;
        }
      });
      
      // フィルター条件に基づいて結果を返す
      if (equipmentFilter.value === '所持' && ownedCount === 0) {
        return false;
      }
      
      if (equipmentFilter.value === '未所持' && ownedCount === seriesEquipment.length) {
        return false;
      }
    }
    
    return true;
  });
});
</script>

<template>
  <div class="max-w-[1100px] mx-auto pt-[70px] lg:pt-0 px-16">
    <!-- ページヘッダー -->
    <div class="mb-32 transition-all duration-500"
         :class="{'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded}">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-16 mb-32">
        <h1 class="text-heading-lg font-display text-light-gray">所持装備管理</h1>
        
        <router-link to="/" class="inline-flex items-center gap-8 text-light-gray hover:text-primary-gold transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>ホームに戻る</span>
        </router-link>
      </div>
      
      <!-- 統計カード -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-32">
        <div class="p-24 rounded-card bg-charcoal border border-primary-green/20 flex flex-col items-center shadow-card relative overflow-hidden group">
          <div class="absolute inset-x-0 bottom-0 h-1 bg-sage-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          <span class="text-caption text-light-gray/70 mb-8">総装備数</span>
          <span class="text-heading-lg font-display text-primary-gold mb-8">{{ statsData.total }}</span>
        </div>
        
        <div class="p-24 rounded-card bg-charcoal border border-primary-green/20 flex flex-col items-center shadow-card relative overflow-hidden group">
          <div class="absolute inset-x-0 bottom-0 h-1 bg-sage-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          <span class="text-caption text-light-gray/70 mb-8">所持装備数</span>
          <span class="text-heading-lg font-display text-bright-gold mb-8">{{ statsData.owned }}</span>
        </div>
        
        <div class="p-24 rounded-card bg-charcoal border border-primary-green/20 flex flex-col items-center shadow-card relative overflow-hidden group">
          <div class="absolute inset-x-0 bottom-0 h-1 bg-sage-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          <span class="text-caption text-light-gray/70 mb-8">未所持装備数</span>
          <span class="text-heading-lg font-display text-primary-green mb-8">{{ statsData.notOwned }}</span>
        </div>
        
        <div class="p-24 rounded-card bg-charcoal border border-primary-green/20 flex flex-col items-center shadow-card relative overflow-hidden group">
          <div class="absolute inset-x-0 bottom-0 h-1 bg-sage-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
          <span class="text-caption text-light-gray/70 mb-8">コンプリート率</span>
          <span class="text-heading-lg font-display text-primary-gold mb-8">{{ statsData.completeRate }}%</span>
        </div>
      </div>
      
      <!-- 検索とフィルターセクション -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-16 mb-32">
        <div class="relative w-full md:w-auto md:flex-1">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="装備やシリーズ名を検索..."
            @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
            class="w-full pl-40 pr-16 py-12 bg-charcoal rounded-full border transition-all duration-300 text-body focus:outline-none"
            :class="isSearchFocused || searchQuery ? 'border-primary-gold shadow-floating' : 'border-light-gray/20'"
          >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
               class="absolute left-16 top-1/2 transform -translate-y-1/2 w-16 h-16 transition-colors duration-300"
               :class="isSearchFocused || searchQuery ? 'text-primary-gold' : 'text-light-gray/50'">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <button 
            v-if="searchQuery" 
            @click="searchQuery = ''" 
            class="absolute right-16 top-1/2 transform -translate-y-1/2 text-light-gray/50 hover:text-primary-gold transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="flex gap-8 flex-wrap w-full md:w-auto">
          <button 
            @click="equipmentFilter = '全て'" 
            class="px-16 py-8 rounded-full border transition-all duration-300"
            :class="equipmentFilter === '全て' ? 'bg-primary-gold/10 border-primary-gold text-primary-gold' : 'bg-charcoal border-light-gray/20 text-light-gray hover:text-primary-gold/70'"
          >全て</button>
          <button 
            @click="equipmentFilter = '所持'" 
            class="px-16 py-8 rounded-full border transition-all duration-300"
            :class="equipmentFilter === '所持' ? 'bg-primary-gold/10 border-primary-gold text-primary-gold' : 'bg-charcoal border-light-gray/20 text-light-gray hover:text-primary-gold/70'"
          >所持</button>
          <button 
            @click="equipmentFilter = '未所持'" 
            class="px-16 py-8 rounded-full border transition-all duration-300"
            :class="equipmentFilter === '未所持' ? 'bg-primary-gold/10 border-primary-gold text-primary-gold' : 'bg-charcoal border-light-gray/20 text-light-gray hover:text-primary-gold/70'"
          >未所持</button>
        </div>
      </div>
    </div>
    
    <!-- 装備リスト -->
    <div>
      <!-- ローディング表示 -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-64">
        <div class="w-16 h-16 border-4 border-primary-gold border-t-transparent rounded-full animate-spin mb-16"></div>
        <p class="text-light-gray">装備データを読み込み中...</p>
      </div>
      
      <!-- エラー表示 -->
      <div v-else-if="loadError" class="p-32 rounded-card bg-error/10 border border-error text-center mb-32">
        <p class="text-error font-medium mb-8">{{ loadError }}</p>
        <p class="text-light-gray">APIからのデータ取得に失敗しました。後でもう一度お試しください。</p>
        <button 
          @click="fetchEquipment" 
          class="mt-16 px-16 py-8 bg-error/20 text-error rounded-full hover:bg-error hover:text-white transition-colors duration-300">
          再読み込み
        </button>
      </div>
      
      <!-- 装備データ表示 -->
      <div v-else>
        <!-- 展開/折りたたみコントロール -->
        <div class="flex justify-end mb-16 transition-all duration-500 delay-100"
            :class="{'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded}">
          <div class="flex gap-8">
            <button 
              @click="toggleAllSeries(true)" 
              class="px-16 py-8 rounded-full text-caption bg-charcoal border border-light-gray/20 text-light-gray hover:text-primary-gold hover:border-primary-gold/50 transition-all duration-300">
              すべて展開
            </button>
            <button 
              @click="toggleAllSeries(false)" 
              class="px-16 py-8 rounded-full text-caption bg-charcoal border border-light-gray/20 text-light-gray hover:text-primary-gold hover:border-primary-gold/50 transition-all duration-300">
              すべて折りたたむ
            </button>
          </div>
        </div>
        
        <!-- シリーズがない場合 -->
        <div v-if="filteredSeriesList.length === 0" class="p-32 rounded-card bg-charcoal border border-primary-green/20 text-center">
          <p class="text-light-gray">条件に一致する装備シリーズが見つかりません。</p>
        </div>
        
        <!-- シリーズ一覧 -->
        <div 
          v-else
          class="flex flex-col gap-16 mb-32 transition-all duration-500 delay-200"
          :class="{'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded}">
          <div 
            v-for="series in filteredSeriesList" 
            :key="series.id" 
            class="rounded-card overflow-hidden transition-all duration-300 hover:shadow-floating bg-charcoal border border-primary-green/20">
            
            <!-- シリーズヘッダー -->
            <div 
              @click="toggleSeriesExpansion(series.id)" 
              class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-16 cursor-pointer hover:bg-dark/30 transition-colors duration-300">
              <div class="flex items-center gap-16">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  class="w-16 h-16 text-primary-gold transition-transform duration-300"
                  :class="expandedSeries.has(series.id) ? 'rotate-90' : ''">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                
                <h3 class="text-body md:text-heading-sm font-display text-light-gray hover:text-primary-gold/90 transition-colors duration-300">{{ series.name }}</h3>
              </div>
              
              <div class="flex items-center gap-8 text-caption">
                <span class="py-4 px-8 rounded-full bg-primary-gold/10 text-primary-gold">
                  {{ getSeriesOwnedCount(series.id) }}/{{ getSeriesItemCount(series.id) }}
                </span>
              </div>
            </div>
            
            <!-- シリーズの装備一覧 -->
            <div 
              v-if="expandedSeries.has(series.id)" 
              class="p-8 border-t border-primary-green/10 transition-all duration-300 bg-dark/20"
            >
              <!-- 装備がフィルタリング条件に一致する場合のみ表示 -->
              <div v-if="getFilteredSeriesEquipment(series.id).length > 0" class="overflow-x-auto">              
                <!-- 装備テーブル -->
                <table class="min-w-full">
                  <tr>
                    <td v-for="category in categories" :key="category" class="p-8 w-1/5">
                      <div
                        v-if="getCategoryEquipment(series.id, category)" 
                        class="p-16 rounded-md text-center cursor-pointer transition-all duration-300 relative"
                        :class="[
                          getEquipmentRarityClass(getCategoryEquipment(series.id, category)?.rarity), 
                          isItemOwned(getCategoryEquipment(series.id, category)) ? 'shadow-[0_0_0_2px] shadow-primary-gold' : 'hover:shadow-card'
                        ]"
                        @click="toggleObtained(getCategoryEquipment(series.id, category))">
                        <div class="mb-8 font-bold text-caption text-primary-gold">{{ getCategoryDisplayName(category) }}</div>
                        <div class="tooltip-container">
                          <div class="text-light-gray line-clamp-1 text-caption">{{ getCategoryEquipment(series.id, category)?.name }}</div>
                        </div>
                        
                        <!-- 所持アイコン -->
                        <div
                          v-if="isItemOwned(getCategoryEquipment(series.id, category))" 
                          class="absolute -top-8 -right-8 w-24 h-24 flex items-center justify-center bg-primary-gold rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-14 h-14 text-dark">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      </div>
                      <div 
                        v-else 
                        class="p-16 rounded-md bg-charcoal/30 border border-light-gray/5 text-center text-light-gray/30 text-caption">
                        {{ getCategoryDisplayName(category) }}
                      </div>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- 装備がフィルター条件に一致しない場合 -->
              <div v-else class="p-16 text-center text-light-gray/50 text-caption">
                条件に一致する装備がありません
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* スクロールバー用のスタイル */
table {
  border-collapse: separate;
  border-spacing: 8px;
}

tr {
  display: flex;
}

td {
  flex: 1;
}

/* ツールチップ */
.tooltip-container {
  position: relative;
}

.tooltip-container:hover .tooltip {
  visibility: visible;
  opacity: 1;
}

.tooltip {
  visibility: hidden;
  width: 200px;
  background-color: theme('colors.charcoal');
  color: theme('colors.light-gray');
  text-align: center;
  border-radius: 6px;
  padding: 8px;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  box-shadow: theme('boxShadow.lg');
  border: 1px solid theme('colors.primary-gold');
  pointer-events: none;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: theme('colors.primary-gold') transparent transparent transparent;
}

.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 1;
}
</style>
