
<div class="p-4 min-h-[calc(100vh-128px)] prose xl:prose-lg mx-auto">
  {#if message || !content.response}
  <h2>{message}</h2>
  {:else}
  <h2>Partager {refString(content.response.verses.reference)}</h2>
  <img src={content.response.images[content.selected].imageUrl} alt={content.response.images[content.selected].alt} />
  <textarea class="w-full" rows="3" readonly>{content.response.images[content.selected].tags.join(' ')}</textarea>
  <textarea class="w-full" rows="5" readonly>{content.response.images[content.selected].alt}</textarea>
  <div class="flex flex-wrap justify-center gap-1">
    <div class="flex-1">
      <button onclick={()=>(content.selected = (content.selected+1)%4)}>
        <img src={content.response.images[(content.selected+1)%4].imageUrl} alt={content.response.images[(content.selected+1)%4].alt} />
      </button>
    </div>
    <div class="flex-1">
      <button onclick={()=>(content.selected = (content.selected+2)%4)}>
        <img src={content.response.images[(content.selected+2)%4].imageUrl} alt={content.response.images[(content.selected+2)%4].alt} />
      </button>
    </div>
    <div class="flex-1">
      <button onclick={()=>(content.selected = (content.selected+3)%4)}>
        <img src={content.response.images[(content.selected+3)%4].imageUrl} alt={content.response.images[(content.selected+3)%4].alt} />
      </button>
    </div>
  </div>
  <p>
    <a href={"/illustrer#/" + hash(content.response.verses.reference)}>Obtenir des prompts additionels</a>
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

  type BibleRefType = {
    bookCode: string,
    bookName?: string,
    chapter: number,
    verseStart: number,
    verseEnd: number,
  }
  type ShareRequestType = {
    reference: BibleRefType,
    backgroundName?: string,
    count?: number,
  }
  type BibleExcerptType = {
    text: string,
    reference: BibleRefType,
  }
  type ShareImage = {
    imageUrl: string,
    alt: string,
    tags: string[],
  }
  type ShareResponseType = {
    verses: BibleExcerptType,
    images: ShareImage[],
  }
  type ContentType = {
    response?: ShareResponseType,
    selected: number
  };

  let content : ContentType = $state({
    selected: 0,
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
    const payload: ShareRequestType = {
      reference: {
        bookCode: match[1],
        chapter: parseInt(match[2]),
        verseStart: parseInt(match[3]),
        verseEnd: match[5] ? parseInt(match[5]) : parseInt(match[3]),
      },
      count: 4,
    }
    console.log(payload);
    const req = new Request("https://api.solagratia.fr/share", {
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
        .then((resp: ShareResponseType) => {
          content.response = resp;
          content.selected = 0;
          message = "";
        })
        .catch((error) => {
          message = "Impossible d'illustrer le passage demandé."
          console.log(fragment, error);
        });
  }

  illustrate(window.location.hash);

</script>
