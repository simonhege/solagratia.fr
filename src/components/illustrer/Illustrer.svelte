
<div class="p-4 min-h-[calc(100vh-128px)] prose xl:prose-lg mx-auto">
  {#if message || !content.response}
  <h2>{message}</h2>
  {:else}
  <h2>Illustrer {refString(content.response.verses.reference)}</h2>
  <blockquote>
    {content.response.verses.text}
  </blockquote>
  <p>
    <a href={"/partager#/" + hash(content.response.verses.reference)}>Partager</a>
  </p>
  <h3>Mots clés</h3>
  <p>
    {#each content.response.keywords as keyword}
      <span class="bg-white px-2 py-1 rounded-lg m-1">{keyword}</span>
    {/each}
  </p>
  <h3>Propositions de prompt</h3>
  {#each content.response.prompts as prompt}
    <textarea class="w-full" rows="3" readonly>{prompt}</textarea>
    <p>
      <button  class="bg-white hover:bg-gray-100 text-gray-800 text-sm py-2 px-2 border border-gray-400 rounded shadow" onclick={() => writeClipboardText(prompt)}>Copier</button>
      <a class="bg-white hover:bg-gray-100 text-gray-800  text-sm py-2 px-2 border border-gray-400 rounded shadow no-underline" href={"https://chatgpt.com?prompt="+prompt} target="_blank">Ouvrir dans ChatGPT (Dall-E)</a>
    </p>
  {/each}
  <p>
    <a href="https://designer.microsoft.com/image-creator?scenario=background-texttoimage" target="_blank">Ouvrir Microsoft Designer</a>
  </p>
  <div>
    <p class="text-sm text-gray-500 max-w-prose mx-auto text-center my-6">
      Texte biblique tiré de la <em>Bible Louis Segond (1910)</em>. Domaine public. 
    </p>
  </div>
  {/if}
</div>
<script lang="ts">
  let message = $state("Chargement en cours ...");
  let lastHash = '';
  window.addEventListener('hashchange', () => {
    if (window.location.hash !== lastHash) {
      illustrate(window.location.hash);
    }
  });
  async function writeClipboardText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error: any) {
      console.error(error);
    }
  }

  type BibleRefType = {
    bookCode: string,
    bookName?: string,
    chapter: number,
    verseStart: number,
    verseEnd: number,
  }
  type IllustrateRequestType = {
    reference: BibleRefType,
  }
  type BibleExcerptType = {
    text: string,
    reference: BibleRefType,
  }
  type IllustrateResponseType = {
    verses: BibleExcerptType,
    keywords: string[],
    prompts: string[],
  }
  type ContentType = {
    response?: IllustrateResponseType,
  };

  let content : ContentType = $state({
  });

  function refString(ref: BibleRefType) :string {
    return ref.bookName + ' ' + ref.chapter + '.' + ref.verseStart + (ref.verseEnd !== ref.verseStart ? '-' + ref.verseEnd : '');
  }

  function hash(ref: BibleRefType) :string {
    return ref.bookCode + '/' + ref.chapter + '/' + ref.verseStart + (ref.verseEnd !== ref.verseStart ? '-' + ref.verseEnd : '');
  }

  async function illustrate(fragment: string) {
    message = "Chargement en cours ...";
    console.log(fragment, lastHash);
    lastHash = fragment;
    const refRegex= /#\/([1-9A-Z]{3})\/(\d+)\/(\d+)(-(\d+))?/;
    const match = fragment.match(refRegex);
    if (!match) {
      message = "Impossible de trouver le passage demandé: fragment invalide."
      console.log(fragment)
      return;
    }
    const payload: IllustrateRequestType = {
      reference: {
        bookCode: match[1],
        chapter: parseInt(match[2]),
        verseStart: parseInt(match[3]),
        verseEnd: match[5] ? parseInt(match[5]) : parseInt(match[3]),
      },
    }
    console.log(payload);
    const req = new Request("https://api.solagratia.fr/illustrate", {
      method: 'POST',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload)
		});
    await window.fetch(req)
      .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((resp: IllustrateResponseType) => {
          content.response = resp;
          message = "";
        })
        .catch((error) => {
          message = "Impossible d'illustrer le passage demandé."
          console.log(fragment, error);
        });
  }

  illustrate(window.location.hash);

</script>

