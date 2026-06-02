// Example API client function
export async function fetchWorkouts(token: string) {
  const response = await fetch('/api/workouts', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch workouts');
  }
  
  return response.json();
}

export async function createWorkout(token: string, workout: any) {
  const response = await fetch('/api/workouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workout)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create workout');
  }
  
  return response.json();
}
