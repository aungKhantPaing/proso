<script lang="ts" setup>
import { ref } from "vue";

defineProps({
  msg: String,
});
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold">{{ msg }}</h1>
    <p class="text-sm text-gray-500">Filter the distractions</p>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
