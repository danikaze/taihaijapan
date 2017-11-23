# User Settings model

Settings that the user can change to modify the behavior of the site.

Based on two files with the same structure.
1. `settings.default.json`, which will be read always and used as base to be modified by the next one.
2. `settings.json`, with only user customized settings.

## Structure

### controllers `{}`

One setting per page.

#### admin `{}`

List of options to apply to the admin page

| Property      | Type    | Default | Notes |
| ------------- | ------- | ------- | -----
| route         | string  | /admin  | route for the admin page |
| imagesPerPage | number  | 0       | Number of images to display in the index page. `0` for no limit |
| sortBy        | string  | added   | Name of the field (from the gallery model) to sort the photos |
| reverse       | boolean | true    | By default `ASC` order. Set to `true` to set it `DESC` |

#### index `{}`

List of options to apply to the index page

| Property  | Type    | Default | Notes |
| --------- | ------- | ------- | -----
| maxImages | number  | 5       | Number of images to display in the index page. `0` for no limit |
| sortBy    | string  | added   | Name of the field (from the gallery model) to sort the photos |
| reverse   | boolean | true    | By default `ASC` order. Set to `true` to set it `DESC` |

#### gallery `{}`

List of options to apply to the gallery page

| Property      | Type    | Default | Notes |
| ------------- | ------- | ------- | -----
| imagesPerPage | number  | 0       | Number of images to display per page. `0` for no limit |
| sortBy        | string  | added   | Name of the field (from the gallery model) to sort the photos |
| reverse       | boolean | true    | By default `ASC` order. Set to `true` to set it `DESC` |

### images `{}`

| Property     | Type   | Default        | Notes |
| ------------ | ------ | -------------- | ----- |
| originalPath | string | data/photos    | Path where original images will be stored as uploaded, relative to `backend/` |
| temporalPath | string | data/temp      | Path to store temporal files while processing photos |
| path         | string | public/photos  | Path where the resized images will be stored, relative to `backend/` |
| baseUrl      | string | /public/photos | URL pointing to the `path`, to use as a prefix for the images |

#### resize `{}`

Options for the image resizing

| Property     | Type   | Default                       | Notes |
| ------------ | ------ | ----------------------------- | ----- |
| resizePolicy | string | fit                           | `fit` or `cover` |
| format       | string | jpeg                          | `jpeg`, `png`, `webp`, `tiff` |
| outputFile   | string | {id:3}/{subdir}/{hash:32}.jpg | Output file relative to `images.path` and `images.baseUrl` replacing: This placeholders are available: `{sizeId[:size[,chr]]}`, `{id[:size[,chr]]}`, `{slug}`, `{random[:size]}`, `{hash[:size]}`, `{basename}`, `{ext}`, `{size}`, `{timestamp}` |

##### formatOptions `{}`

object passed to `sharp.toFormat(format, formatOptions)`

| Property  | Type   | Default | Notes |
| --------- | ------ | ------- | ----- |
| quality   | number | 80      | URL pointing to the `path`, to use as a prefix for the images |

#### sizes `[{}]`

List of thumbnails to generate per image, in an array of an object with the following properties

| Property | Type   | Notes |
| -------- | ------ | ----- |
| w        | number | Maximum width for the thumbnail |
| h        | number | Maximum height for the thumbnail or `0` to fit the width |
| id       | string | Name of the folder, to be used as `{sizeId}` placeholder in `images.resize.outputFile` |

The default sizes are:

| w    | h   | id |
| ---- | --- | -- |
| 400  | 0   | T  |
| 720  | 0   | S  |
| 1280 | 0   | M  |
| 2000 | 0   | L  |
