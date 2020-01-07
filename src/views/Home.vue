<template>
  <div class="home">
    <h1>Welcome to TensorVue</h1>
    <img alt="Vue logo" src="../assets/logo.png">
    <h2> <router-link to="/objectdetection">Detect Objects</router-link> </h2>
    <h2> <router-link to="/sentimentanalysis">Text Sentiment Analysis</router-link> </h2>
    <h2> <router-link to="/emotiondetection">Real-time Emotion Analysis</router-link> </h2>
    <h2> <router-link to="/speechcommand">Speech Command Analysis</router-link> </h2>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>
 
<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'home',
  components: {
    HelloWorld
  },
}
</script>

<style lang="scss" scoped>

</style>
