import requestData from './util/requestData';
import '../styles/admin.scss';

interface AppWindow extends Window {
  run(data): void;
  componentHandler: any;
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

const API_URL = '/admin/photos';
const PREVIEW_CLASS = 'preview';
const UPDATE_PENDING_CLASS = 'update-pending';
const HIDDEN_CLASS = 'removed';
const ERROR_CLASS = 'error';

const editDialog: Dialog = {} as Dialog;
let galleryData;

function getPhotoDataById(id) {
  return galleryData.filter((p) => p.id === id)[0];
}

/**
 * Update the displayed data in the preview once its model is updated
 *
 * @param {HTMLElement} elem
 * @param {object} data
 */
function updateCardData(elem, id, data) {
  const permalink = `/photo/${data.slug}/`;
  const preview = elem.getElementsByClassName(PREVIEW_CLASS)[0];
  const photoData = getPhotoDataById(id);
  Object.assign(photoData, data);
  preview.getElementsByClassName('slug')[0].innerText = data.slug;
  preview.querySelector('.permalink a').href = permalink;
  if (data.deleted) {
    elem.classList.add(HIDDEN_CLASS);
  } else {
    elem.classList.remove(HIDDEN_CLASS);
  }
}

/**
 * Send the data of the edit dialog
 */
function updateData() {
  const id = Number(editDialog.id.value);
  const li = document.querySelector(`#thumbnails li[data-photo-id="${id}"]`);
  const data = {
    photos: {},
  };
  data.photos[id] = {
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

  requestData(API_URL, { method: 'put', data }).then((newData) => {
    if (li) {
      li.classList.remove(UPDATE_PENDING_CLASS);
      editDialog.elem.classList.remove(UPDATE_PENDING_CLASS);
      updateCardData(li, id, newData[id]);
      editDialog.elem.close();
    }
  }).catch((error) => {
    if (error && error.error && error.error.data) {
      Object.keys(error.error.data).forEach((key) => {
        const elem = editDialog[key];
        if (elem) {
          elem.parentElement.classList.add(ERROR_CLASS);
        }
      });
    }
  });
}

function removePhoto() {
  const photoId = Number(editDialog.id.value);
  const li = document.querySelector(`#thumbnails li[data-photo-id="${photoId}"]`);

  requestData(`${API_URL}/${photoId}`, { method: 'delete' }).then(() => {
    if (li) {
      li.parentElement.removeChild(li);
    }
  });
}

/**
 * Prepares the preview/details toggle when clicking an element
 *
 * @param {HTMLLIElement} li
 */
function addEditDetailsBehavior(li) {
  const id = parseInt(li.dataset.photoId, 10);
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
function addThumbnailBehavior() {
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
        thumb.src = (e.target as any).result;
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
function prepareEditDialog() {
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
    updateData();
  });
  document.getElementById('edit-remove').addEventListener('click', () => {
    removeDialog.showModal();
  });

  document.getElementById('remove-cancel').addEventListener('click', () => {
    removeDialog.close();
  });
  document.getElementById('remove-accept').addEventListener('click', () => {
    removePhoto();
    removeDialog.close();
    editDialog.elem.close();
  });
}

/**
 * Prepare the page dyncamic behavior
 */
(window as AppWindow).run = (data) => {
  galleryData = data;
  prepareEditDialog();

  addThumbnailBehavior();
  document.querySelectorAll('#thumbnails li').forEach((li) => {
    addEditDetailsBehavior(li);
  });
};