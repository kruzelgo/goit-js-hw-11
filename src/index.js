import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let totalHits = 0;
let lightbox;

const apiKey = '42569428-b104c6fed739ee1603d22c65f';
const perPage = 40;

const fetchPhotos = async (query, page) => {
  try {
    const { data } = await axios.get(
      `https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
    );
    return data;
  } catch (error) {
    throw new Error(error);
  }
};
const renderPhotos = (data, append = false) => {
  if (data.hits.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    gallery.innerHTML = '';
  } else {
    const markup = data.hits
      .map(
        ({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        }) => `
      <div class="photo-card">
        <a href="${largeImageURL}" class="lightbox">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        </a>
        <div class="info">
          <p class="info-item"><b>Likes:</b> ${likes}</p>
          <p class="info-item"><b>Views:</b> ${views}</p>
          <p class="info-item"><b>Comments:</b> ${comments}</p>
          <p class="info-item"><b>Downloads:</b> ${downloads}</p>
        </div>
      </div>`
      )
      .join('');
    if (append) {
      gallery.innerHTML += markup;
    } else {
      gallery.innerHTML = markup;
    }
    lightbox = new SimpleLightbox('.lightbox');
    const { height: cardHeight } =
      gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
};
const searchPhotos = async query => {
  try {
    const data = await fetchPhotos(query, page);
    totalHits = data.totalHits;
    renderPhotos(data);
    if (data.hits.length === 0) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }
  } catch (error) {
    Notiflix.Notify.failure(`ERROR: ${error.message}`);
  }
};
searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const query = event.target.searchQuery.value.trim();
  if (query === '') {
    Notiflix.Notify.warning('Please enter a search query!');
    return;
  }
  page = 1;
  searchPhotos(query);
});
loadMoreBtn.addEventListener('click', async () => {
  page++;
  try {
    const data = await fetchPhotos(searchForm.searchQuery.value.trim(), page);
    renderPhotos(data, true);
    if (page * perPage >= totalHits) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    Notiflix.Notify.failure(`ERROR: ${error.message}`);
  }
});
