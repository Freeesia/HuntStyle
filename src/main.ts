import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

// ビューのインポート
import HomePage from './views/HomePage.vue'
import PostDetailPage from './views/PostDetailPage.vue'
import NewPostPage from './views/NewPostPage.vue'
import ProfilePage from './views/ProfilePage.vue'
import EquipmentPage from './views/EquipmentPage.vue'
import FavoritesPage from './views/FavoritesPage.vue'

// ルート設定
const routes = [
  { path: '/', component: HomePage, name: 'home' },
  { path: '/post/new', component: NewPostPage, name: 'new-post' },  // 具体的なパスを上に
  { path: '/post/:id', component: PostDetailPage, name: 'post-detail' }, // パラメータを含むパスを下に
  { path: '/profile/:id', component: ProfilePage, name: 'profile' },
  { path: '/equipment', component: EquipmentPage, name: 'equipment' },
  { path: '/favorites', component: FavoritesPage, name: 'favorites' },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

createApp(App).use(router).mount('#app')
