import addEventListener from './addEventListener';

class VerticalGallery {

  /**
   * Creates an instance of VerticalGallery.
   *
   * @param {DOM} elem Element where create the gallery
   * @param {Object} [options]
   * @param {Number} [options.marginH]
   *
   * @memberOf VerticalGallery
   */
  constructor(elem, galleryPhotos, options) {
    this.elem = elem;
    this.photos = galleryPhotos;
    this.options = Object.assign({
      imgSelector: 'img',
      marginH: 20,
      initialPhotos: 5,
      scrollDelay: 150,
      scrollDuration: 150,
      scrollMinCoverage: 0.75,
      scrollFrequency: 1000 / 60,
      scrollCooldown: 300,
      scrollDeadZone: 2,
      logo: null,
    }, options);

    this.bindedCenterImage = this.centerImage.bind(this);
    this.bindedFitImages = this.fitImages.bind(this);
    this.bindedScrollHandler = this.scrollHandler.bind(this);
    this.bindedScrollHandler = this.scrollHandler.bind(this);

    this.createThumbnails();
    this.cacheImageList();

    addEventListener(window, 'resize', this.bindedFitImages);
    addEventListener(window, 'scroll', this.bindedScrollHandler);
  }

  /**
   * Cache the list of <img> of the gallery
   */
  cacheImageList() {
    this.imageList = this.elem.querySelectorAll(this.options.imgSelector);
  }

  /**
   * Scroll the window an offset in the specified time
   */
  animateScroll(offsetX, offsetY, time) {
    window.removeEventListener('scroll', this.bindedScrollHandler);
    return new Promise((resolve) => {
      let steps = time / this.options.scrollFrequency;
      const dX = offsetX / steps;
      const dY = offsetY / steps;
      const targetX = window.scrollX - offsetX;
      const targetY = window.scrollY - offsetY;

      const bindedMove = move.bind(this);

      function move() {
        steps--;
        if (steps < 1) {
          window.scroll(targetX, targetY);
          clearTimeout(this.animatedScrollTimeout);
          setTimeout(() => addEventListener(window, 'scroll', this.bindedScrollHandler),
            this.options.scrollCooldown);
          resolve(true);
        } else {
          window.scroll(window.scrollX - dX, window.scrollY - dY);
          clearTimeout(this.animatedScrollTimeout);
          this.animatedScrollTimeout = setTimeout(bindedMove, this.options.scrollFrequency);
        }
      }

      bindedMove();
    });
  }

  /**
   * Get the bounds of the image that needs to be centered
   * If the scroll is too high, it assumes no image is centered,
   *
   * @returns {<img>} Most centered `<img>` element or `null` if none
   */
  getMostCenteredImage() {
    if (!this.imageList || !this.imageList.length || window.scrollY === 0) {
      return null;
    }

    if (this.options.topDeadElement) {
      const topDeadElementBounds = this.options.topDeadElement.getBoundingClientRect();
      if (topDeadElementBounds.bottom > topDeadElementBounds.height / 2 &&
          topDeadElementBounds.right > topDeadElementBounds.width / 2) {
        return null;
      }
    }

    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    let minDistance = Infinity;
    let targetImage;
    let bounds;
    let dist;

    for (let i = 0; i < this.imageList.length; i++) {
      bounds = this.imageList[i].getBoundingClientRect();
      dist = Math.abs(((bounds.left + bounds.width) / 2) - screenCenterX)
          + Math.abs(((bounds.top + bounds.bottom) / 2) - screenCenterY);
      if (dist < minDistance) {
        targetImage = this.imageList[i];
        minDistance = dist;
      } else {
        return targetImage;
      }
    }
    return targetImage;
  }

  /**
   * Resize an image to fit in a box
   */
  fitImage(img, maxW, maxH) {
    if (!maxW) {
      maxW = this.elem.offsetWidth;
      maxH = window.innerHeight - this.options.marginH;
    }

    const ratio = Math.min(maxW / img.width, maxH / img.height);
    img.style.width = `${img.width * ratio}px`;
    // img.style.height = `${img.height * r}px`;
  }

  /**
   * Resize photos to fit in the screen
   */
  fitImages() {
    const maxW = this.elem.offsetWidth;
    const maxH = window.innerHeight - this.options.marginH;
    const currentImg = this.getMostCenteredImage();

    this.imageList.forEach(img => this.fitImage(img, maxW, maxH));
    this.centerImage(currentImg);
  }

  /**
   * Center a bounding client rect in the screen
   */
  centerBounds(bounds, time) {
    if (!bounds) {
      return;
    }

    const dX = (window.innerWidth / 2) - bounds.left - (bounds.width / 2);
    const dY = (window.innerHeight / 2) - bounds.top - (bounds.height / 2);

    if (Math.abs(dX) > this.options.scrollDeadZone ||
        Math.abs(dY) > this.options.scrollDeadZone) {
      this.animateScroll(dX, dY, time || this.options.scrollDuration);
    }
  }

  /**
   * Center a photo in the screen after a scroll
   */
  centerImage(targetImg, time, force) {
    if (!targetImg) {
      targetImg = this.getMostCenteredImage();
    }
    if (!targetImg) {
      return;
    }
    if (!force &&
        targetImg.width < window.innerWidth * this.options.scrollMinCoverage &&
        targetImg.height < window.innerHeight * this.options.scrollMinCoverage) {
      return;
    }

    this.centerBounds(targetImg.getBoundingClientRect(), time);
  }

  /**
   *
   *
   */
  scrollHandler() {
    clearTimeout(this.delayScrollTimeout);
    this.delayScrollTimeout = setTimeout(this.bindedCenterImage, this.options.scrollDelay);
  }

  /**
   * Create and set the thumbnails for the index gallery
   */
  createThumbnails() {
    // return the img src tag as src="url"
    function getSrcTag(imgs) {
      return imgs.length ? `src="${imgs[0].src}"` : '';
    }

    // return the img srcset tag as srcset="url1 w h, url2 w h, ..., urln w h"
    function getSrcsetTag(imgs) {
      if (imgs.length < 2) {
        return '';
      }

      const srcset = [];

      imgs.forEach((img) => {
        let code = img.src;

        if (img.w) {
          code += ` ${img.w}w`;
        }
        if (img.h) {
          code += ` ${img.h}h`;
        }

        srcset.push(code);
      });

      return `srcset="${srcset.join(', ')}"`;
    }

    const photos = this.photos;
    const n = Math.min(photos.length, this.options.initialPhotos);
    const parent = this.elem;
    let li;
    let img;

    for (let i = 0; i < n; i++) {
      const imgs = photos[i];
      if (imgs.length) {
        li = document.createElement('li');
        li.innerHTML = `<img ${getSrcTag(imgs)} ${getSrcsetTag(imgs)} alt="photo">`;
        img = li.children[0];
        addEventListener(img, 'load', this.fitImage.bind(this, img, null, null));
        parent.appendChild(li);
      }
    }
  }
}

module.exports = VerticalGallery;
