import debounce from 'lodash/debounce';
import requestData from './util/requestData/requestData';
import '../styles/admin.scss';

const API_URL = '/admin/photos';
const PREVIEW_CLASS = 'preview';
const ACTIVE_CLASS = 'active';
const UPDATE_PENDING_CLASS = 'update-pending';
const REMOVE_CLASS = 'removed';
const CONFIRMATION_CLASS = 'confirm';
const CONFIRMATION_TIMEOUT = 3000;
const WAIT_BEFORE_UPDATE_MS = 1000;

const debouncedUpdateData = debounce(doUpdateData, WAIT_BEFORE_UPDATE_MS);

let activeLi;
let updateData = {};
let updateElements = [];

/**
 * Update the displayed data in the preview once its model is updated
 *
 * @param {HTMLElement} preview
 * @param {object} data
 */
function updatePreviewData(preview, data) {
  const slug = data.slug;
  if (slug) {
    const elem = preview.getElementsByClassName('slug')[0];
    elem.innerText = slug;
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
      updatePreviewData(elem.getElementsByClassName(PREVIEW_CLASS)[0], updateData[elem.dataset.photoId]);
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
    li.classList.add(REMOVE_CLASS);
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
    li.classList.remove(REMOVE_CLASS);
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
    input.addEventListener('change', prepareDataChange.bind(null, li, input));
  });
}

/**
 * Add the behavior to remove photos, after a confirmation
 *
 * @param {HTMLLIElement} li
 */
function addRemoveItemBehavior(li) {
  li.querySelectorAll('.delete-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (button.classList.contains(CONFIRMATION_CLASS)) {
        removeItem(li);
        return;
      }
      button.classList.add(CONFIRMATION_CLASS);
      setTimeout(() => {
        button.classList.remove(CONFIRMATION_CLASS);
      }, CONFIRMATION_TIMEOUT);
    });
  });
}

/**
 * Add the behavior to restore removed photos, after a confirmation
 *
 * @param {HTMLLIElement} li
 */
function addRestoreItemBehavior(li) {
  li.querySelectorAll('.restore-button').forEach((button) => {
    button.addEventListener('click', (event) => {
      if (button.classList.contains(CONFIRMATION_CLASS)) {
        restoreItem(li);
        return;
      }
      button.classList.add(CONFIRMATION_CLASS);
      setTimeout(() => {
        button.classList.remove(CONFIRMATION_CLASS);
      }, CONFIRMATION_TIMEOUT);
    });
  });
}

/**
 * Prepare the page dyncamic behavior
 */
function run() {
  document.querySelectorAll('#thumbnails li').forEach((li) => {
    addToggleDetailsBehavior(li);
    addUpdateDetailsBehavior(li);
    addRemoveItemBehavior(li);
    addRestoreItemBehavior(li);
  });
}

run();
