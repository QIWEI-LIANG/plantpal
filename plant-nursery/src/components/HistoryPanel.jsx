import { useState } from 'react'
import useApiResource from '../hooks/useApiResource'
import AsyncState from './AsyncState'
import CareHistory from './CareHistory'
import Pagination from './Pagination'

export default function HistoryPanel({ plantId, scope = 'all', t, language }) {
  const [page, setPage] = useState(1)
  const history = useApiResource(
    '/care-logs/?scope=' +
      scope +
      '&page=' +
      page +
      (plantId ? '&plant=' + plantId : ''),
    { poll: 15000 },
  )
  return (
    <section className="history-panel">
      <h3>
        {plantId
          ? t('养护历史', 'Care history')
          : t('集中养护历史', 'All care history')}
      </h3>
      <AsyncState
        {...history}
        onRetry={history.reload}
        t={t}
        language={language}
      />
      {history.data && (
        <>
          <CareHistory
            entries={history.data.results}
            t={t}
            language={language}
            showPlant={!plantId}
          />
          <Pagination
            data={history.data}
            page={page}
            onChange={setPage}
            t={t}
          />
        </>
      )}
    </section>
  )
}
