import { POSTS_PAGE, USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { getToken, goToPage } from "../index.js";
import { format, formatDistanceToNow } from "date-fns";
import { addLike, deleteLike } from "../api.js";

export function renderPostsPageComponent({ posts, appEl }) {
  // TODO: реализовать рендер постов из api
  console.log("Актуальный список постов:", posts);

  /**
   * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */
  const appHtml = `
              <div class="page-container">
                <div class="header-container"></div>
                 <ul class="posts"></ul>
              </div>`;
  appEl.innerHTML = appHtml;
  const postsEl = document.querySelector(".posts");
  postsEl.innerHTML = posts
    .map((post, index) => {
      return `<li class="post">
                    <div class="post-header" data-user-id=${post.user.id}>
                        <img src=${
                          post.user.imageUrl
                        } class="post-header__user-image">
                        <p class="post-header__user-name">${post.user.name}</p>
                    </div>
                    <div class="post-image-container">
                      <img class="post-image" src="${post.imageUrl}">
                    </div>
                    <div class="post-likes">
                      <button data-post-id="${post.id}" data-is-liked="${
        post.isLiked
      }" 
                      class="like-button" data-index="${index}">
                        <img src="${
                          post.isLiked
                            ? "./assets/images/like-active.svg"
                            : "./assets/images/like-not-active.svg"
                        }"/>
                      </button>
                      <p class="post-likes-text">
                        Нравится: <strong>${post.likes.length}</strong>
                      </p>
                    </div>
                    <p class="post-text">
                      <span class="user-name">${post.user.name}</span>
                      ${post.description}
                    </p>
                    <p class="post-date">
                      ${
                        new Date().getTime() -
                          new Date(post.createdAt).getTime() <
                        86400000
                          ? formatDistanceToNow(post.createdAt)
                          : format(post.createdAt, "dd.MM.yy hh:mm")
                      }
                    </p>
                  </li>`;
    })
    .join("");

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }

  initLikeListeners();
}
export function initLikeListeners(userId) {
  console.log(userId);
  const likeButtonList = document.querySelectorAll(".like-button");
  for (const likeButton of likeButtonList) {
    likeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!getToken()) {
        alert("Нужно авторизоваться");
        return;
      }
      console.log(likeButton.dataset);
      if (likeButton.dataset.isLiked === "true") {
        deleteLike({
          id: likeButton.dataset.postId,
          token: getToken(),
        }).then(() => {
          if (userId) {
            goToPage(USER_POSTS_PAGE, { userId });
          } else {
            goToPage(POSTS_PAGE);
          }
        });
      } else {
        addLike({
          id: likeButton.dataset.postId,
          token: getToken(),
        }).then(() => {
          if (userId) {
            goToPage(USER_POSTS_PAGE, { userId });
          } else {
            goToPage(POSTS_PAGE);
          }
        });
      }
    });
  }
}
