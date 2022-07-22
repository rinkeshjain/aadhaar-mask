import './App.css';
import vision from "react-cloud-vision-api";
import Resizer from "react-image-file-resizer";
import React from 'react';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.angle = 0;
  }
  state = {
    file: null,
    base64URL: ""
  };

  getBase64 = file => {
    return new Promise(resolve => {
      let fileInfo;
      let baseURL = "";
      // Make new FileReader
      let reader = new FileReader();
      // Convert the file to base64 text
      reader.readAsDataURL(file);
      // on reader load somthing...
      reader.onload = () => {
        // Make a fileInfo Object
        console.log("Called", reader);
        baseURL = reader.result;
        console.log(baseURL);
        resolve(baseURL);
      };
      console.log(fileInfo);
    });
  };

  handleFileInputChange = e => {
    let { file } = this.state

    if (e != null) {
      this.angle = 0;
      console.log(e.target.files[0]);
      file = e.target.files[0];
      this.setState({
        file: e.target.files[0]
      });
    }


    Resizer.imageFileResizer(
      file,
      1000,
      1000,
      "JPEG",
      100,
      this.angle,
      (uri) => {
        // console.log(uri)
        // this.maskImageOnCanvas([], uri);
        this.checkImageStatus(uri);
      },
      "base64"
    );


    // For get Base 64 of selected File 
    // this.getBase64(file)
    // .then(result => {
    //   file["base64"] = result;
    //   console.log("File Is", file);
    //   this.checkImageStatus(file);
    //   this.setState({
    //     base64URL: result,
    //     file
    //   });
    // })
    // .catch(err => {
    //   console.log(err);
    // });

  };
  // this.resizeFile = (file) =>
  //   new Promise((resolve) => {
  //     Resizer.imageFileResizer(
  //       file,
  //       300,
  //       300,
  //       "JPEG",
  //       100,
  //       0,
  //       (uri) => {
  //         resolve(uri);
  //       },
  //       "base64"
  //     );
  //   });

  //     this.getMaskingCoOrdinate = response => {
  // response["fullTextAnnotation"];

  //     };

  blockText = (block, result) => {
    var blockInfo = {
      "text": "",
      "word": []
    }
    var blockText = "";
    var wordData = [];
    block.paragraphs.forEach(paragraph => {
      paragraph.words.forEach(word => {
        var item = "";
        word.symbols.forEach(symbol => {
          item = item + symbol.text;
        })
        blockText = blockText + item;
        blockText = blockText + " ";
        if (result.includes(item)) {
          wordData.push(word);
        }
      });
    });
    blockInfo.text = blockText;
    blockInfo.word = wordData;
    return blockInfo;
  }

  getCorrectAngle = data => {
    var vertexList = data.boundingBox.vertices;
    const ORIENTATION_NORMAL = 0;
    const ORIENTATION_270_DEGREE = 270;
    const ORIENTATION_90_DEGREE = 90;
    const ORIENTATION_180_DEGREE = 180;

    var centerX = 0, centerY = 0;
    for (var i = 0; i < 4; i++) {
      centerX += vertexList[i].x;
      centerY += vertexList[i].y;
    }
    centerX /= 4;
    centerY /= 4;

    var x0 = vertexList[0].x;
    var y0 = vertexList[0].y;

    if (x0 < centerX) {
      if (y0 < centerY) {

        return ORIENTATION_NORMAL;
      } else {
        return ORIENTATION_270_DEGREE;
      }
    } else {
      if (y0 < centerY) {
        return ORIENTATION_90_DEGREE;
      } else {
        return ORIENTATION_180_DEGREE;
      }
    }
  }

  getMaskCordinate = blockInfo => {
    var maskArray = []
    let MaskBlock = class {
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
    };
    

    var word = blockInfo.word;
    if (word.length >= 1) {
      maskArray.push(new MaskBlock(word[0].boundingBox.vertices[0].x, word[0].boundingBox.vertices[0].y))
      maskArray.push(new MaskBlock(word[1].boundingBox.vertices[1].x, word[1].boundingBox.vertices[1].y))
      maskArray.push(new MaskBlock(word[1].boundingBox.vertices[2].x, word[1].boundingBox.vertices[2].y))
      maskArray.push(new MaskBlock(word[0].boundingBox.vertices[3].x, word[0].boundingBox.vertices[3].y))
    
    }
    return maskArray;
  }

  checkImageStatus = imageBase => {
    console.log(imageBase)
    vision.init({ auth: 'API_KEY' });
    const req = new vision.Request({
      image: new vision.Image({ base64: imageBase }),
      features: [
        new vision.Feature('TEXT_DETECTION', 4),
      ]
    });

    vision.annotate(req).then((res) => {
      // handling response
      var response = JSON.parse(JSON.stringify(res.responses));
      // console.log(response);
      var fullText = response[0].fullTextAnnotation.text;
      console.log(fullText)
      var result = fullText.match(/([0-9]{3,4}). ([0-9]{3,4}). ([0-9]{3,4})/g);
      console.log(result);
      if ((result == null || result == "")) {
        // remove Rotation Logic
        // if (this.angle < 360) {
        //   this.angle = this.angle + 90;
        //   this.handleFileInputChange(null)
        //   return;
        // } else {
        console.log("Invalid Image");
        alert("Invalid Aadhar Image Selected")
        return;
        // }
      } else {
        result = result[0];
      }


      console.log("Valid Aadhaar Number" + result);
      var maskCordinate = [];
      var blockForCheckAngle = [];
      response[0].fullTextAnnotation.pages.forEach(page => {
        page.blocks.forEach(block => {
          var blockInfo = this.blockText(block, result);
          if (blockInfo.text.includes(result)) {
            var maskInfo = this.getMaskCordinate(blockInfo)
            maskCordinate.push(maskInfo);
            blockForCheckAngle = block;
          }

        })
      });
      this.maskImageOnCanvas(maskCordinate, imageBase);
      console.log(maskCordinate)
      var angle = this.getCorrectAngle(blockForCheckAngle)
      if (angle != 0) {
        this.angle = 360 - angle
        this.handleFileInputChange(null);
      }

    }, (e) => {
      console.log('Error: ', e)
    });
  }

  rotateImage = angle => {
    var c = document.getElementById("maskCanvas");
    console.log(c.toDataURL());
    Resizer.imageFileResizer(
      this.convertBase64ToBlob(c.toDataURL()),
      1000,
      1000,
      'JPEG',
      100,
      angle,
      uri => {
        this.maskImageOnCanvas([], uri)
      },
      'base64'
    );


  }

  /**
 * Convert BASE64 to BLOB
 * @param base64Image Pass Base64 image data to convert into the BLOB
 */
  convertBase64ToBlob(base64Image) {
    // Split into two parts
    const parts = base64Image.split(';base64,');

    // Hold the content type
    const imageType = parts[0].split(':')[1];

    // Decode Base64 string
    const decodedData = window.atob(parts[1]);

    // Create UNIT8ARRAY of size same as row data length
    const uInt8Array = new Uint8Array(decodedData.length);

    // Insert all character code into uInt8Array
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }

    // Return BLOB image after conversion
    return new Blob([uInt8Array], { type: imageType });
  }

  maskImageOnCanvas = (maskCordinate, imageBase) => {
    var c = document.getElementById("maskCanvas");
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, 1000, 1000);
    ctx.beginPath()
    var image = new Image();
    image.onload = function () {
      ctx.drawImage(image, 0, 0);
      ctx.beginPath();
      maskCordinate.forEach(data => {
        ctx.moveTo(data[0].x, data[0].y)
        data.forEach(block => {
          ctx.lineTo(block.x, block.y)
        })
        ctx.fill();
        // ctx.rect(data.x, data.y, data.width - data.x, data.height - data.y);

      })

    };
    image.src = imageBase;

  }


  render() {
    return (
      <div>
        <input type="file" name="file" onChange={this.handleFileInputChange} />
        <canvas id="maskCanvas" width="1000" height="1000" />
      </div>
    );
  }
}

export default App;
