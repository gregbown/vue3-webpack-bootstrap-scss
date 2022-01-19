import { createApp } from 'vue';
import App from './App.vue';
// import rsw from './register-service-worker';
import router from './router';
import store from './store';

// rsw();
createApp(App).use(store).use(router).mount('#app');
