importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyB_dSSzrr1366M9pd_Jdin-6dW-EZLwP5Q",
  authDomain: "tikka-app.firebaseapp.com",
  projectId: "tikka-app",
  storageBucket: "tikka-app.firebasestorage.app",
  messagingSenderId: "250061939573",
  appId: "1:250061939573:web:74ba509630691e2a19293c",
});

const messaging = firebase.messaging();

/* messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});
 */
