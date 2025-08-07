// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWqZXrPbXmCPM4wniF4I-BvY5X_-OYBcQ",
    authDomain: "barcodemanager-2a2d8.firebaseapp.com",
    projectId: "barcodemanager-2a2d8",
    storageBucket: "barcodemanager-2a2d8.firebasestorage.app",
    messagingSenderId: "794684407334",
    appId: "1:794684407334:web:57fe1323231b25fba530e7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.auth = auth;
window.db = db;
