/* eslint-disable no-alert */
/* eslint-disable spaced-comment */
/* eslint-disable no-console */

import { logOutUser } from '../../lib/auth.js';
import {
  createPost,
  postScreen,
  auth,
  removePost,
  deslikePost,
  likePost,
} from '../../lib/firestore.js';
import { errorFire } from '../../lib/errorFirebase.js';

export default async () => {
  const sectionFeed = document.createElement('div');
  const contentFeed = `
    <div>
      <header class='headerFeed'>
          <img src='../../img/logo.png' class='loginhoFeed' alt='Logo Peq Wanderlust'>
      </header>
      <nav class='navBar'>
        <ul>
          <li><a class='btnSIgnInOut' id='logOut'><img src='../../img/btnSair.png' alt='seta para sair'</a></li>
        </ul>
      </nav>
      <section class='msgBoasvindas'>
        <p> Olá, ${auth.currentUser.displayName}!</p>
      </section>
      <div clas='corpotimeline'>
        <form id='create-Post'>
          <section class='boxModelPost'>
            <form>
              <textarea id='text-publish' class='inputText' rows='5' cols='40' placeholder='Escreva detalhes sobre a estadia em sua residência...'></textarea>
              <button type='submit' id='publish-btn' class='publicBtn'>Publicar</button>
            </form>
          </section>
          <section class='timeline-post' id='post-feed'></section>
        </form> 
      </div>  
    </div>`;
  sectionFeed.innerHTML = contentFeed;

  const createform = sectionFeed.querySelector('#create-Post');
  const textAreaPost = sectionFeed.querySelector('#text-publish');
  const btnLogOut = sectionFeed.querySelector('#logOut');

  btnLogOut.addEventListener('click', () => {
    logOutUser().then(() => {
      window.location.hash = '#home';
    });
  });

  createform.addEventListener('submit', (e) => {
    e.preventDefault();
    const postText = textAreaPost.value;
    createPost(postText)
      .then(async () => {
        await printPosts();
      })
      .catch((error) => {
        const errorCode = errorFire(error.code);
        console.log(errorCode);
      });

  });
  const posts = await postScreen();
  printPosts(posts,sectionFeed);
  return sectionFeed;
}

function printPosts(posts) {
  const postsTemplate = posts
    .map((post) => {
      const liked = post.likes.includes(auth.currentUser.uid);
      const postTemplate = `
  <section class='postTimeline'>
    <div class="headerPost">
      <p id='userName'>${post.name}</p>
      <p id='textPost'>${post.date}</p>
    </div>
    <p id='textPost'>${post.text}</p>
    <p class='sectionBtn'>
      <a class='btnDelete' id='btn-delete'><img src='../../img/delete.png' alt='Deletar'></a>
      <a class='btnEditar' id='btn-editar'><img src='../../img/editar.png' alt='Editar'></a>
    </p>
  </section>
  <section class='sectionBtnLikeDeslike'>
    <button class='btnLike' data-liked='${liked}' data-post-id='${post.id}'><img src='../../img/like.png' alt='Like'></button>
  </section>
`;
      return postTemplate;
    })
    .join('');
  sectionFeed.querySelector('#post-feed').innerHTML = postsTemplate;
  const deletePost = sectionFeed.querySelector('#btn-delete');
  const btnLike = sectionFeed.querySelector('.btnLike');

  btnLike.addEventListener('click', (e) => {
    if (btnLike.dataset.liked === 'true') {
      console.log('deslikePost');
      deslikePost(btnLike.dataset.postId, auth.currentUser.uid);
    }
    else {
      console.log('likePost');
      likePost(btnLike.dataset.postId, auth.currentUser.uid);
    }
  });

  deletePost.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.confirm('Deseja mesmo excluir este post?')) {
      removePost()
        .then(() => {
          window.location.reload();
          console.log('cheguei aqui');
        })
        .catch((error) => {
          const errorCode = errorFire(error.code);
          console.log(errorCode);
        });
    }
  });
}
}
