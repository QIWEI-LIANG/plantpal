import useApiResource from './useApiResource'

export default function usePlantData(user, view) {
  const scope = view === 'caretaker' ? 'caretaking' : 'owned'
  const plants = useApiResource(user ? '/plants/?scope=' + scope : null, {
    all: true,
    poll: 15000,
  })
  const dashboard = useApiResource(user ? '/dashboard/?scope=' + scope : null, {
    poll: 15000,
  })
  const history = useApiResource(
    user ? '/care-logs/?page_size=3&scope=' + scope : null,
    { poll: 15000 },
  )
  return {
    scope,
    plants: plants.data || [],
    summary: dashboard.data,
    history: history.data?.results || [],
    loading: plants.loading || dashboard.loading || history.loading,
    error: plants.error || dashboard.error || history.error,
    refresh: () => {
      plants.reload()
      dashboard.reload()
      history.reload()
    },
  }
}
