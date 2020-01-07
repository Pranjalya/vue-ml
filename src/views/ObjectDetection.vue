<template>
  <div class="objectdetection">
    <h2>{{ msg }}</h2>
    <button v-on:click="changeFront()">Change Camera</button>
    <div>
      <video id="capture" autoplay muted playsinline></video>
    </div>
    <div v-for="predict in predictions" v-bind:key="predict.index">
      <h3>
        <span style="color: blue">{{ predict.class }}</span> Accuracy :
        <span style="color: green">{{ predict.score.toFixed(2) * 100 }} %</span>
      </h3>
      <br />
      <h2 v-if="loading">Loading AI for Object Detection...</h2>
    </div>
  </div>
</template>
 
<script>
// Load library for YOLO Object detection
import * as cocoSsd from "@tensorflow-models/coco-ssd";

// @ is an alias to /src

export default {
  name: "objectdetection",

  components: {},

  data() {
    return {
      capture: {},
      loading: true,
      model: {},
      msg: "Object Detection cocoSsd",
      predictions: [],
      front: false
    };
  },

  methods: {
    loadCamera() {
      navigator.mediaDevices
        .getUserMedia(this.getConstraints)
        .then(stream => (this.capture.srcObject = stream))
        .catch(err => {
          console.log("Camera error : ", err);
        });
    },

    c() {
      var hex = Math.floor(Math.random() * 256).toString(16);
      return ("0" + String(hex)).substr(-2); // pad with zero
    },

    get_random_color() {
      return "#" + this.c() + this.c() + this.c();
    },
    changeFront() {
      this.front = !this.front;
    },

    loadModel(argument) {
      return argument
        .load()
        .then(result => {
          this.loading = false;
          console.log("Model loaded", result);
          this.model = result;
        })
        .catch(err => {
          console.log(err);
        });
    },

    predict() {
      this.model.detect(this.capture).then(predictions => {
        var canvas = document.getElementById("canv");
        this.predictions = predictions;
      /*  if (canvas.getContext) {
          var ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          predictions.forEach(prediction => {
            console.log(prediction.class)
            ctx.lineWidth = 2;
            ctx.strokeStyle = this.get_random_color();
            ctx.strokeRect(
              prediction.bbox[0],
              prediction.bbox[1],
              prediction.bbox[2],
              prediction.bbox[3]
            );
          });
        }
        */
      });
    },

    onDeviceReady() {
      this.loadCamera();
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
    }
  },

  computed: {
    getConstraints() {
      return { video: { facingMode: this.getFront ? "user" : "environment" } };
    },
    getFront() {
      return this.front;
    }
  },

  mounted() {
    document.addEventListener("deviceready", this.onDeviceReady, false);
    this.capture = document.getElementById("capture");
    this.loadModel(cocoSsd).then(model => {
      setInterval(() => {
        this.predict();
      }, 50);
    });
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
#capture {
  background-color: rgb(27, 14, 14);
  border-radius: 7px;
  border: #42b983;
  margin-top: 7px;
  margin-right: 5px;
  margin-left: 5px;
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
  opacity: 0.30;
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
