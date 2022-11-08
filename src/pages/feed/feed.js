/* eslint-disable brace-style */
/* eslint-disable no-param-reassign */
/* eslint-disable no-alert */
/* eslint-disable spaced-comment */
/* eslint-disable no-console */
import { logOutUser } from '../../lib/auth.js';
import {
  createPost,
  postScreen,
  auth,
  likePost,
  //removePost,
} from '../../lib/firestore.js';
import { errorFire } from '../../lib/errorFirebase.js';

//template da tela do feed completo
function getContentFeedTemplate() {
  return `
    <div>
    <header class='headerFeed'>
        <img src='../../img/logo.png' class='loginhoFeed' alt='Logo Peq Wanderlust'>
    </header>
    <nav class='navBar'>
      <ul>
        <a class='btnSIgnInOut' id='logOut'><img src='../../img/btnSair.png' alt='seta para sair'</a>
      </ul>
    </nav>
    <section class='msgBoasvindas'>
      <img src='${auth.currentUser.photoURL}' alt='User' class='fotoUser'>
      <p class='nomeUser'> Olá, ${auth.currentUser.displayName}!</p>
    </section>
    <div clas='corpotimeline'>
      <form id='create-Post'>
        <section class='boxModelPost'>
          <form>
            <textarea id='text-publish' style='resize: none' class='inputText' rows='3' cols='40' placeholder='Escreva detalhes sobre a estadia em sua residência...'></textarea>
            <button type='submit' id='publish-btn' class='publicBtn'>Publicar</button>
          </form>
        </section>
        <section class='timeline-post' id='post-feed'></section>
      </form> 
    </div>  
  </div>`;
}

//template do post
function getPostsTemplate(posts) {
  return posts.map((post) => {
    const postTemplate = `
      <section>

        <section class='postTimeline' data-section-post-id=${post.id}>
          <div class='headerPost'>
            <p id='userName'>${post.name}</p>
            <p id='textPost'>${post.date}</p>
          </div>
          <p data-post-id='${posts.id}' id='textPost'>${post.text}</p>

          <p class='sectionBtn'>
            <div class='modal'>
              <button class="btnDeleteEdit" id='btn-delete' data-post-id='${posts.id}'><img class='btnDelete' src='../../img/delete.png'></button>
              <button class="btnDeleteEdit" id='btn-editar'data=""><img class='btnEditar' src='../../img/editar.png' alt='Editar'></button>
            </div>
            
            <div class='modal-confirm'>
            <p> Tem certeza que deja excluir este post? </p>
            <button class='btn-del' data-sim='true'> SIM </button>
            <button class='btn-del' data-nao='true'> NÃO </button>
            </div>

            <div class='modal-edit'>
              <p> Confirma edição do post? </p>
              <button class='btn-del' data-salvar='true'> SALVAR </button>
              <button class='btn-del' data-cancelar='true'> CANCELAR </button>
            </div>
          </p>

        </section>
        
        <section class='sectionBtnLike'>
        <button class="btn-like" data-count-likes="${post.like.length}" data-like-btn="${post.id}" type="button">
        <img class="like" ${post.like.includes(auth.currentUser.uid) ? 'src="../../img/coração.png"' : 'src="../../img/coraçãovazio.png"'} alt="purple-heart"> 
        </button> 
      <p id='count-likes' class='likes-count'>${post.like.length}</p>
      </section>
    `; return postTemplate;
  }).join('');
}

async function printPost(sectionFeed) {
  const posts = await postScreen();
  sectionFeed.querySelector('#post-feed').innerHTML = getPostsTemplate(posts);
  const deletePost = sectionFeed.querySelector('#btn-delete');
  const editPost = sectionFeed.querySelector('#btn-editar');
  //btn deletar
  deletePost.addEventListener('click', (e) => {
    const postId = e.currentTarget.dataset.postId;
    document.querySelector(`#${postId} .modal-confirm`).style.display = 'flex';
  });

  //btn editar
  editPost.addEventListener('click', (e) => {
    const postId = e.currentTarget.dataset.postId;
    document.querySelector(`#${postId} .modal-edit`).style.display = 'flex';
  });

  //btn like e deslike
  document.querySelectorAll('#btn-like').forEach((button) => {
    button.addEventListener('click', async (e) => {
      const postId = e.currentTarget.dataset.like;
      const post = await postScreen(postId);
      const section = getContentFeedTemplate.querySelector(`[data-section-post-id='${postId}']`);
      const img = e.target;

      likePost(post, postId)
        .then((resultado) => {
          if (resultado.liked) {
            section.querySelector('#count-likes').innerText = resultado.count;
            img.setAttribute('src', '../../img/coração.png');
          } else {
            section.querySelector('#count-likes').innerText = resultado.count;
            img.setAttribute('src', '../../img/coraçãovazio.png');
          }
        });
    });
  });
}

export default () => {
  const sectionFeed = document.createElement('div');
  sectionFeed.innerHTML = getContentFeedTemplate();
  const createform = sectionFeed.querySelector('#create-Post');
  const textAreaPost = sectionFeed.querySelector('#text-publish');
  const btnLogOut = sectionFeed.querySelector('#logOut');

  //btn deslogar
  btnLogOut.addEventListener('click', () => {
    logOutUser().then(() => {
      window.location.hash = '#home';
    });
  });

  //Criando post
  createform.addEventListener('submit', (e) => {
    e.preventDefault();
    const postText = textAreaPost.value;
    createPost(postText)
      .then(async () => {
        await printPost(sectionFeed);
      })
      .catch((error) => {
        const errorCode = errorFire(error.code);
        console.log(errorCode);
      });
  });
  printPost(sectionFeed);

  return sectionFeed;
};
