// Reusable Card component
<script>
  export let title = '';
</script>

<div class="bg-white rounded-lg shadow-md p-6">
  {#if title}
    <h2 class="text-xl font-bold mb-4">{title}</h2>
  {/if}
  <slot />
</div>
