// Reusable Button component
<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'danger' = 'primary';
  export let disabled = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };
</script>

<button
  class="px-4 py-2 rounded-lg font-medium transition-colors {variants[variant]}"
  class:opacity-50={disabled}
  class:cursor-not-allowed={disabled}
  {disabled}
  {type}
  on:click
>
  <slot />
</button>
