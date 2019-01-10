/*
 * Entry point of the Admin page
 */
import '../styles/admin.scss';

import { requestData } from './util/request-data';
import { AdminPhoto } from '../../interfaces/frontend';

interface AppWindow extends Window {
  componentHandler: {
    downgradeElements(HTMLElement): void;
    upgradeElement(HTMLElement): void;
  };
  run(apiUrl: string, data: AdminPhoto[]): void;
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
  if (data.deleted) {
    elem.classList.add(HIDDEN_CLASS);
  } else {
    elem.classList.remove(HIDDEN_CLASS);
  }
}

/**
 * Send the data of the edit dialog
 */
function updateData(apiUrl: string): void {
  const id = Number(editDialog.id.value);
  const li = document.querySelector(`#thumbnails li[data-photo-id="${id}"]`) as HTMLLIElement;
  const body = {
    photos: {},
  };
  body.photos[id] = {
    title: editDialog.title.value,
    slug: editDialog.slug.value,
    tags: editDialog.tags.value,
    keywords: editDialog.keywords.value,
    visible: editDialog.hidden.checked,
  };

  if (li) {
    li.classList.add(UPDATE_PENDING_CLASS);
    editDialog.elem.classList.add(UPDATE_PENDING_CLASS);
  }

  requestData(`${apiUrl}/${id}`, { body, method: 'put' }).then((newData) => {
    if (li) {
      li.classList.remove(UPDATE_PENDING_CLASS);
      editDialog.elem.classList.remove(UPDATE_PENDING_CLASS);
      updateCardData(li, id, newData[id]);
      editDialog.elem.close();
    }
  }).catch((error) => {
    if (!error || !error.error || !error.error.data) {
      return;
    }

    Object.keys(error.error.data).forEach((key) => {
      const elem = editDialog[key];
      if (elem) {
        elem.parentElement.classList.add(ERROR_CLASS);
      }
    });
  });
}

/**
 * @param photoId ID of the photo to remove
 */
function removePhoto(apiUrl: string, photoId: number): void {
  const li = document.querySelector(`#thumbnails li[data-photo-id="${photoId}"]`);

  requestData(`${apiUrl}/${photoId}`, { method: 'delete' }).then(() => {
    if (li) {
      li.parentElement.removeChild(li);
    }
  });
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
function prepareEditDialog(apiUrl: string): void {
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
    updateData(apiUrl);
  });
  document.getElementById('edit-remove').addEventListener('click', () => {
    removeDialog.showModal();
  });

  document.getElementById('remove-cancel').addEventListener('click', () => {
    removeDialog.close();
  });
  document.getElementById('remove-accept').addEventListener('click', () => {
    removePhoto(apiUrl, Number(editDialog.id.value));
    removeDialog.close();
    editDialog.elem.close();
  });
}

/**
 * Prepare the page dynamic behavior
 */
(window as AppWindow).run = (apiUrl, data): void => {
  galleryData = data;
  prepareEditDialog(apiUrl);

  addThumbnailBehavior();
  document.querySelectorAll('#thumbnails li').forEach((li: HTMLLIElement) => {
    addEditDetailsBehavior(li);
  });
};
