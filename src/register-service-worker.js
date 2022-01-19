/* eslint-disable no-console */
// eslint-disable-next-line import/no-unresolved
// noinspection NpmUsedModulesInstalled
// eslint-disable-next-line import/no-unresolved
import { BASE_URL } from 'babel-dotenv'; // This is the re-named babel-plugin-dotenv

const rsw = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${BASE_URL}service-worker.js`)
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

export default rsw;
// import { BASE_URL } from 'babel-dotenv';
// import { register } from 'register-service-worker';
//
// if (process.env.NODE_ENV === 'production') {
//   register(`${BASE_URL}service-worker.js`, {
//   // register('/service-worker.js', {
//     ready() {
//       console.log(
//         'App is being served from cache by a service worker.\n'
//         + 'For more details, visit https://goo.gl/AFskqB',
//       );
//     },
//     registered() {
//       console.log('Service worker has been registered.');
//     },
//     cached() {
//       console.log('Content has been cached for offline use.');
//     },
//     updatefound() {
//       console.log('New content is downloading.');
//     },
//     updated() {
//       console.log('New content is available; please refresh.');
//     },
//     offline() {
//       console.log('No internet connection found. App is running in offline mode.');
//     },
//     error(error) {
//       console.error('Error during service worker registration:', error);
//     }
//   });
// }
