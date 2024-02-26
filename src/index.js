// var API_KEY = '42569428-b104c6fed739ee1603d22c65f';
// var URL =
//   'https://pixabay.com/api/?key=' +
//   API_KEY +
//   '&q=' +
//   encodeURIComponent('red roses');
// $.getJSON(URL, function (data) {
//   if (parseInt(data.totalHits) > 0)
//     $.each(data.hits, function (i, hit) {
//       console.log(hit.pageURL);
//     });
//   else console.log('No hits');
// });

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';

Notiflix.Notify.Init();

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const apiKey = '42569428-b104c6fed739ee1603d22c65f'; //
let page = 1;
let query = '';

searchForm.addEventListener('submit', async event => {
  event.preventDefault();
  query = event.target.searchQuery.value.trim();
  if (query === '') return;

  try {
    const { data } = await axios.get(
      `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
    );

    if (data.hits.length === 0) {
      notiflix.Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (page === 1) {
      notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }

    if (page === 1) {
      gallery.innerHTML = '';
    }

    data.hits.forEach(image => {
      const card = document.createElement('div');
      card.classList.add('photo-card');
      card.innerHTML = `
        <a href="${image.largeImageURL}" class="lightbox">
          <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${image.likes}</p>
          <p class="info-item"><b>Views:</b> ${image.views}</p>
          <p class="info-item"><b>Comments:</b> ${image.comments}</p>
          <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
        </div>
      `;
      gallery.appendChild(card);
    });

    if (data.totalHits > page * 40) {
      loadMoreBtn.style.display = 'block';
    } else {
      loadMoreBtn.style.display = 'none';
      notiflix.Notify.warning(
        "We're sorry, but you've reached the end of search results."
      );
    }

    const lightbox = new SimpleLightbox('.lightbox');
    lightbox.refresh();

    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });

    page++;
  } catch (error) {
    console.error('Error fetching images:', error);
  }
});

loadMoreBtn.addEventListener('click', () => {
  searchForm.dispatchEvent(new Event('submit'));
});
