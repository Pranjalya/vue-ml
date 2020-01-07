<template>
  <div class="emotiondetection">
    <div id="links" style="z-index: -500; opacity: 0; position: absolute"></div>
    <h2>{{ msg }}</h2>
    <button v-on:click="changeFront()">Change Camera</button>
    <div id="wrapper">
      <video id="capture" autoplay muted playsinline></video>
    </div>
    <div v-if="prediction.emotionAcc != 0">
      <h5>
        <p style="color: blue">
          {{ prediction.emotion }}
          <span
            style="color: green"
          >{{ prediction.emotionAcc.toFixed(4) * 100 }} %</span>
        </p>
        <p style="color: brown">Age : {{ parseInt(prediction.age) }}</p>
        <p style="color: grey">Gender : {{ prediction.gender }}</p>
      </h5>
    </div>
    <div v-else>
      <h3 style="color: brown">Loading AI ...</h3>
    </div>
    <br />
  </div>
</template>
 
<script>
import * as faceapi from "face-api.js";
var PouchDB = require("pouchdb").default;
var weight_URL = "";

export default {
  name: "emotiondetection",

  components: {},

  data() {
    return {
      capture: {},
      models: {},
      msg: "Emotion Detection - My Version",
      prediction: {
        emotionAcc: 0
      },
      front: false,
      classes: 0,
      loaded: false,
      dimensions: []
    };
  },

  methods: {
    loadCamera() {
      console.log(this.front, this.getConstraints);
      navigator.mediaDevices
        .getUserMedia(this.getConstraints)
        .then(stream => {
          this.capture.srcObject = stream;
        })
        .catch(err => {
          console.log("Camera error : ", err);
        });
    },

    detectMobile() {
      if (
        navigator.userAgent.match(/Android/i) ||
        navigator.userAgent.match(/webOS/i) ||
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/iPod/i) ||
        navigator.userAgent.match(/BlackBerry/i) ||
        navigator.userAgent.match(/Windows Phone/i)
      ) {
        return true;
      } else return false;
    },

    changeFront() {
      this.front = !this.front;
      navigator.mediaDevices
        .getUserMedia(this.getConstraints)
        .then(stream => {
          stream.getTracks().forEach(track => {
            track.stop();
          });
        })
        .then(() => {
          this.loadCamera();
        })
        .catch(err => {
          console.log("Camera error : ", err);
        });
    },

    downloadModel(filename, data, mimeType) {
      var blob = new Blob([data], {
        type: mimeType
      });
      if (window.cordova && cordova.platformId !== "browser") {
        document.addEventListener("deviceready", () => {
          var storageLocation = "";

          switch (device.platform) {
            case "Android":
              storageLocation = cordova.file.externalDataDirectory;
              break;

            case "iOS":
              storageLocation = cordova.file.documentsDirectory;
              break;
          }

          var folderPath = storageLocation;
          console.log("Folder path", folderPath);

          window.resolveLocalFileSystemURL(
            folderPath,
            dir => {
              dir.getFile(
                filename,
                { create: true },
                file => {
                  console.log("Downloaded", file);
                },
                err => {
                  console.log("Unable to download", err);
                }
              );
            },
            err => {
              console.log("Unable to download", err);
            }
          );
        });
      } else {
        saveAs(blob, filename);
      }
    },

    onDeviceReady() {
      this.loadCamera();
      console.log(
        "HHHHHHHHHHHHHHHHHHHHHHH",
        window.cordova.file.applicationDirectory
      );
      cordova.plugins.permissions.checkPermission(
        cordova.plugins.permissions.CAMERA,
        status => {
          if (status.checkPermission) {
            console.log("Yes :D ");
          } else {
            cordova.plugins.permissions.requestPermission(
              cordova.plugins.permissions.CAMERA,
              status => {
                if (!status.checkPermission) console.log("Error");
              },
              () => {
                console.log("error");
              }
            );
          }
        }
      );
    },

    detect() {
      const displaySize = {
        width: parseInt(this.capture.style.width),
        height: parseInt(this.capture.style.height)
      };

      try {
        setInterval(async () => {
          faceapi
            .detectSingleFace(this.capture)
            .withFaceLandmarks()
            .withFaceExpressions()
            .withAgeAndGender()
            .withFaceDescriptor()
            .then(result => {
              this.prediction = result;
              var obj = result.expressions;
              var emotion = Object.keys(obj).reduce((a, b) =>
                obj[a] > obj[b] ? a : b
              );
              this.prediction.emotion = emotion;
              this.prediction.emotionAcc = obj[emotion];
              console.log(this.prediction);
            });
        }, 300);
      } catch (e) {
        console.log(e);
      }
    },

    downloadModelsFromRemote() {
      this.models
        .allDocs({
          include_docs: true,
          attachments: true
        })
        .then(results => {
          console.log("Found result");
          results.rows.forEach(result => {
            console.log(result);
            this.downloadModel(
              result.doc._id,
              result.doc._attachments.filename.data,
              result.doc._attachments.filename.content_type
            );
          });
          this.loadFaceDetectModels();
        })
        .catch(err => {
          console.log("Models fetching error", err);
        });
    },

    loadModels() {
      document.addEventListener("deviceready", () => {
        let weightPath = "filesystem:" + cordova.file.externalDataDirectory;
        console.log("loaded");
        this.detect(weightPath);
      });
    },

    async loadFaceDetectModels() {
      let MODEL_URL;
      console.log("platform", window.device.platform);
      if (window.device.platform === "Android") {
        MODEL_URL = cordova.file.documentsDirectory;
        faceapi.env.monkeyPatch({
          readFile: filePath =>
            new Promise(resolve => {
              window.resolveLocalFileSystemURL(
                filePath,
                fileEntry => {
                  fileEntry.file(
                    file => {
                      var reader = new FileReader();
                      let fileExtension = filePath
                        .split("?")[0]
                        .split(".")
                        .pop();
                      if (fileExtension === "json") {
                        reader.onloadend = () => {
                          resolve(this.result);
                        };
                        reader.readAsText(file);
                      } else {
                        reader.onloadend = () => {
                          resolve(new Uint8Array(this.result));
                        };
                        reader.readAsArrayBuffer(file);
                      }
                    },
                    () => {
                      resolve(false);
                    }
                  );
                },
                () => {
                  resolve(false);
                }
              );
            })
        });
        await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_URL);
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_URL);
        await faceapi.nets.tinyYolov2.loadFromDisk(MODEL_URL);
        await faceapi.nets.mtcnn.loadFromDisk(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromDisk(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromDisk(MODEL_URL);
        await faceapi.nets.ageGenderNet.loadFromDisk(MODEL_URL);
        this.detect();
      }
    }
  },
  computed: {
    getConstraints() {
      return { video: { facingMode: !this.getFront ? "user" : "environment" } };
    },
    getFront() {
      return this.front;
    }
  },

  created() {
    this.models = new PouchDB(
      "https://4f241480-c3c9-41c6-bb2e-98fd4cfe269e-bluemix:2d0f75eae437887122aec87b1225ad19a294f459beeb0a20fd69fb333cee4d4a@4f241480-c3c9-41c6-bb2e-98fd4cfe269e-bluemix.cloudantnosqldb.appdomain.cloud/models"
    );
    console.log("in created");

    this.downloadModelsFromRemote();
  },

  mounted() {
    document.addEventListener("deviceready", this.onDeviceReady, false);
    this.capture = document.getElementById("capture");
    this.capture.addEventListener("loadedmetadata", e => {
      var dimensions = [this.capture.videoWidth, this.capture.videoHeight];
      this.capture.style.height = parseInt(dimensions[1] / 1.5) + "px";
      this.capture.style.width = parseInt(dimensions[0] / 1.5) + "px";
    });
    /*  if (!this.detectMobile()) {
      this.capture.style.height = "480px";
      this.capture.style.width = "640px";
    }
  */
    console.log("Faceapi models ", faceapi.nets);
    // resize the overlay canvas to the input dimensions
    // this.work();
  }
};
</script>

<style lang="scss" scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
#capture,
#overlay {
  position: relative;
  background-color: rgb(27, 14, 14);
  border-radius: 7px;
  border: #42b983;
  margin-top: 10px;
  width: 345px;
  height: 500px;
}

#canv {
  position: absolute;
  left: 1%;
  bottom: 2%;
  background-color: rgb(27, 14, 14);
  border-radius: 7px;
  border: #42b983;
  margin-top: 7px;
  margin-right: 5px;
  margin-left: 5px;
  width: 345px;
  height: 500px;
  opacity: 0.3;
}
button {
  text-decoration: none;
  color: white;
  padding: 10px 30px;
  display: inline-block;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.21);
  border-bottom: 4px solid rgba(0, 0, 0, 0.21);
  border-radius: 4px;
  margin-left: 10px;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.15);
  background: rgba(27, 188, 194, 1);
  background: -webkit-gradient(
    linear,
    0 0,
    0 100%,
    from(rgba(27, 188, 194, 1)),
    to(rgba(24, 163, 168, 1))
  );
  background: -webkit-linear-gradient(
    rgba(27, 188, 194, 1) 0%,
    rgba(24, 163, 168, 1) 100%
  );
  background: -moz-linear-gradient(
    rgba(27, 188, 194, 1) 0%,
    rgba(24, 163, 168, 1) 100%
  );
  background: -o-linear-gradient(
    rgba(27, 188, 194, 1) 0%,
    rgba(24, 163, 168, 1) 100%
  );
  background: linear-gradient(
    rgba(27, 188, 194, 1) 0%,
    rgba(24, 163, 168, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#1bbcc2', endColorstr='#18a3a8', GradientType=0);
}
.button span {
  cursor: pointer;
  display: inline-block;
  position: relative;
  transition: 0.5s;
}
.button span:after {
  content: "\00bb";
  position: absolute;
  opacity: 0;
  top: 0;
  right: -20px;
  transition: 0.5s;
}
.button:hover span {
  padding-right: 25px;
}
.button:hover span:after {
  opacity: 1;
  right: 0;
}
</style>
