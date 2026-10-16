import { useState } from 'react'
import PageHeading from '../components/PageHeading'
import SearchField from '../components/SearchField'
import AsyncState from '../components/AsyncState'
import Pagination from '../components/Pagination'
import Icon from '../components/Icon'
import useApiResource from '../hooks/useApiResource'
import useMutation from '../hooks/useMutation'
import { api } from '../services/api'
import { formatTime } from '../data/formatters'

export default function ForumPage({ t, language }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [message, setMessage] = useState('')
  const resource = useApiResource(
    '/posts/?search=' +
      encodeURIComponent(query.trim()) +
      '&ordering=' +
      sort +
      '&page=' +
      page,
  )
  const mutation = useMutation()
  async function publish(event) {
    event.preventDefault()
    const result = await mutation.run(() =>
      api('/posts/', {
        method: 'POST',
        body: { title: title.trim(), body: body.trim() },
      }),
    )
    if (result.ok) {
      setTitle('')
      setBody('')
      setPage(1)
      resource.reload()
      setMessage(t('帖子已发布。', 'Post published.'))
    }
  }
  async function like(post) {
    const result = await mutation.run(() =>
      api('/posts/' + post.id + '/like/', {
        method: post.liked ? 'DELETE' : 'PUT',
      }),
    )
    if (result.ok) resource.reload()
  }
  async function remove(id) {
    const result = await mutation.run(() =>
      api('/posts/' + id + '/', { method: 'DELETE' }),
    )
    if (result.ok) {
      setDeleteId(null)
      setPage(1)
      resource.reload()
      setMessage(t('帖子已删除。', 'Post deleted.'))
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="THE GREEN CONVERSATION"
        title={t('养护论坛', 'The plant community')}
        description={t(
          '分享真实的养护日记与小发现。',
          'Share your care notes and small discoveries.',
        )}
      />
      <section className="panel">
        <h2>{t('分享一条养护日记', 'Share a care note')}</h2>
        <form className="stack-form" onSubmit={publish}>
          <label>
            {t('标题', 'Title')}
            <input
              required
              maxLength="160"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label>
            {t('正文', 'Body')}
            <textarea
              rows="3"
              required
              maxLength="5000"
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </label>
          <button
            className="button primary"
            disabled={mutation.pending || !title.trim() || !body.trim()}
          >
            {mutation.pending
              ? t('正在提交…', 'Submitting…')
              : t('发布帖子', 'Publish post')}
          </button>
        </form>
      </section>
      <div className="toolbar">
        <SearchField
          value={query}
          onChange={(value) => {
            setQuery(value)
            setPage(1)
          }}
          placeholder={t('搜索帖子或用户名…', 'Search posts or usernames…')}
        />
        <label className="sort-label">
          {t('排序', 'Sort by')}
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value)
              setPage(1)
            }}
          >
            <option value="newest">{t('最新发布', 'Newest first')}</option>
            <option value="popular">{t('最多点赞', 'Most liked')}</option>
          </select>
        </label>
      </div>
      <AsyncState error={mutation.error} t={t} language={language} />
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
      <AsyncState
        {...resource}
        onRetry={resource.reload}
        t={t}
        language={language}
      />
      {resource.data && (
        <>
          <div className="forum-list">
            {resource.data.results.map((post) => (
              <article className="panel post-card" key={post.id}>
                <div className="post-top">
                  <div className="post-author">
                    <span className="avatar sage">
                      {post.author.nickname.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <strong>
                        {post.author.nickname} (@{post.author.username})
                      </strong>
                      <time dateTime={post.created_at}>
                        {formatTime(post.created_at, language)}
                      </time>
                    </div>
                  </div>
                </div>
                <h2>{post.title}</h2>
                <p className="post-body">{post.body}</p>
                <div className="post-bottom">
                  <button
                    className={`like-button ${post.liked ? 'liked' : ''}`}
                    disabled={mutation.pending}
                    onClick={() => like(post)}
                    aria-pressed={post.liked}
                    aria-label={t('点赞：', 'Like: ') + post.title}
                  >
                    <Icon name="heart" size={18} />
                    {post.like_count}
                    <span>{t('喜欢', 'likes')}</span>
                  </button>
                  {post.can_delete && (
                    <button
                      className="text-button"
                      onClick={() => setDeleteId(post.id)}
                      disabled={mutation.pending}
                    >
                      {t('删除帖子', 'Delete post')}
                    </button>
                  )}
                </div>
                {deleteId === post.id && (
                  <div className="delete-panel">
                    <p>{t('确定删除自己的这条帖子？', 'Delete this post?')}</p>
                    <div className="row-actions">
                      <button
                        className="button danger"
                        disabled={mutation.pending}
                        onClick={() => remove(post.id)}
                      >
                        {t('确认删除', 'Confirm deletion')}
                      </button>
                      <button
                        className="button secondary"
                        onClick={() => setDeleteId(null)}
                      >
                        {t('取消', 'Cancel')}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
          {!resource.data.count && (
            <p className="empty-state">
              {t(
                '还没有匹配的帖子，可以发布第一条日记。',
                'No matching posts. Share the first care note.',
              )}
            </p>
          )}
          <Pagination
            data={resource.data}
            page={page}
            onChange={setPage}
            t={t}
          />
        </>
      )}
    </>
  )
}
