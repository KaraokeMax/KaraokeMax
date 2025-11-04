<template>
  <router-view />
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
}

body {
  background: linear-gradient(180deg, #1f2b6a 0%, #4b3f72 100%);
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>