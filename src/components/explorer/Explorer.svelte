
<div class="max-w-5xl mx-auto p-4" >
  <div class="mb-4 font-bold text-2xl lg:text-4xl text-gray-900">
    <h2>Que souhaitez-vous découvrir dans la Bible aujourd'hui?</h2>
  </div>
  <div class="w-full max-w-prose mx-auto mb-6">
    <form class="w-full flex gap-4 " onsubmit={handleQuestion}>
      <input type="text" class="rounded-md shadow-lg w-full" name="question"
        autocomplete="off" required minlength="5" maxlength="300"
        placeholder="Ici votre question"
      />
      <button type="submit" aria-label="Send">
          <svg 
            class:animate-spin={loading}
            class="h-8 w-8 text-stone-500 hover:text-black" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round">  
              <circle cx="12" cy="12" r="10" />  
              <polyline points="12 16 16 12 12 8" />  
              <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
      </button>
  </form>
  </div>
  <div class:hidden={!displayError}>
    <p class="max-w-prose mx-auto text-center mb-4">
      Au commencement était le bug...<br/>
      Parfois, même les serveurs ont besoin de repos. Revenez bientôt, et peut-être que tout sera remis en ordre. 
    </p>
  </div>
  <div class="min-h-[calc(100vh-400px)]">
    {#if message.length > 0}
    <p class="max-w-prose mx-auto text-center mb-4">
      {message}
    </p>
    {/if}
    {#each versets as verset}
        <figure class="mt-4 bg-white block shadow-lg border-gray-600 rounded p-3">
            <blockquote class="border-l-2 pl-2">{verset.text}</blockquote>
            <figcaption>
              <a class="hover:underline" href={"/bible#/"+verset.reference.bookCode+"/"+verset.reference.chapter}>{refString(verset.reference)}</a>
            </figcaption>
        </figure>
    {/each}
  </div>
  <div>
    <p class="text-sm text-gray-500 max-w-prose mx-auto text-center my-6">
      Textes bibliques issus de la <em>Bible Louis Segond (1910)</em>. Domaine public.  <br />
      L'intelligence artificielle est un outil puissant, mais elle peut se tromper. <br />
      Vérifiez toujours les informations fournies.
    </p>
  </div>
</div>

<script lang="ts">

  let message = $state("");
  let loading = $state(false);
  let displayError = $state(false);

  type versetReference = {
    bookCode: string,
    bookName: string,
    chapter: number,
    verseStart: number,
    verseEnd: number,
  }
  type verset = {
    text: string,
    ref: string,
    reference: versetReference
  }
  function refString(ref: versetReference) :string {
    return ref.bookName + ' ' + ref.chapter + '.' + ref.verseStart + (ref.verseEnd !== ref.verseStart ? '-' + ref.verseEnd : '');
  }

  let versets: verset[] = $state([])

  async function handleQuestion(e: SubmitEvent) {
    e.preventDefault();
    loading = true;
    displayError = false;
    message = "";
    versets = [];
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const payload = {
      "question": formData.get("question"),
    }
    const req = new Request("https://api.solagratia.fr/explorer", {
      method: 'POST',
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload)
		});
    await window
      .fetch(req)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((response) => {
        console.log(payload, response);
        versets = response;
        if (versets.length == 0) {
          message = "Je suis désolé, mais je ne peux pas répondre à cette question.";
        } else {
          message = "Voici quelques passages de la Bible pour vous :";
        }
      })
      .catch((error) => {
        displayError = true
        console.log(payload, error);
      })
      .finally(() => {
        loading = false;
      });

  }

</script>