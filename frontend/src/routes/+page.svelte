// Home page placeholder
<script>
  import Card from '$components/Card.svelte';
  import Button from '$components/Button.svelte';
</script>

<svelte:head>
  <title>Workout Planner - Dashboard</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold mb-8">Workout Planner Dashboard</h1>
  
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <Card title="Recent Workouts">
      <p class="text-gray-600">No workouts logged yet</p>
      <Button variant="primary" class="mt-4">Log Workout</Button>
    </Card>
    
    <Card title="Upcoming Plans">
      <p class="text-gray-600">No plans scheduled</p>
      <Button variant="primary" class="mt-4">Create Plan</Button>
    </Card>
    
    <Card title="Equipment">
      <p class="text-gray-600">No equipment added</p>
      <Button variant="primary" class="mt-4">Add Equipment</Button>
    </Card>
  </div>
</div>

<style>
  :global(body) {
    @apply bg-gray-50;
  }
</style>
