import debounce from 'lodash/debounce';
import requestData from './util/requestData/requestData';
import '../styles/admin.scss';

const API_URL = '/admin/photos';
const PREVIEW_CLASS = 'preview';
const EDIT_CLASS = 'edit';
const ACTIVE_CLASS = 'active';
const UPDATE_PENDING_CLASS = 'update-pending';
const HIDDEN_CLASS = 'removed';
const WAIT_BEFORE_UPDATE_MS = 1000;

const debouncedUpdateData = debounce(doUpdateData, WAIT_BEFORE_UPDATE_MS);

let activeLi;
let updateData = {};
let updateElements = [];

/**
 * Update the displayed data in the preview once its model is updated
 *
 * @param {HTMLElement} elem
 * @param {object} data
 */
function updateCardData(elem, data) {
  const slug = data && data.slug;
  if (slug) {
    const permalink = `/photo/${slug}/`;
    const preview = elem.getElementsByClassName(PREVIEW_CLASS)[0];
    const edit = elem.getElementsByClassName(EDIT_CLASS)[0];
    preview.getElementsByClassName('slug')[0].innerText = slug;
    preview.querySelector('.permalink a').href = permalink;
    const editPermalink = edit.querySelector('.permalink a');
    editPermalink.href = permalink;
    editPermalink.innerText = permalink;
  }
}

/**
 * Send the request with the prepared data to update items
 */
function doUpdateData() {
  const data = {
    photos: updateData,
  };

  requestData(API_URL, { method: 'PUT', data }).then(() => {
    updateElements.forEach((elem) => {
      elem.classList.remove(UPDATE_PENDING_CLASS);
      updateCardData(elem, updateData[elem.dataset.photoId]);
    });
    updateData = {};
    updateElements = [];
  });
}

/**
 * Send the request to set a photo as removed
 *
 * @param {HTMLLIElement} li
 */
function removeItem(li) {
  const id = li.dataset.photoId;
  const data = { photos: {} };
  data.photos[id] = { deleted: true };

  requestData(API_URL, { method: 'PUT', data }).then(() => {
    delete updateData[id];
    li.classList.add(HIDDEN_CLASS);
  });
}

/**
 * Send the request to restore a photo (un-delete it)
 *
 * @param {HTMLLIElement} li
 */
function restoreItem(li) {
  const id = li.dataset.photoId;
  const data = { photos: {} };
  data.photos[id] = { deleted: false };

  requestData(API_URL, { method: 'PUT', data }).then(() => {
    li.classList.remove(HIDDEN_CLASS);
  });
}

/**
 * Stores the changing data to be sent in only one request
 *
 * @param {HTMLLIElement} li
 * @param {HTMLInputElement} input
 */
function prepareDataChange(li, input) {
  const id = li.dataset.photoId;
  let data = updateData[id];

  if (!data) {
    data = {};
    updateData[id] = data;
  }

  data[input.name] = input.value;
  li.classList.add(UPDATE_PENDING_CLASS);
  updateElements.push(li);
  debouncedUpdateData();
}

/**
 * Prepares the preview/details toggle when clicking an element
 *
 * @param {HTMLLIElement} li
 */
function addToggleDetailsBehavior(li) {
  // open-close by clicking the img
  li.querySelectorAll('img').forEach((img) => {
    img.addEventListener('click', (event) => {
      if (activeLi) {
        activeLi.classList.remove(ACTIVE_CLASS);
        if (activeLi === li) {
          activeLi = null;
          return;
        }
      }

      activeLi = li;
      activeLi.classList.add(ACTIVE_CLASS);
    });
  });

  // close by clicking the close button
  li.querySelectorAll('.close-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (activeLi === li) {
        activeLi.classList.remove(ACTIVE_CLASS);
        activeLi = null;
      }
    });
  });
}

/**
 * Add the behavior to update the photo data automatically when changing
 *
 * @param {HTMLLIElement} li
 */
function addUpdateDetailsBehavior(li) {
  li.querySelectorAll('input').forEach((input) => {
    if (input.name) {
      input.addEventListener('change', prepareDataChange.bind(null, li, input));
    }
  });
}

/**
 * Add the behavior to remove/restore photos
 *
 * @param {HTMLLIElement} li
 */
function addRemoveButtonBehavior(li) {
  li.querySelectorAll('.hide-button input').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (li.classList.contains(HIDDEN_CLASS)) {
        restoreItem(li);
      } else {
        removeItem(li);
      }
    });
  });
}

/**
 * Add the behavior to show a thumbnail of the image to upload when chosen
 */
function addThumbnailBehavior() {
  const input = document.getElementById('photo');
  const icon = document.getElementById('photo-icon');
  const thumb = document.getElementById('new-thumbnail');
  const loading = document.getElementById('new-thumbnail-loading');

  input.addEventListener('change', (event) => {
    thumb.style.display = 'none';
    const file = input.files && input.files[0];

    if (file) {
      loading.style.display = 'block';
      const reader = new FileReader();
      reader.onload = (e) => {
        loading.style.display = 'none';
        thumb.src = e.target.result;
        icon.style.display = 'none';
        thumb.style.display = '';
      };

      reader.readAsDataURL(file);
    } else {
      thumb.src = '';
      icon.style.display = '';
    }
  });
}

/**
 * Prepare the page dyncamic behavior
 */
function run() {
  addThumbnailBehavior();
  document.querySelectorAll('#thumbnails li').forEach((li) => {
    addToggleDetailsBehavior(li);
    addUpdateDetailsBehavior(li);
    addRemoveButtonBehavior(li);
  });
}

run();
