<script>
  let {stats} = $props();
</script>

{#if stats && stats.headers && stats.values}
  <div class="bg-white border-gray-900 shadow-xl p-4">
    <table class="table-auto w-full p-1">
      <thead>
        <tr>
          <th></th>
          {#each stats.headers as header}
            <th>{header}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each Object.entries(stats.values) as [page, values]}
          <tr class="text-center hover:bg-slate-100">
            <td class="text-left">{page}</td>
            {#each values as v}
              <td>{v}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}