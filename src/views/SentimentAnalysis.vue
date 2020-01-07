<template>
  <div class="sentimentanalysis">
    <h2>{{ msg }}</h2>
    <section ref="chatArea" class="chat-area">
      <p
        v-for="message in messages"
        class="message"
        v-bind:key="message.index"
        :class="{ 'message-out-positive': message.author === 'you' && message.sentiment === 'positive', 'message-out-negative': message.author === 'you' && message.sentiment === 'negative', 'message-out-neutral': message.author === 'you' && message.sentiment === 'neutral', 'message-in-positive': message.author !== 'you' && message.sentiment === 'positive', 'message-in-negative': message.author !== 'you' && message.sentiment === 'negative', 'message-in-neutral': message.author !== 'you' && message.sentiment === 'neutral' }"
      >{{ message.body }}
      <br/>
      <span>{{ message.score }}</span>
      </p>
    </section>

    <section class="chat-inputs">
      <form @submit.prevent="sendMessage('in')" id="person1-form">
        <label for="person1-input">Other</label>
        <input
          v-model="otherMessage"
          id="person1-input"
          type="text"
          placeholder="Type your message"
        />
        <button type="submit">Send</button>
      </form>
      <button @click="clearAllMessages">Clear All</button>
      <form @submit.prevent="sendMessage('out')" id="person2-form">
        <label for="person2-input">You</label>
        <input v-model="youMessage" id="person2-input" type="text" placeholder="Type your message" />
        <button type="submit">Send</button>
      </form>
    </section>
  </div>
</template>

<script>
// Load library for Sentiment Analysis
var Vader = require("vader-sentiment");
var PouchDB = require("pouchdb").default;

export default {
  name: "sentimentanalysis",

  components: {},

  data() {
    return {
      remoteDB: {},
      msg: "Sentiment Analysis of Text",
      otherMessage: "",
      youMessage: "",
      messages: []
    };
  },

  created() {
    this.remoteDB = new PouchDB(
      "https://4f241480-c3c9-41c6-bb2e-98fd4cfe269e-bluemix:2d0f75eae437887122aec87b1225ad19a294f459beeb0a20fd69fb333cee4d4a@4f241480-c3c9-41c6-bb2e-98fd4cfe269e-bluemix.cloudantnosqldb.appdomain.cloud/chatdb"
    );
  },

  methods: {
    sendMessage(direction) {
      if (!this.youMessage && !this.otherMessage) {
        return;
      }
      if (direction === "out") {
        var sentiment = "neutral";
        var score = Vader.SentimentIntensityAnalyzer.polarity_scores(this.youMessage).compound;
        if (score > 0.1) sentiment = "positive";
        else if (score < -0.1) sentiment = "negative";
        this.messages.push({
          body: this.youMessage,
          author: "you",
          sentiment: sentiment,
          score: score
        });
        this.youMessage = "";
      } else if (direction === "in") {
        var sentiment = "neutral";
        var score = Vader.SentimentIntensityAnalyzer.polarity_scores(this.otherMessage).compound;
        if (score > 0.1) sentiment = "positive";
        else if (score < -0.1) sentiment = "negative";
        console.log(score, sentiment);
        this.messages.push({
          body: this.otherMessage,
          author: "Other",
          sentiment: sentiment,
          score: score
        });
        this.otherMessage = "";
      } else {
        console.log("something went wrong");
      }
      console.log(
        Vader.SentimentIntensityAnalyzer.polarity_scores(
          this.messages[this.messages.length - 1].body
        )
      );
      this.$nextTick(() => {
        let messageDisplay = this.$refs.chatArea;
        messageDisplay.scrollTop = messageDisplay.scrollHeight;
      });
    },
    clearAllMessages() {
      this.messages = [];
    }
  },

  computed: {},

  mounted() {
    console.log(Vader);
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
video {
  background-color: rgb(27, 14, 14);
  border-radius: 7px;
  border: #42b983;
  margin-top: 7px;
  margin-right: 5px;
  margin-left: 5px;
  width: 345px;
  height: 500px;
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
.headline {
  text-align: center;
  font-weight: 100;
  color: white;
}
.chat-area {
  /*   border: 1px solid #ccc; */
  background: white;
  height: 75vh;
  padding: 1em;
  overflow: auto;
  max-width: 500px;
  margin: 0 auto 2em auto;
  box-shadow: 2px 2px 5px 2px rgba(0, 0, 0, 0.3);
}
.message {
  width: 45%;
  border-radius: 10px;
  padding: 0.5em;
  /*   margin-bottom: .5em; */
  font-size: 0.8em;
}
.message-out-positive {
  background: #27b60b;
  color: white;
  margin-left: 50%;
}
.message-out-negative {
  background: #e74614;
  color: white;
  margin-left: 50%;
}
.message-out-neutral {
  background: #407fff;
  color: white;
  margin-left: 50%;
}
.message-in-positive {
  background: #27b60b;
  color: white;
}
.message-in-negative {
  background: #e74614;
  color: white;
}
.message-in-neutral {
  background: #f1f0f0;
  color: black;
}
.chat-inputs {
  display: flex;
  justify-content: space-between;
}
#person1-input {
  padding: 0.5em;
}
#person2-input {
  padding: 0.5em;
}
label {
  padding: 0.8em;
}
</style>
