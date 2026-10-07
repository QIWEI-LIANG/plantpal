import { useState } from 'react'
import PageHeading from '../components/PageHeading'
import SearchField from '../components/SearchField'
import Icon from '../components/Icon'
import { postData } from '../data/communityData'
import { localize, formatTime } from '../data/formatters'

export default function ForumPage({ t, language, state, onUpdate }) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const likeCount = (post) =>
    post.likes + (state.likedPostIds.includes(post.id) ? 1 : 0)
  const posts = postData
    .filter((post) =>
      `${post.title.zh} ${post.title.en} ${post.body.zh} ${post.body.en} ${post.author}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === 'popular'
        ? likeCount(b) - likeCount(a)
        : new Date(b.date) - new Date(a.date),
    )
  function toggleLike(id) {
    onUpdate((previous) => ({
      ...previous,
      likedPostIds: previous.likedPostIds.includes(id)
        ? previous.likedPostIds.filter((value) => value !== id)
        : [...previous.likedPostIds, id],
    }))
  }
  return (
    <>
      <PageHeading
        eyebrow="THE GREEN CONVERSATION"
        title={t('养护论坛', 'The plant community')}
        description={t(
          '一段养护日记，一个小发现。让经验在这里生长。',
          'A care journal, a small discovery. Let good ideas grow here.',
        )}
      />
      <div className="toolbar">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={t(
            '搜索帖子、植物或作者…',
            'Search posts, plants, or authors…',
          )}
        />
        <label className="sort-label">
          {t('排序', 'Sort by')}
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">{t('最新发布', 'Newest first')}</option>
            <option value="popular">{t('最多点赞', 'Most liked')}</option>
          </select>
        </label>
      </div>
      <p className="small-print">
        {t(
          '帖子为内置示例；点赞只保存在当前浏览器。',
          'Posts are built-in examples. Likes are saved only in this browser.',
        )}
      </p>
      <div className="forum-list">
        {posts.map((post) => (
          <article className="panel post-card" key={post.id}>
            <div className="post-top">
              <div className="post-author">
                <span className={`avatar ${post.color}`}>{post.initials}</span>
                <div>
                  <strong>{post.author}</strong>
                  <time dateTime={post.date}>
                    {formatTime(post.date, language)}
                  </time>
                </div>
              </div>
              <span className="tag">{localize(post.tag, language)}</span>
            </div>
            <h2>{localize(post.title, language)}</h2>
            <p>{localize(post.body, language)}</p>
            <div className="post-bottom">
              <button
                className={`like-button ${state.likedPostIds.includes(post.id) ? 'liked' : ''}`}
                onClick={() => toggleLike(post.id)}
                aria-pressed={state.likedPostIds.includes(post.id)}
                aria-label={t(
                  `点赞：${post.title.zh}`,
                  `Like: ${post.title.en}`,
                )}
              >
                <Icon name="heart" size={18} />
                {likeCount(post)}
                <span>{t('喜欢', 'likes')}</span>
              </button>
              <span className="muted">{t('示例帖子', 'Example post')}</span>
            </div>
          </article>
        ))}
      </div>
      {!posts.length && (
        <div className="empty-state">
          <h3>{t('还没有匹配的帖子', 'No matching posts')}</h3>
          <p>
            {t(
              '试试“龟背竹”“代管”或作者名字。',
              'Try “monstera”, “sitting”, or an author name.',
            )}
          </p>
        </div>
      )}
    </>
  )
}
