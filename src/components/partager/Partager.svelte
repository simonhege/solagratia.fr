
<div class="p-4 min-h-[calc(100vh-128px)] prose xl:prose-lg mx-auto">
  {#if message || !content.response}
  <h2>{message}</h2>
  {:else}
  <h2>Partager {refString(content.response.verses.reference)}</h2>
  <img src={content.response.imageUrl} alt={content.response.alt} />
  <textarea class="w-full" rows="3" readonly>{content.response.tags.join(' ')}</textarea>
  <textarea class="w-full" rows="5" readonly>{content.response.alt}</textarea>
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
  }
  type BibleExcerptType = {
    text: string,
    reference: BibleRefType,
  }
  type ShareResponseType = {
    imageUrl: string,
    alt: string,
    tags: string[],
    verses: BibleExcerptType,
  }
  type ContentType = {
    response?: ShareResponseType,
  };

  let content : ContentType = $state({});

  function refString(ref: verseReference) :string {
    return ref.bookName + ' ' + ref.chapter + '.' + ref.verseStart + (ref.verseEnd !== ref.verseStart ? '-' + ref.verseEnd : '');
  }

  async function illustrate(fragment: string) {
    message = "Chargement en cours ...";
    console.log(fragment, lastHash);
    lastHash = fragment;
    const refRegex= /#\/([a-zA-Z]+)\/(\d+)\/(\d+)(-(\d+))?/;
    const match = fragment.match(refRegex);
    if (!match) {
      message = "Impossible de trouver le fragment demandé: fragment invalide."
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
          message = "";
        })
        .catch((error) => {
          message = "Impossible d'illustrer le passage demandé."
          console.log(fragment, error);
        });
  }

  illustrate(window.location.hash);

</script>
