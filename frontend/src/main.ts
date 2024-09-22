import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { updateSocketToken } from './services/socket'
import { useUserStore } from './stores/userStore'
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Toast);

const userStore = useUserStore();


if (localStorage.getItem('token')) {
  userStore.fetchCurrentUser().finally(() => {
    updateSocketToken(localStorage.getItem('token'));
    app.mount('#app');
  });
} else {
  app.mount('#app');
}