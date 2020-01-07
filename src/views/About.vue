<template>
  <div class="about">
    <h1>Upload weights and shards</h1>
    <h2>
      Choose weights folder :
      <input type="file" v-on:change="load" />
    </h2>
    <button @click="upload">Upload</button>
  </div>
</template>

<script>
var PouchDB = require("pouchdb").default;

export default {
  data() {
    return {
      remoteDB: {},
      file: {}
    };
  },

  methods: {
    load(e) {
      var files = e.target.files || e.dataTransfer.files;
      console.log(files[0]);
      this.file = files[0];
    },
    upload() {
      this.remoteDB
        .get(this.file.name)
        .then(res => {
          console.log(res);
        })
        .catch(err => {
          console.log(err);
          if (err.status == 404) {
            console.log("Not found in remote, uploading...");
            this.remoteDB
              .put({
                _id: this.file.name,
                _attachments: {
                  filename: {
                    type: this.file.type,
                    data: this.file
                  }
                }
              })
              .then(res => {
                console.log("File uploaded succesfully", res);
              })
              .catch(err => {
                console.log("Upload Error", err);
              });
          }
        });
    }
  },

  created() {
    this.remoteDB = new PouchDB(
      "https://4f241480-c3c9-41c6-bb2e-98fd4cfe269e-bluemix:2d0f75eae437887122aec87b1225ad19a294f459beeb0a20fd69fb333cee4d4a@4f241480-c3c9-41c6-bb2e-98fd4cfe269e-bluemix.cloudantnosqldb.appdomain.cloud/models"
    );
  }
};
</script>

<style scoped>
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