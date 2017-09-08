# Taihai Japan

[Taihai Japan](https://taihaijapan.com) is a photography project by [@danikaze](https://twitter.com/danikaze) and this is the source gallery code of that site.

Feel free to fork it and customize it to create your own JavaScript based gallery ;)

This code is based on one of his [JavaScript boilerplates](https://github.com/danikaze/boilerplate-webpack-babel).

# Changelog

## 0.5.0
Minor fixes
Removed support for IE<=8
Removed auto image centering scroll in the index gallery
Added twitter card support (static with logo, same as FB preview)
Added cache on `photos/` via apache `mod_expires`

## 0.4.0
Added an unique id to the photos db, which is added also into the generated `gallery.json`
Choose a better bg size for the index page, based on the screen size

## 0.3.0
webpack-dev-server now is visible in the local network.
Added `photoswipe` to the `/gallery` page.

## 0.2.0
Added a **See more** button linked to the `/gallery/`, where a list of all the photos is presented.

## 0.1.0
First version showing the index with the latest 5 photos, retrieved via ajax.
