import { initializeApp } from "firebase/app";

import {getFirestore} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBGtEptn45w6rIxEb3dUhg9KBnnNTWY2_M",
  authDomain: "fir-dbaa1.firebaseapp.com",
  projectId: "fir-dbaa1",
  storageBucket: "fir-dbaa1.firebasestorage.app",
  messagingSenderId: "493730980912",
  appId: "1:493730980912:web:e9a566b65a5ec5ef0eb9f5"
};

const app = initializeApp(firebaseConfig);

const db=getFirestore(app)
export {db}