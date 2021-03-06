/*
 * Entry point of the Admin page
 */
import '../styles/admin.scss';

import { ApiErrorResponse } from '../../interfaces/controllers';
import { AdminPhoto, Dict } from '../../interfaces/frontend';
import { requestData } from './util/request-data';
import { showSnackbar } from './util/show-snackbar';
import { t } from './util/i18n';

interface AppWindow extends Window {
  componentHandler: {
    downgradeElements(HTMLElement): void;
    upgradeElement(HTMLElement): void;
  };
  run(apiUrl: string, data: AdminPhoto[], i18n: Dict<string>): void;
}

interface MdlElement extends HTMLElement {
  close(): void;
  showModal(): void;
}

interface Dialog {
  elem: MdlElement;
  id: HTMLInputElement;
  hidden: HTMLInputElement;
  photo: HTMLInputElement;
  title: HTMLInputElement;
  slug: HTMLInputElement;
  tags: HTMLInputElement;
  keywords: HTMLInputElement;
  mdl: HTMLElement[];
}

const PREVIEW_CLASS = 'preview';
const UPDATE_PENDING_CLASS = 'update-pending';
const HIDDEN_CLASS = 'removed';
const ERROR_CLASS = 'error';

const editDialog = {} as Dialog;
/** Global gallery data */
let galleryData;
/** Api url to update a photo data */
let apiUrl: string;
/** Localized messages */
let i18n: Dict<string>;

function getPhotoDataById(id) {
  return galleryData.filter((p) => p.id === id)[0];
}

/**
 * Update the displayed data in the preview once its model is updated
 *
 * @param elem HTML element of the preview card
 * @param id   ID of the photo
 * @param data data to update
 */
function updateCardData(elem: HTMLElement, id: number, data): void {
  const permalink = `/photo/${data.slug}/`;
  const preview = elem.getElementsByClassName(PREVIEW_CLASS)[0];
  const photoData = getPhotoDataById(id);
  Object.assign(photoData, data);
  (preview.getElementsByClassName('slug')[0] as HTMLElement).innerText = data.slug;
  (preview.querySelector('.permalink a') as HTMLAnchorElement).href = permalink;
  if (data.visible) {
    elem.classList.remove(HIDDEN_CLASS);
  } else {
    elem.classList.add(HIDDEN_CLASS);
  }
}

/**
 * Send the data of the edit dialog
 *
 * @id Photo ID
 * @data New photo data to send
 */
function updateData(id: number, data: { slug: string }): void {
  function updateSuccess(newData) {
    if (li) {
      li.classList.remove(UPDATE_PENDING_CLASS);
      editDialog.elem.classList.remove(UPDATE_PENDING_CLASS);
      updateCardData(li, id, newData);
      editDialog.elem.close();
    }

    showSnackbar(t(i18n.photoUpdate, { slug: newData.slug }));
  }

  function updateError(response: ApiErrorResponse) {
    li.classList.remove(UPDATE_PENDING_CLASS);
    editDialog.elem.classList.remove(UPDATE_PENDING_CLASS);

    showSnackbar(t(i18n.photoUpdateError, { slug: data.slug }));
  }

  function tryUpdate() {
    if (li) {
      li.classList.add(UPDATE_PENDING_CLASS);
      editDialog.elem.classList.add(UPDATE_PENDING_CLASS);
    }

    return requestData(`${apiUrl}/${id}`, { body: data, method: 'put' })
      .then(updateSuccess, updateError);
  }

  const li = document.querySelector(`#thumbnails li[data-photo-id="${id}"]`) as HTMLLIElement;
  tryUpdate();
}

/**
 * @param id ID of the photo to remove
 */
function removePhoto(id: number): void {
  function updateSuccess() {
    const li = document.querySelector(`#thumbnails li[data-photo-id="${id}"]`);
    if (li) {
      li.parentElement.removeChild(li);
    }
  }

  function updateError() {
    showSnackbar(i18n.errorRemove, i18n.actionRetry)
      .then(tryRemove);
  }

  function tryRemove() {
    return requestData(`${apiUrl}/${id}`, { method: 'delete' })
      .then(updateSuccess, updateError);
  }

  tryRemove();
}

/**
 * Prepares the preview/details toggle when clicking an element
 *
 * @param li LI Element containing the details to add the dynamic behavior to
 */
function addEditDetailsBehavior(li: HTMLLIElement): void {
  const id = Number(li.dataset.photoId);
  // open-close by clicking the img
  li.querySelectorAll('img').forEach((img) => {
    img.addEventListener('click', (event) => {
      const photo = getPhotoDataById(id);

      editDialog.id.value = photo.id;
      editDialog.hidden.checked = !!photo.visible;
      editDialog.photo.src = photo.imgs[0].src;
      editDialog.title.value = photo.title;
      editDialog.slug.value = photo.slug;
      editDialog.tags.value = photo.tags.join(', ');
      editDialog.keywords.value = photo.keywords;

      editDialog.mdl.forEach((elem) => {
        (window as AppWindow).componentHandler.downgradeElements(elem);
        (window as AppWindow).componentHandler.upgradeElement(elem);
      });
      editDialog.elem.showModal();
    });
  });
}

/**
 * Add the behavior to show a thumbnail of the image to upload when chosen
 */
function addThumbnailBehavior(): void {
  const input = document.getElementById('photo') as HTMLInputElement;
  const icon = document.getElementById('photo-icon');
  const thumb = document.getElementById('new-thumbnail') as HTMLImageElement;
  const loading = document.getElementById('new-thumbnail-loading');

  input.addEventListener('change', (event) => {
    thumb.style.display = 'none';
    const file = input.files && input.files[0];

    if (file) {
      loading.style.display = 'block';
      const reader = new FileReader();
      reader.onload = (e) => {
        loading.style.display = 'none';
        thumb.src = (e.target as FileReader).result as string;
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
 * Prepare behavior for edit/remove dialogs
 */
function prepareEditDialog(): void {
  const removeDialog = document.getElementById('remove-dialog') as MdlElement;

  editDialog.elem = document.getElementById('edit-dialog') as MdlElement;

  editDialog.id = document.getElementById('edit-id') as HTMLInputElement;
  editDialog.hidden = document.getElementById('edit-hidden') as HTMLInputElement;
  editDialog.photo = document.getElementById('edit-photo') as HTMLInputElement;
  editDialog.title = document.getElementById('edit-title') as HTMLInputElement;
  editDialog.slug = document.getElementById('edit-slug') as HTMLInputElement;
  editDialog.tags = document.getElementById('edit-tags') as HTMLInputElement;
  editDialog.keywords = document.getElementById('edit-keywords') as HTMLInputElement;

  // elements to reset as mdl dynamic elements
  editDialog.mdl = [
    editDialog.id.parentElement,
    editDialog.hidden.parentElement,
    editDialog.photo.parentElement,
    editDialog.title.parentElement,
    editDialog.slug.parentElement,
    editDialog.tags.parentElement,
    editDialog.keywords.parentElement,
  ];

  // reset marked errors on this elements
  [
    editDialog.title,
    editDialog.slug,
    editDialog.tags,
    editDialog.keywords,
  ].forEach((elem) => {
    elem.addEventListener('keyup', () => {
      elem.parentElement.classList.remove(ERROR_CLASS);
    });
  });

  document.getElementById('edit-cancel').addEventListener('click', () => {
    editDialog.elem.close();
  });
  document.getElementById('edit-save').addEventListener('click', () => {
    const id = Number(editDialog.id.value);
    const data = {
      title: editDialog.title.value,
      slug: editDialog.slug.value,
      tags: editDialog.tags.value,
      keywords: editDialog.keywords.value,
      visible: editDialog.hidden.checked,
    };
    updateData(id, data);
  });
  document.getElementById('edit-remove').addEventListener('click', () => {
    removeDialog.showModal();
  });

  document.getElementById('remove-cancel').addEventListener('click', () => {
    removeDialog.close();
  });
  document.getElementById('remove-accept').addEventListener('click', () => {
    removePhoto(Number(editDialog.id.value));
    removeDialog.close();
    editDialog.elem.close();
  });
}

/**
 * Prepare the page dynamic behavior
 */
(window as AppWindow).run = (url, data, translations): void => {
  galleryData = data;
  apiUrl = url;
  i18n = translations;

  prepareEditDialog();
  addThumbnailBehavior();
  document.querySelectorAll('#thumbnails li').forEach((li: HTMLLIElement) => {
    addEditDetailsBehavior(li);
  });
};
