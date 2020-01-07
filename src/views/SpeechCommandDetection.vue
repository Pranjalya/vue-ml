<template>
  <div>
    <h2>{{ msg }}</h2>
    <div>
        <button @click="trainMode = true">Train Mode</button>
        <button @click="trainMode = false">Test Mode</button>
    </div>
    <div v-show="trainMode">
      <h3>Training Time</h3>
      <br />
      <div>
        <button id="left" @mousedown="collect(0)" @mouseup="collect(null)">Left</button>
        <button id="right" @mousedown="collect(1)" @mouseup="collect(null)">Right</button>
        <button id="noise" @mousedown="collect(2)" @mouseup="collect(null)">Noise</button>
      </div>
      <button id="train" @click="train">Train model</button>
    </div>
    <div v-show="!trainMode">
        <h3>Testing Time</h3>
    </div>
  </div>
</template>

<script>
import * as tf from "@tensorflow/tfjs";
import * as speechCommands from "@tensorflow-models/speech-commands";

export default {
  name: "speechcommand",

  data() {
    return {
      msg: "Speech Command Detection",
      recognizer: {},
      examples: []
    };
  },

  methods: {
    start() {
      this.recognizer = speechCommands.create("BROWSER_FFT");
      this.recognizer.ensureModelLoaded().then(() => {
        console.log("Model loaded");
        //  this.predictWords(recognizer);
      });
    },

    normalize(x) {
      const mean = -100;
      const std = 10;
      return x.map(x => (x - mean) / std);
    },

    train() {},

    collect(label) {
      console.log("collecting");
      const NUM_FRAMES = 3;
      if (this.recognizer.isListening()) {
        return this.recognizer.stopListening();
      }
      if (label == null) {
        console.log("up");
        return;
      }
      this.recognizer.listen(
        async ({ spectrogram: { frameSize, data } }) => {
          console.log("listening");
          let vals = this.normalize(data.subarray(-frameSize * NUM_FRAMES));
          this.examples.push({ vals, label });
          console.log(this.examples.length, "examples collected");
        },
        {
          overlapFactor: 0.999,
          includeSpectrogram: true,
          invokeCallbackOnNoiseAndUnknown: true
        }
      );
    },

    predictWords(recognizer) {
      var words = recognizer.wordLabels();
      console.log(words);
      recognizer.listen(
        ({ scores }) => {
          scores = Array.from(scores).map((s, i) => ({
            score: s,
            word: words[i]
          }));
          scores.sort((s1, s2) => s2.score - s1.score);
          console.log(scores[0]);
        },
        { probabilityThreshold: 0.8 }
      );
    }
  },

  computed: {},

  mounted() {
    this.start();
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
