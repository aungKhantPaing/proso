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
    return e.censorWords ? Array.from(e.censorWords) : [];
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
    <!-- Header Section -->
    <div class="text-white p-6 rounded-b-2xl shadow-lg">
      <div class="flex items-center justify-center mb-4">
        <a
          href="https://wxt.dev"
          target="_blank"
          class="hover:scale-110 transition-transform duration-200"
        >
          <img
            src="/wxt.svg"
            class="h-12 w-12 filter brightness-0 invert"
            alt="WXT logo"
          />
        </a>
      </div>
      <Title msg="PROSO" />
      <p class="text-center text-gray-200 text-sm mt-2">
        Content Censorship Extension
      </p>
    </div>

    <!-- Main Content -->
    <UContainer class="p-6 space-y-6" :ui="{ base: 'max-w-2xl mx-auto' }">
      <!-- Add Word Section -->
      <UCard>
        <template #header>
          <div class="flex items-center">
            <UIcon
              name="i-heroicons-plus-circle"
              class="w-5 h-5 mr-2 text-blue-600"
            />
            <h3 class="text-lg font-semibold">Add Censor Word</h3>
          </div>
        </template>

        <form @submit.prevent="addWord" class="flex gap-3">
          <UInput
            v-model="newWord"
            placeholder="Enter word to censor..."
            required
            class="flex-1"
            size="lg"
          />
          <UButton
            type="submit"
            color="primary"
            size="lg"
            icon="i-heroicons-plus"
          >
            Add
          </UButton>
        </form>

        <div class="h-3"></div>

        <div v-if="censorWords.length === 0" class="text-center py-8">
          <UIcon
            name="i-heroicons-document-text"
            class="w-12 h-12 text-gray-400 mx-auto mb-4"
          />
          <p class="text-gray-600 text-sm">
            No words added yet. Add your first censor word above.
          </p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(word, i) in censorWords"
            :key="word"
            class="flex items-center justify-between p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200 hover:text-gray-900"
          >
            <div class="flex items-center">
              <UBadge
                :label="`${i + 1}`"
                color="primary"
                variant="soft"
                class="mr-3"
              />
              <span class="font-medium">{{ word }}</span>
            </div>
            <UButton
              @click="removeWord(word)"
              color="error"
              variant="ghost"
              icon="i-heroicons-trash"
              size="sm"
              :ui="{ base: 'p-2' }"
              title="Remove word"
            />
          </div>
        </div>
      </UCard>

      <!-- Reload Notice -->
      <UCard v-if="showReloadButton" class="bg-green-50 border-green-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <UIcon
              name="i-heroicons-information-circle"
              class="w-5 h-5 mr-3 text-green-600"
            />
            <p class="text-green-800 font-medium">
              Changes detected! Reload to apply.
            </p>
          </div>
          <UButton
            @click="reloadPage"
            color="success"
            icon="i-heroicons-arrow-path"
            size="sm"
          >
            Reload
          </UButton>
        </div>
      </UCard>

      <!-- Footer -->
      <div class="text-center text-gray-500 text-xs pt-4">
        <p>PROSO - Making the web safer, one word at a time</p>
      </div>
    </UContainer>
  </UApp>
</template>
