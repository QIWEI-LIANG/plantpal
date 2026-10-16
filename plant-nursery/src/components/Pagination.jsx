export default function Pagination({ data, page, onChange, t }) {
  if (!data || (!data.next && !data.previous)) return null
  return (
    <div className="pagination">
      <button
        className="button secondary"
        disabled={!data.previous}
        onClick={() => onChange(page - 1)}
      >
        {t('上一页', 'Previous')}
      </button>
      <span>
        {t('第', 'Page')} {page} · {data.count} {t('条', 'items')}
      </span>
      <button
        className="button secondary"
        disabled={!data.next}
        onClick={() => onChange(page + 1)}
      >
        {t('下一页', 'Next')}
      </button>
    </div>
  )
}
