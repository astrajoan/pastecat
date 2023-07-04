import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
} from "firebase/firestore";
import {
  getBytes,
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from "firebase/storage";

import firebaseConfig from './config.json';

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export const getPasteCollection = (pasteId) => {
  return new Promise((resolve, reject) => {
    getDoc(doc(db, "pastes", pasteId)).then(
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          resolve({ pasteName: data.name, language: data.language });
        } else {
          reject(new Error("Paste ID " + pasteId + " does not exist!"));
        }
      },
      (error) => reject(error),
    );
  });
};

export const getPaste = (pasteId, pasteName) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, pasteId + "/" + pasteName);
    const urlPromise = getDownloadURL(storageRef);
    const bytesPromise = getBytes(storageRef);

    Promise.all([urlPromise, bytesPromise]).then(
      (values) => {
        const [downloadUrl, bytes] = values;
        const decoder = new TextDecoder("utf-8");
        const content = decoder.decode(bytes).trimEnd();
        resolve({ downloadUrl, content });
      },
      (error) => reject(error),
    );
  });
};

export const storePaste = (pasteName, language, content) => {
  return new Promise((resolve, reject) => {
    addDoc(collection(db, "pastes"), { name: pasteName, language }).then(
      (pasteIdRef) => {
        const pasteId = pasteIdRef.id;
        const storageRef = ref(storage, pasteId + "/" + pasteName);
        uploadString(storageRef, content).then(
          (snapshot) => resolve({ pasteId }),
          (error) => reject(error),
        );
      },
      (error) => reject(error),
    );
  });
};
