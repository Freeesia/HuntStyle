<script setup lang="ts">
import Navigation from './components/Navigation.vue';
</script>

<template>
  <div class="app">
    <Navigation />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  background-color: #f7f7f7;
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-bottom: 50px;
}

a {
  color: #42b883;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

h1, h2, h3 {
  font-weight: 700;
  margin-bottom: 15px;
}

button {
  cursor: pointer;
}
</style>
