# Taihai Japan

[Taihai Japan](https://taihaijapan.com) is a photography project by [@danikaze](https://twitter.com/danikaze) and this is the source code for the gallery of that site.

Feel free to fork it and customize it to create your own JavaScript/NodeJS based gallery ;)

# Roadmap

List of planned tasks/features (in no specific order):

* Migration of the code to TypeScript for more rebust code
* Migration of the model to SQLite
  * Allow concurrent connections
  * Maintain simplicity (no database server needed)
* Imlement canonical AMP
* Move to ReactJS and render the components from server side
  * Still provide minimum JavaScript in browser side to minimize loading times
* Provide several builds to server polyfills only in old browsers, optimizing loading times
* PWA:
  * Caching of resources and images for offline navigation
* Continuous Integration
  * TravisCI
  * Code linting
  * Unit testing
  * Lighthouse reports

# Changelog

## 0.9.0
* Changed the way the data model is managed (_settings_ and _gallery_)
* Added an `admin` interface to administrate the data graphically

## 0.8.0
* `index/` is displayed now with one big photo and some thumbnails.
* Thumbnails are highlighted on mouse over.

## 0.7.2
* Re-included the _fit image_ script in the `/index` page.

## 0.7.1
* Fix generated url when sharing from `/gallery` (regex was only working for `/photo` page)

## 0.7.0
* Added `/photo` end point, to serve as permalink for a photo and modified `PhotoswipeUI` acording to properly generate share links. It also displays the proper photo for SNS cards meta-data.

## 0.6.0
* Moved rendering logic to server side via express
* Folder structure changed to build the frontend elements inside the `public` folder in `backend`
* Index page don't have JS anymore
* `/gallery` is generated from server side and photoswipe gallery feature is added in JS after loaded
* Improved path specification for setting files
* Added requirement of min node version
* Show last photos instead of the first ones in the index page
* Change default settings for stg and prod

## 0.5.0
* Minor fixes
* Removed support for IE<=8
* Removed auto image centering scroll in the index gallery
* Added twitter card support (static with logo, same as FB preview)
* Added cache on `photos/` via apache `mod_expires`
* Simulate `srcset` img behavior for IE browsers via `SrcSetEmu`

## 0.4.0
* Added an unique id to the photos db, which is added also into the generated `gallery.json`
* Choose a better bg size for the index page, based on the screen size

## 0.3.0
* webpack-dev-server now is visible in the local network.
* Added `photoswipe` to the `/gallery` page.

## 0.2.0
* Added a **See more** button linked to the `/gallery`, where a list of all the photos is presented.

## 0.1.0
* First version showing the index with the latest 5 photos, retrieved via ajax.
