<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';

// カテゴリーのリスト（内部管理は英語で行う）
const categories = ['head', 'chest', 'arms', 'waist', 'legs'] as const;
type Category = typeof categories[number];

// ソートのオプション
type SortOption = 'rarity' | 'name';
type SortDirection = 'asc' | 'desc';

// 性別の型定義
type Gender = 'm' | 'w';

// 所持装備の型定義（装備ID毎に所持している性別の配列を保存）
type OwnedEquipmentGenders = Gender[];

// ソートの状態
const sortOption = ref<SortOption>('rarity');
const sortDirection = ref<SortDirection>('desc');

// ソートオプションの表示名マッピング
const sortOptionDisplayNames: Record<SortOption, string> = {
  'rarity': 'レアリティ',
  'name': 'シリーズ名'
};

// ソート方向の表示名/アイコン
const sortDirectionIcons: Record<SortDirection, string> = {
  'asc': '↑',
  'desc': '↓'
};

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
const isPageLoading = inject('isLoading') as { value: boolean };

// ローカルストレージのキー
const STORAGE_KEY_OWNED_EQUIPMENT = 'huntStyle_owned_equipment';

// 装備データ
const allEquipment = ref<ArmorItem[]>([]);

// シリーズごとの装備グループ
const equipmentBySeries = ref<Record<string, ArmorItem[]>>({});

// シリーズのリスト
const seriesList = ref<ArmorSet[]>([]);

// ユーザーの所持装備を保存するオブジェクト（装備ID毎に所持している性別の配列を保存）
const ownedEquipmentIds = ref<Record<number, OwnedEquipmentGenders>>({});

// ローディング状態
const isLoading = ref(true);
const loadError = ref<string | null>(null);
const isLoaded = ref(false);

// 検索キーワード
const searchQuery = ref('');
const isSearchFocused = ref(false);

// 表示のフィルター（全て、所持、未所持）
const equipmentFilter = ref('全て'); // '全て', '所持', '未所持'

// 所持装備の編集モード
const isEditMode = ref(false);

// 編集モードを切り替える関数
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

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

  } catch (error) {
    console.error('装備データの取得中にエラーが発生しました:', error);
    loadError.value = error instanceof Error ? error.message : '不明なエラーが発生しました';

    // エラー時は空の配列を設定
    allEquipment.value = [];
    equipmentBySeries.value = {};
    seriesList.value = [];
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
  const storedDataJson = localStorage.getItem(STORAGE_KEY_OWNED_EQUIPMENT);

  if (storedDataJson) {
    try {
      const storedData = JSON.parse(storedDataJson);

      // 新しいデータ構造の場合はそのまま使用
      if (storedData && typeof storedData === 'object' && !Array.isArray(storedData)) {
        // 装備ID毎に性別の配列が保存されている新形式かチェック
        const firstKey = Object.keys(storedData)[0];
        if (firstKey && storedData[firstKey] && Array.isArray(storedData[firstKey])) {
          ownedEquipmentIds.value = storedData;
          return;
        }
      }

      // 古いデータ構造の場合は空で初期化（移行は複雑なので新規スタート）
      ownedEquipmentIds.value = {};
    } catch (error) {
      console.error('所持装備データの読み込みに失敗しました:', error);
      ownedEquipmentIds.value = {};
    }
  }
};

// ローカルストレージに所持装備データを保存
const saveOwnedEquipment = () => {
  localStorage.setItem(STORAGE_KEY_OWNED_EQUIPMENT, JSON.stringify(ownedEquipmentIds.value));
};

// コンポーネントマウント時にデータを取得
onMounted(() => {
  fetchEquipment();
});

// シリーズ装備をカテゴリ別に取得する関数
const getCategoryEquipment = (seriesId: number, category: Category, gender: Gender) => {
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
      matchesFilter = isItemOwned(item, gender);
    } else if (equipmentFilter.value === '未所持') {
      matchesFilter = !isItemOwned(item, gender);
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

    // 所持状態フィルター（両性別のうち少なくとも一方を所持している場合）
    let matchesFilter = true;

    if (item.kind && categories.includes(item.kind as Category)) {
      const isMaleOwned = isItemOwned(item, 'm');
      const isFemaleOwned = isItemOwned(item, 'w');

      if (equipmentFilter.value === '所持') {
        matchesFilter = isMaleOwned || isFemaleOwned;
      } else if (equipmentFilter.value === '未所持') {
        matchesFilter = !isMaleOwned && !isFemaleOwned;
      }
    }

    return matchesQuery && matchesFilter;
  });
};

// 所持状態の切り替え
const toggleObtained = (item: ArmorItem | undefined, gender: Gender) => {
  // アイテムがundefinedの場合は処理しない
  if (!item) return;

  // 編集モードでない場合は何もしない
  if (!isEditMode.value) {
    return;
  }

  const itemId = item.id;

  // 装備データが存在しない場合は初期化
  if (!ownedEquipmentIds.value[itemId]) {
    ownedEquipmentIds.value[itemId] = [];
  }

  // 所持状態を切り替え
  const genderArray = ownedEquipmentIds.value[itemId];
  const genderIndex = genderArray.indexOf(gender);
  
  if (genderIndex === -1) {
    // 性別が配列にない場合は追加
    genderArray.push(gender);
  } else {
    // 性別が配列にある場合は削除
    genderArray.splice(genderIndex, 1);
  }

  // 変更をローカルストレージに保存
  saveOwnedEquipment();
};

// 統計情報を計算
const statsData = computed(() => {
  const totalCount = allEquipment.value.length * 2; // 男性用と女性用で2倍

  const ownedCount = Object.values(ownedEquipmentIds.value).reduce((sum, genderArray) => {
    return sum + genderArray.length;
  }, 0);

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
const isItemOwned = (item: ArmorItem | undefined, gender: Gender) => {
  // アイテムがundefinedまたは必要なプロパティがない場合は所持していないとみなす
  if (!item || !item.id) {
    return false;
  }

  const equipmentData = ownedEquipmentIds.value[item.id];
  if (!equipmentData) {
    return false;
  }

  return equipmentData.includes(gender);
};

// シリーズの所持装備数を取得する関数
const getSeriesOwnedCount = (seriesId: number) => {
  const seriesKey = `${seriesId}`;
  const seriesEquipment = equipmentBySeries.value[seriesKey] || [];

  return seriesEquipment.reduce((count, item) => {
    // 男性用と女性用の両方をチェック
    const maleOwned = isItemOwned(item, 'm') ? 1 : 0;
    const femaleOwned = isItemOwned(item, 'w') ? 1 : 0;
    return count + maleOwned + femaleOwned;
  }, 0);
};

// シリーズの装備数を取得する関数
const getSeriesItemCount = (seriesId: number) => {
  const seriesKey = `${seriesId}`;
  const seriesEquipment = equipmentBySeries.value[seriesKey] || [];
  // 男性用と女性用の2倍の数になる
  return seriesEquipment.length * 2;
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

// シリーズの平均レアリティを取得する関数
const getSeriesAverageRarity = (seriesId: number): number => {
  const seriesKey = `${seriesId}`;
  const seriesEquipment = equipmentBySeries.value[seriesKey] || [];

  if (seriesEquipment.length === 0) {
    return 0;
  }

  const totalRarity = seriesEquipment.reduce((sum, item) => {
    return sum + (item.rarity || 0);
  }, 0);

  return totalRarity / seriesEquipment.length;
};

// レア度に基づく装備のスタイルクラスを取得
const getEquipmentRarityClass = (rarity: number | undefined, isOwned: boolean = false) => {
  if (!rarity) return '';

  // レアリティに応じた境界線と背景色を設定
  let rarityBorder = 'border-primary-gold/30';
  let rarityBg = 'bg-charcoal/50';

  // レアリティに応じた色を決定
  switch (rarity) {
    case 9:
      rarityBorder = 'border-primary-gold';
      rarityBg = 'bg-primary-gold/20';
      break;
    case 8:
      rarityBorder = 'border-sage-green';
      rarityBg = 'bg-sage-green/20';
      break;
    case 7:
      rarityBorder = 'border-primary-green';
      rarityBg = 'bg-gradient-to-br from-charcoal to-primary-green/30';
      break;
    default:
      rarityBorder = 'border-primary-gold/30';
      rarityBg = 'bg-charcoal/50';
      break;
  }

  // 所持している場合：外枠がレアリティカラー、背景がプライマリカラー
  if (isOwned) {
    return `border ${rarityBorder} bg-primary-gold/30`;
  }

  // 所持していない場合：外枠がプライマリカラー、背景がレアリティカラー
  return `border border-primary-gold/30 ${rarityBg}`;
};

// フィルタリング済みのシリーズリスト
const filteredSeriesList = computed(() => {
  // フィルタリング処理
  const filteredSeries = seriesList.value.filter(series => {
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
        if (isItemOwned(item, 'm')) {
          ownedCount++;
        }
        if (isItemOwned(item, 'w')) {
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

  // ソート処理
  return [...filteredSeries].sort((a, b) => {
    if (sortOption.value === 'rarity') {
      const rarityA = getSeriesAverageRarity(a.id);
      const rarityB = getSeriesAverageRarity(b.id);
      return sortDirection.value === 'asc' ? rarityA - rarityB : rarityB - rarityA;
    } else if (sortOption.value === 'name') {
      return sortDirection.value === 'asc'
        ? a.name.localeCompare(b.name, 'ja')
        : b.name.localeCompare(a.name, 'ja');
    }
    return 0;
  });
});

// ソートを変更する関数
const changeSort = (option: SortOption) => {
  if (sortOption.value === option) {
    // 同じオプションの場合は昇順/降順を切り替え
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // 異なるオプションの場合はそのオプションを降順で設定
    sortOption.value = option;
    sortDirection.value = 'desc';
  }
};
</script>

<template>
  <div class="max-w-[1100px] mx-auto pt-[70px] lg:pt-0 px-16" :class="{ 'edit-mode': isEditMode }">
    <!-- ページヘッダー -->
    <div class="mb-32 transition-all duration-500"
      :class="{ 'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded }">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-16 mb-32">
        <h1 class="text-heading-lg font-display text-light-gray">所持装備管理</h1>

        <router-link to="/"
          class="inline-flex items-center gap-8 text-light-gray hover:text-primary-gold transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>ホームに戻る</span>
        </router-link>
      </div>

      <!-- 統計カード -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-32">
        <div
          class="p-24 rounded-card bg-charcoal border border-primary-green/20 flex flex-col items-center shadow-card relative overflow-hidden group">
          <div
            class="absolute inset-x-0 bottom-0 h-1 bg-sage-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left">
          </div>
          <span class="text-caption text-light-gray/70 mb-8">総装備数</span>
          <span class="text-heading-lg font-display text-primary-gold mb-8">{{ statsData.total }}</span>
        </div>

        <div
          class="p-24 rounded-card bg-charcoal border border-primary-green/20 flex flex-col items-center shadow-card relative overflow-hidden group">
          <div
            class="absolute inset-x-0 bottom-0 h-1 bg-sage-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left">
          </div>
          <span class="text-caption text-light-gray/70 mb-8">所持装備数</span>
          <span class="text-heading-lg font-display text-bright-gold mb-8">{{ statsData.owned }}</span>
        </div>

        <div
          class="p-24 rounded-card bg-charcoal border border-primary-green/20 flex flex-col items-center shadow-card relative overflow-hidden group">
          <div
            class="absolute inset-x-0 bottom-0 h-1 bg-sage-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left">
          </div>
          <span class="text-caption text-light-gray/70 mb-8">未所持装備数</span>
          <span class="text-heading-lg font-display text-primary-green mb-8">{{ statsData.notOwned }}</span>
        </div>

        <div
          class="p-24 rounded-card bg-charcoal border border-primary-green/20 flex flex-col items-center shadow-card relative overflow-hidden group">
          <div
            class="absolute inset-x-0 bottom-0 h-1 bg-sage-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left">
          </div>
          <span class="text-caption text-light-gray/70 mb-8">コンプリート率</span>
          <span class="text-heading-lg font-display text-primary-gold mb-8">{{ statsData.completeRate }}%</span>
        </div>
      </div>

      <!-- 検索とフィルターセクション -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-16 mb-32">
        <div class="relative w-full md:w-auto md:flex-1">
          <input v-model="searchQuery" type="text" placeholder="装備やシリーズ名を検索..." @focus="isSearchFocused = true"
            @blur="isSearchFocused = false"
            class="w-full pl-40 pr-16 py-12 bg-charcoal rounded-full border transition-all duration-300 text-body focus:outline-none"
            :class="isSearchFocused || searchQuery ? 'border-primary-gold shadow-floating' : 'border-light-gray/20'">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
            class="absolute left-16 top-1/2 transform -translate-y-1/2 w-16 h-16 transition-colors duration-300"
            :class="isSearchFocused || searchQuery ? 'text-primary-gold' : 'text-light-gray/50'">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <button v-if="searchQuery" @click="searchQuery = ''"
            class="absolute right-16 top-1/2 transform -translate-y-1/2 text-light-gray/50 hover:text-primary-gold transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-16 h-16">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="flex gap-8 flex-wrap w-full md:w-auto">
          <!-- 所持装備切り替えモードボタン -->
          <button @click="toggleEditMode"
            class="px-16 py-8 rounded-full border transition-all duration-300 flex items-center gap-4"
            :class="isEditMode ? 'bg-sage-green/20 border-sage-green text-sage-green shadow-floating' : 'bg-charcoal border-light-gray/20 text-light-gray hover:text-primary-gold/70'">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" class="w-16 h-16" :class="isEditMode ? 'text-sage-green' : 'text-light-gray'">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>{{ isEditMode ? '編集中' : '所持を切り替える' }}</span>
          </button>

          <!-- ソートオプション -->
          <div class="flex items-center gap-4 mr-8">
            <span class="text-light-gray text-caption">並び順:</span>
            <div class="flex gap-4">
              <button v-for="(displayName, option) in sortOptionDisplayNames" :key="option"
                @click="changeSort(option as SortOption)"
                class="px-16 py-8 rounded-full border transition-all duration-300 flex items-center gap-4"
                :class="sortOption === option ? 'bg-primary-gold/10 border-primary-gold text-primary-gold' : 'bg-charcoal border-light-gray/20 text-light-gray hover:text-primary-gold/70'">
                {{ displayName }}
                <span v-if="sortOption === option" class="text-xs">{{ sortDirectionIcons[sortDirection] }}</span>
              </button>
            </div>
          </div>

          <!-- フィルターオプション -->
          <button @click="equipmentFilter = '全て'" class="px-16 py-8 rounded-full border transition-all duration-300"
            :class="equipmentFilter === '全て' ? 'bg-primary-gold/10 border-primary-gold text-primary-gold' : 'bg-charcoal border-light-gray/20 text-light-gray hover:text-primary-gold/70'">全て</button>
          <button @click="equipmentFilter = '所持'" class="px-16 py-8 rounded-full border transition-all duration-300"
            :class="equipmentFilter === '所持' ? 'bg-primary-gold/10 border-primary-gold text-primary-gold' : 'bg-charcoal border-light-gray/20 text-light-gray hover:text-primary-gold/70'">所持</button>
          <button @click="equipmentFilter = '未所持'" class="px-16 py-8 rounded-full border transition-all duration-300"
            :class="equipmentFilter === '未所持' ? 'bg-primary-gold/10 border-primary-gold text-primary-gold' : 'bg-charcoal border-light-gray/20 text-light-gray hover:text-primary-gold/70'">未所持</button>
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
        <button @click="fetchEquipment"
          class="mt-16 px-16 py-8 bg-error/20 text-error rounded-full hover:bg-error hover:text-white transition-colors duration-300">
          再読み込み
        </button>
      </div>

      <!-- 装備データ表示 -->
      <div v-else>
        <!-- シリーズがない場合 -->
        <div v-if="filteredSeriesList.length === 0"
          class="p-32 rounded-card bg-charcoal border border-primary-green/20 text-center">
          <p class="text-light-gray">条件に一致する装備シリーズが見つかりません。</p>
        </div>

        <!-- シリーズ一覧 -->
        <div v-else class="flex flex-col gap-16 mb-32 transition-all duration-500 delay-200"
          :class="{ 'opacity-100 translate-y-0': isLoaded, 'opacity-0 translate-y-16': !isLoaded }">
          <div v-for="series in filteredSeriesList" :key="series.id"
            class="rounded-card overflow-hidden transition-all duration-300 hover:shadow-floating bg-charcoal border border-primary-green/20">

            <!-- シリーズヘッダー -->
            <div
              class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-16 hover:bg-dark/30 transition-colors duration-300">
              <div class="flex items-center">
                <h3 class="text-body md:text-heading-sm font-display text-light-gray transition-colors duration-300">{{
                  series.name }}</h3>
              </div>

              <div class="flex items-center gap-8 text-caption">
                <span class="py-4 px-8 rounded-full bg-primary-gold/10 text-primary-gold">
                  {{ getSeriesOwnedCount(series.id) }}/{{ getSeriesItemCount(series.id) }}
                </span>
              </div>
            </div>

            <!-- シリーズの装備一覧 -->
            <div class="p-8 border-t border-primary-green/10 transition-all duration-300 bg-dark/20">
              <!-- 装備がフィルタリング条件に一致する場合のみ表示 -->
              <div v-if="getFilteredSeriesEquipment(series.id).length > 0" class="overflow-x-auto">
                <!-- 装備テーブル -->
                <table class="min-w-full">
                  <tbody>
                    <!-- 男性用装備 (1行目) -->
                    <tr>
                      <td>
                        <div class="w-8 h-8 rounded-full bg-sage-green"></div>
                      </td>
                      <td v-for="category in categories" :key="`m-${category}`" class="p-8 w-1/5">
                        <div v-if="getCategoryEquipment(series.id, category, 'm')"
                          class="p-16 rounded-md text-center transition-all duration-300 relative tooltip-container"
                          :class="[
                            getEquipmentRarityClass(
                              getCategoryEquipment(series.id, category, 'm')?.rarity,
                              isItemOwned(getCategoryEquipment(series.id, category, 'm'), 'm')
                            ),
                            !isItemOwned(getCategoryEquipment(series.id, category, 'm'), 'm') ? 'hover:shadow-card' : '',
                            isEditMode ? 'cursor-pointer scale-[1.02]' : 'cursor-default',
                            isEditMode && !isItemOwned(getCategoryEquipment(series.id, category, 'm'), 'm') ? 'outline-2 outline-sage-green/50' : ''
                          ]" @click="toggleObtained(getCategoryEquipment(series.id, category, 'm'), 'm')">
                          <div class="mb-8 font-bold text-body text-primary-gold">{{ getCategoryDisplayName(category) }}
                          </div>
                          <div class="tooltip">{{ getCategoryEquipment(series.id, category, 'm')?.name }}</div>

                          <!-- 所持アイコン -->
                          <div v-if="isItemOwned(getCategoryEquipment(series.id, category, 'm'), 'm')"
                            class="absolute !text-xl -top-0 -right-0 flex items-center justify-center">
                            🎁
                          </div>

                          <!-- 編集モードインジケーター -->
                          <div v-if="isEditMode" class="absolute bottom-4 right-4 w-8 h-8 rounded-full"
                            :class="isItemOwned(getCategoryEquipment(series.id, category, 'm'), 'm') ? 'bg-primary-gold' : 'bg-sage-green'">
                          </div>
                        </div>
                        <div v-else
                          class="p-16 rounded-md bg-charcoal/30 border border-light-gray/5 text-center text-light-gray/30 text-caption">
                          {{ getCategoryDisplayName(category) }}
                        </div>
                      </td>
                    </tr>
                    <!-- 女性用装備 (2行目) -->
                    <tr>
                      <td>
                        <div class="w-8 h-8 rounded-full bg-primary-gold"></div>
                      </td>
                      <td v-for="category in categories" :key="`w-${category}`" class="p-8 w-1/5">
                        <div v-if="getCategoryEquipment(series.id, category, 'w')"
                          class="p-16 rounded-md text-center transition-all duration-300 relative tooltip-container"
                          :class="[
                            getEquipmentRarityClass(
                              getCategoryEquipment(series.id, category, 'w')?.rarity,
                              isItemOwned(getCategoryEquipment(series.id, category, 'w'), 'w')
                            ),
                            !isItemOwned(getCategoryEquipment(series.id, category, 'w'), 'w') ? 'hover:shadow-card' : '',
                            isEditMode ? 'cursor-pointer scale-[1.02]' : 'cursor-default',
                            isEditMode && !isItemOwned(getCategoryEquipment(series.id, category, 'w'), 'w') ? 'outline-2 outline-sage-green/50' : ''
                          ]" @click="toggleObtained(getCategoryEquipment(series.id, category, 'w'), 'w')">
                          <div class="mb-8 font-bold text-body text-primary-gold">{{ getCategoryDisplayName(category) }}
                          </div>
                          <div class="tooltip">{{ getCategoryEquipment(series.id, category, 'w')?.name }}</div>

                          <!-- 所持アイコン -->
                          <div v-if="isItemOwned(getCategoryEquipment(series.id, category, 'w'), 'w')"
                            class="absolute !text-xl -top-0 -right-0 flex items-center justify-center">
                            🎁
                          </div>

                          <!-- 編集モードインジケーター -->
                          <div v-if="isEditMode" class="absolute bottom-4 right-4 w-8 h-8 rounded-full"
                            :class="isItemOwned(getCategoryEquipment(series.id, category, 'w'), 'w') ? 'bg-primary-gold' : 'bg-sage-green'">
                          </div>
                        </div>
                        <div v-else
                          class="p-16 rounded-md bg-charcoal/30 border border-light-gray/5 text-center text-light-gray/30 text-caption">
                          {{ getCategoryDisplayName(category) }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
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
.equipment-table {
  border-collapse: separate;
  border-spacing: 8px;
}

.equipment-row {
  display: flex;
}

.equipment-cell {
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
  min-width: 120px;
  max-width: 220px;
  background-color: rgba(24, 26, 27, 0.95);
  color: var(--color-light-gray);
  text-align: center;
  border-radius: 6px;
  padding: 8px 12px;
  position: absolute;
  z-index: 50;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--color-primary-gold);
  pointer-events: none;
  font-size: 0.85rem;
  word-break: keep-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 5px;
}

.tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -6px;
  border-width: 6px;
  border-style: solid;
  border-color: var(--color-primary-gold) transparent transparent transparent;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 1;
}

/* 編集モード関連のスタイル */
.edit-mode {
  position: relative;
}

.edit-mode::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to right, var(--color-sage-green), var(--color-primary-gold));
  z-index: 100;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.5;
  }
}
</style>
