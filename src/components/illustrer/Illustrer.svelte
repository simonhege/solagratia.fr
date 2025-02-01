
<div class="p-4 min-h-[calc(100vh-128px)] prose xl:prose-lg mx-auto">
  {#if message}
  <h2>{message}</h2>
  {:else if !content.response}
  <h2>Illustrer {refString(content.excerpt.reference)}</h2>
  <blockquote>
    {content.excerpt.text}
  </blockquote>
  <p>
    <a href={"/partager#/" + hash(content.excerpt.reference)}>Partager</a>
  </p>
  {:else}
  <h2>Illustrer {refString(content.response.verses.reference)}</h2>
  <blockquote>
    {content.response.verses.text}
  </blockquote>
  <p>
    <a href={"/partager#/" + hash(content.response.verses.reference)}>Partager</a>
  </p>
  {#if showAdmin}
  <div class="flex items-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
    </svg>        
    <label for="api-key" >Clé: </label>
    <input type="password" name="api-key" bind:value={inputApiKey} class="focus:outline-none focus:ring focus:ring-indigo-200 focus:border-indigo-500" />

    <button  class="bg-white hover:bg-gray-100 text-gray-800 text-sm py-2 px-2 border border-gray-400 rounded shadow" onclick={() => refresh()}>
      Rafraîchir
    </button>

  </div>
  {/if}
  <h3>Mots clés</h3>
  <p>
    {#each content.response.keywords as keyword}
      <span class="bg-white px-2 py-1 rounded-lg m-1">{keyword}</span>
    {/each}
  </p>
  <h3>Propositions de prompt</h3>
  {#each content.response.prompts as prompt, idx}
    <textarea class="w-full" rows="3" readonly>{prompt}</textarea>
    {#if inputApiKey.length > 0}
      <img id={"img"+idx} alt={prompt} class="hidden" />      
    {/if}
    <p>
      <button  class="bg-white hover:bg-gray-100 text-gray-800 text-sm py-2 px-2 border border-gray-400 rounded shadow" onclick={() => writeClipboardText(prompt)}>Copier</button>
      <a class="bg-white hover:bg-gray-100 text-gray-800  text-sm py-2 px-2 border border-gray-400 rounded shadow no-underline" href={"https://chatgpt.com?prompt="+prompt} target="_blank">Ouvrir dans ChatGPT (Dall-E)</a>

      {#if inputApiKey.length > 0}
        <input id={"file"+idx} class="w-48 bg-white hover:bg-gray-100 text-gray-800 text-sm py-2 px-2 border border-gray-400 rounded shadow"  type="file" accept="image/*" onchange={(event) => fileSelected(event, idx)} />
        <button  id={"send"+idx} class="hidden bg-white hover:bg-gray-100 text-gray-800 text-sm py-2 px-2 border border-gray-400 rounded shadow" onclick={() => send(prompt, idx)}>Envoyer</button>
      {/if}
    </p>
  {/each}
  {/if}
  <p>
    <a href="https://designer.microsoft.com/image-creator?scenario=background-texttoimage" target="_blank">Ouvrir Microsoft Designer</a>
  </p>
  <div>
    <p class="text-sm text-gray-500 max-w-prose mx-auto text-center my-6">
      Texte biblique tiré de la <em>Bible Louis Segond (1910)</em>. Domaine public. 
    </p>
  </div>
</div>
<script lang="ts">
  let inputApiKey = $state("");
  let message = $state("Chargement en cours ...");
  const showAdmin = (localStorage.getItem('show-admin') === 'true') 
  let lastHash = '';
  window.addEventListener('hashchange', () => {
    if (window.location.hash !== lastHash) {
      illustrate(window.location.hash);
    }
  });


  function fileSelected(event: any, idx: number) {
    const selectedFile = event.target.files[0];
    console.log("file selected", selectedFile);

    let reader = new FileReader();
    reader.onload = function() {
      document.getElementById("img"+idx)?.classList.remove("hidden")
      document.getElementById("send"+idx)?.classList.remove("hidden")
      document.getElementById("img"+idx)?.setAttribute("src", reader.result as string);
    }
    reader.readAsDataURL(selectedFile);
  }

  async function send(text: string, idx: number) {
    const payload : UploadRequestType = {
      url: (document.getElementById("img"+idx) as HTMLImageElement).src,
      keywords: content.response.keywords,
      description: text,
    }
    const req = new Request("https://api.solagratia.fr/admin/backgrounds", {
      method: 'POST',
			headers: {
				"Content-Type": "application/json",
        'X-Api-Key': inputApiKey,
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
        .catch((error) => {
          message = "Impossible d'uploader l'image."
          console.log(error);
        });
  }

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
  type UploadRequestType = {
    url: string,
    keywords: string[],
    description: string,
  }
  type ContentType = {
    excerpt?: BibleExcerptType,
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

  async function refresh() {
    console.log("refresh",window.location.hash)
    await illustrate(window.location.hash, true)
  }

  async function illustrate(fragment: string, refresh: boolean = false) {
    if (!refresh) {
      message = "Chargement en cours ...";
      lastHash = fragment;
    }
    const refRegex= /#\/([1-9A-Z]{3})\/(\d+)\/(\d+)(-(\d+))?/;
    const match = fragment.match(refRegex);
    if (!match) {
      message = "Impossible de trouver le passage demandé: fragment invalide."
      console.log(fragment)
      return;
    }
    if (!refresh) {
      await window.fetch("https://api.solagratia.fr/bible/" + fragment.substring(2))
        .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((resp: BibleExcerptType) => {
            content.excerpt = resp;
            message = "";
          })
          .catch((error) => {
            message = "Impossible de trouver le passage demandé."
            console.log(fragment, error);
          });
    }

    const payload: IllustrateRequestType = {
      reference: {
        bookCode: match[1],
        chapter: parseInt(match[2]),
        verseStart: parseInt(match[3]),
        verseEnd: match[5] ? parseInt(match[5]) : parseInt(match[3]),
      },
    }
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

