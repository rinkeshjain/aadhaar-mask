![[object Object]](https://resize.indiatv.in/resize/newbucket/905_509/2022/05/masked-aadhaar-1653820165.jpg)


# Aadhaar Masking Utility

`aadhaar-mask` is a react project that can itendify and mask Aadhaar number avaible in selected image file.

## Setup

To Start with Project you need to replace API_KEY to [Google Cloud vision library](https://cloud.google.com/vision/docs/drag-and-drop)

```javascript
vision.init({ auth: 'API_KEY' });
```

this porject support image roataion and resize, Once to replace your API Key you're good to go:

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.



## Sample Aadhaar
 <img src="https://github.com/rinkeshjain/aadhaar-mask/blob/main/media/normal_aadhaar.png" width="600" style="max-width:100%;">   
 
 ## Result Mask Aadhaar
 <img src="https://github.com/rinkeshjain/aadhaar-mask/blob/main/media/mask_aadhaar.png" width="600" style="max-width:100%;">  

## License

[MIT](https://opensource.org/licenses/mit-license.html)
