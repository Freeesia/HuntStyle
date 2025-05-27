// カテゴリーのリスト（内部管理は英語で行う）
export const categories = ["head", "chest", "arms", "waist", "legs"] as const;
export type Category = (typeof categories)[number];
// 性別の型定義
export const genders = ["m", "w"] as const;
export type Gender = (typeof genders)[number];

export interface Armer {
  id: string;
  type: Category;
  gender:Gender;
  color: string;
}

export interface ArmerSet {
    id: string;
    name: string;
    armer: Armer[];
    description: string;
    image: string[];
    tags: string[];
    createdAt: string;
}