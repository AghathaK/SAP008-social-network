/* eslint-disable consistent-return */
/* eslint-disable no-console */
import { app, db } from './configuration.js';

import {
  deleteDoc,
  doc,
  collection,
  addDoc,
  getDocs,
  getAuth,
  updateDoc,
  getFirestore,
} from './firebase.js';

export const auth = getAuth(app);

export const dataBase = getFirestore(app);

export const current = () => auth.currentUser;

export const nameUser = () => auth.currentUser.displayName;

export const createPost = async (textPost) => {
  addDoc(collection(db, 'posts'), {
    photoURL: auth.currentUser.photoURL,
    name: auth.currentUser.displayName,
    date: new Date().toLocaleDateString('pt-BR'),
    author: auth.currentUser.uid,
    text: textPost,
    like: [],
    id: auth.currentUser.uid,
  })
    .then(() => true)
    .catch((e) => { throw e; });
};

export const postScreen = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'posts'));
    const arrayPost = [];
    querySnapshot.forEach((posts) => {
      arrayPost.push({ ...posts.data(), id: posts.id });
    });
    return arrayPost;
  } catch (e) {
    console.log(e);
  }
};

export const removePost = async (postId) => {
  const deletePost = await deleteDoc(doc(db, 'posts', postId));
  return deletePost;
};

export const editPost = async (postId, newText) => {
  updateDoc(doc(db, 'posts', postId), { text: newText });
};

export const likePost = async (postId, userId) => {
  const post = await postScreen(postId);
  let likes = post.like;
  const liking = !likes.includes(userId);

  if (liking) {
    likes.push(userId);
  } else {
    likes = likes.filter((id) => id !== userId);
  }

  return updateDoc(doc(dataBase, 'posts', postId), {
    like: likes,
  });
};
