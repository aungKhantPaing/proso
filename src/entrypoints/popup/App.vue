<script lang="ts" setup>
import { ref, onMounted } from "vue";
import Title from "@/components/Title.vue";
// Use WXT's storage API
const storage = browser.storage.local;

const newWord = ref("");
const censorWords = ref<string[]>([]);
const showReloadButton = ref(false);

// Load from storage on mount
onMounted(async () => {
  censorWords.value = await storage.get("censorWords").then((e) => {
    return Array.from(e.censorWords);
  });

  console.log({ censorWords: censorWords.value });
});

storage.onChanged.addListener((changes) => {
  if (changes.censorWords) {
    censorWords.value = Array.from(changes.censorWords.newValue);
  }
});

async function addWord() {
  if (!newWord.value.trim()) return;

  const newCensorWords = Array.from(
    new Set([...censorWords.value, newWord.value])
  );
  await storage.set({
    censorWords: newCensorWords,
  });
  newWord.value = "";
}

async function removeWord(word: string) {
  const newCensorWords = censorWords.value.filter((w) => w !== word);
  await storage.set({ censorWords: newCensorWords });
  showReloadButton.value = true;
}

function reloadPage() {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    if (tabs[0].id) {
      browser.tabs.reload(tabs[0].id);
    }
  });
  showReloadButton.value = false;
}
</script>

<template>
  <UApp>
    <div>
      <a href="https://wxt.dev" target="_blank">
        <img src="/wxt.svg" class="logo" alt="WXT logo" />
      </a>
    </div>

    <Title msg="PROSO" />

    <div>
      <h2>Censor Words</h2>
      <form @submit.prevent="addWord">
        <input v-model="newWord" placeholder="Word to censor" required />
        <button type="submit">Add</button>
      </form>

      <div v-if="showReloadButton" class="reload-notice">
        <p>Changes made! Reload the page to apply censorship.</p>
        <button @click="reloadPage" class="reload-btn">Reload Page</button>
      </div>

      <ul>
        <li v-for="(word, i) in censorWords" :key="word">
          <strong>{{ i + 1 }}. {{ word }}</strong>
          <button @click="removeWord(word)">Remove</button>
        </li>
      </ul>
    </div>
  </UApp>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #54bc4ae0);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
form {
  margin-bottom: 1em;
}
input {
  margin-right: 0.5em;
}
button {
  margin-left: 0.5em;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 0.5em;
}
.reload-notice {
  background-color: #f0f8ff;
  border: 1px solid #4caf50;
  border-radius: 4px;
  padding: 10px;
  margin: 10px 0;
  text-align: center;
}
.reload-notice p {
  margin: 0 0 10px 0;
  color: #2e7d32;
  font-weight: 500;
}
.reload-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}
.reload-btn:hover {
  background-color: #45a049;
}
</style>
