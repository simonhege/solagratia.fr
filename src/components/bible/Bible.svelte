
<div class="p-4 min-h-[calc(100vh-128px)] prose xl:prose-lg mx-auto">
  {#if message}
  <h2>{message}</h2>
  {:else}
  <h2>{content.Book?.Name}, chapitre {content.Chapter}</h2>
  <p class="text-sm">
    {#if content.Chapter > 1}
      <a href={"#/" + content.Book?.Code + "/" + (content.Chapter-1)}>{content.Book?.Name} {content.Chapter -1}</a>
    {/if}
    {#if content.Chapter < content.Book?.Chapters}
      <a href={"#/" + content.Book?.Code + "/" + (content.Chapter+1)}>{content.Book?.Name} {content.Chapter +1}</a>
    {/if}
  </p>
  <p>
    {#each content.Verses as verse, num }
    <sup class="text-sm">{num+1}</sup><span>{verse} &nbsp;</span> 
    {/each}
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
      getChapter(window.location.hash);
    }
  });

  
  type ContentType = {
    Book?: {
      Code: string,
      Name: string,
      Chapters: number,
    },
    Chapter?: number,
    Verses?: string[],
  }

  let content : ContentType = $state({});

  async function getChapter(fragment: string) {
    message = "Chargement en cours ...";
    console.log(fragment, lastHash);
    lastHash = fragment;
    if (fragment.length < 6 || fragment.at(0) !== '#' || fragment.at(1) !== '/' || fragment.at(5) !== '/') {
      message = "Impossible de trouver le chapitre demandé: fragment invalide."
      console.log(fragment.length, fragment.at(0), fragment.at(1), fragment.at(5))
      return;
    }
    await window.fetch("https://api.solagratia.fr/bible/" + fragment.substring(2))
      .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((resp: ContentType) => {
          content = resp;
          message = "";
        })
        .catch((error) => {
          message = "Impossible de trouver le chapitre demandé."
          console.log(fragment, error);
        });
  }

  getChapter(window.location.hash);

</script>