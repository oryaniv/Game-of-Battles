/* eslint-disable */

import { createApp } from 'vue'
import App from './App.vue'
import GameApp from './GameApp.vue';
import router from './router'
import Intro from './views/Intro.vue'
// import GameApp from './GameApp copy.vue';

// createApp(GameApp).use(router).mount('#app');
createApp(App).use(router).mount('#app');
// createApp(GameApp).mount('#app');

