<div class="w-full flex-grow flex flex-col gap-4">
  <div class="bg-white border-gray-900 shadow-xl p-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
      </svg>        
      <label for="period" >Période: </label>
      <select bind:value={inputPeriod}>
        <option value="day">Jour</option>
        <option value="month">Mois</option>
      </select>
    </div>
    <h2 class="font-bold text-[#111827] text-2xl xl:text-2xl">Statistics</h2>
    <div class="flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
      </svg>        
      <label for="api-key" >Clé: </label>
      <input type="password" name="api-key" bind:value={inputApiKey} class="focus:outline-none focus:ring focus:ring-indigo-200 focus:border-indigo-500" />
    </div>
  </div>
  <Table stats={pageViewedStats}></Table>
  <div class="bg-white border-gray-900 shadow-xl p-4 flex items-center justify-between">
    <h2 class="font-bold text-[#111827] text-2xl xl:text-2xl">History</h2>
  </div>
  <div class="bg-white border-gray-900 shadow-xl p-4">
    <table class="table-auto w-full p-1">
      <thead>
        <tr>
          <th>Date</th>
          <th>Durée</th>
          <th>Question</th>
          <th>Versets</th>
        </tr>
      </thead>
      <tbody>
        {#each historyItems as item}
          <tr>
            <td>{new Date(item.dateTime).toISOString()}</td>
            <td>{(item.duration / 1000000000).toFixed(2)}s</td>
            <td>{item.question}</td>
            <td>
              {#each item.verses as verse}
                <span class="rounded bg-gray-200 shadow-md m-1"
                  title={verse.text}
                  >
                  {refString(verse.reference)}
                </span>
              {/each}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<script lang="ts">
  import Table from "./Table.svelte";

  type Stats = {
    headers?: String[],
    values?: Map<String, number[]>
  }
  type VerseReference = {
    bookCode: string,
    bookName: string,
    chapter: number,
    verseStart: number,
    verseEnd: number,
  }
  type Verse = {
    text: string,
    reference: VerseReference
  }
  type HistoryItem = {
    dateTime: string,
    duration: number,
    question: string,
    verses: Verse[],
  }
  type HistoryResponse = {
    items: HistoryItem[]
  }

  let inputPeriod = $state("day")
  let inputApiKey = $state("")
  let pageViewedStats : Stats = $state({})
  let historyItems: HistoryItem[] = $state([])

  $effect(() => {
    if (inputApiKey.length > 0) {
      getPageViewedStats(inputPeriod, inputApiKey);
      getExplorerHistory(inputApiKey);
    }
  });

  async function getPageViewedStats(period: string, apiKey: string) {
    const raw = await window.fetch("https://api.solagratia.fr/admin/pageViewed/stats?period="+period, {
      headers: {
        'X-Api-Key': apiKey,
      }
    });
    if (raw.ok) {
      const jsonData: Stats = await raw.json();
      pageViewedStats = jsonData;
    } else {
      console.error(`HTTP error! Status: ${raw.status}`)
    }
  }
  async function getExplorerHistory(apiKey: string) {
    const raw = await window.fetch("https://api.solagratia.fr/admin/explorer/history", {
      headers: {
        'X-Api-Key': apiKey,
      }
    });
    if (raw.ok) {
      const jsonData: HistoryResponse = await raw.json();
      historyItems = jsonData.items;
    } else {
      console.error(`HTTP error! Status: ${raw.status}`)
    }
    
  }
  function refString(ref: VerseReference) :string {
    return ref.bookName + ' ' + ref.chapter + '.' + ref.verseStart + (ref.verseEnd !== ref.verseStart ? '-' + ref.verseEnd : '');
  }
</script>