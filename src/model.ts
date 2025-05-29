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
  color0: string;
  color1: string;
}

export interface LayerSet {
    id: string;
    name: string;
    armers: Armer[];
    description: string;
    images: string[];
    tags: string[];
    createdAt: string;
}