export default defineContentScript({
  matches: ["*://*.google.com/*"],
  async main(ctx) {
    console.log("Hello content.");
    // Fetch censor words from storage
    let censorWords: string[] = [];
    try {
      censorWords = await browser.storage.local
        .get("censorWords")
        .then((e) => Array.from(e.censorWords));
      if (censorWords.length > 0) {
        console.log({ censorWords });
      }
    } catch (e) {
      console.warn("Failed to load censor words from storage", e);
    }

    // Benchmark start
    const start = performance.now();
    let replacementCount = 0;

    function replaceWordsInNode(node: Node, words: string[] = censorWords) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.nodeValue) {
          let text = node.nodeValue;
          for (const word of words) {
            // Replace whole words only, case-insensitive
            const regex = new RegExp(`\\b${word}\\b`, "gi");
            // Count matches before replacement
            const matches = text.match(regex);
            if (matches) {
              replacementCount += matches.length;
            }
            text = text.replace(regex, "*".repeat(word.length));
          }
          node.nodeValue = text;
        }
      } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.nodeName !== "SCRIPT" &&
        node.nodeName !== "STYLE"
      ) {
        for (const child of node.childNodes) {
          replaceWordsInNode(child, words);
        }
      }
    }

    function blurImagesInNode(node: Node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if ((node as Element).tagName === "IMG") {
          (node as HTMLImageElement).style.filter = "blur(8px)";
        }
        for (const child of node.childNodes) {
          blurImagesInNode(child);
        }
      }
    }

    // Initial run on the whole document
    replaceWordsInNode(document.body);
    // blurImagesInNode(document.body);

    // Benchmark end
    const end = performance.now();
    console.log(
      `Word replacement took ${
        end - start
      } ms, total replacements: ${replacementCount}`
    );

    // Observe DOM changes for dynamically added elements
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          replaceWordsInNode(node);
          // blurImagesInNode(node);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    browser.storage.local.onChanged.addListener((changes) => {
      console.log("Storage changed:", changes);
      if (changes.censorWords) {
        const newList = Array.from(changes.censorWords.newValue) as string[];
        console.log({ newList });
        replaceWordsInNode(document.body, newList);
      }
    });
  },
});
