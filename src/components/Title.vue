<script lang="ts" setup>
import { ref } from "vue";

defineProps({
  msg: String,
});
</script>

<template>
  <h1 style="font-family: 'Brush Script MT', cursive; font-size: 3em">
    {{ msg }}
  </h1>
  <p style="font-size: 1.2em; color: #666; margin-top: -1em">
    Filter the distractions
  </p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
