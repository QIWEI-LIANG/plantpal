const paths = {
  leaf: 'M20 4C10 2 3 6 4 13c1 7 9 8 13 3 3-4 3-8 3-12ZM5 19 16 8',
  home: 'm3 10 9-7 9 7M5 9v12h5v-7h4v7h5V9',
  plant:
    'M12 15V6M12 10C5 10 4 6 4 3c6 0 8 3 8 7Zm0 4c7 0 8-4 8-7-6 0-8 3-8 7ZM6 16h12l-2 6H8Z',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  book: 'M12 5c-4-3-8-2-10-1v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-3-1-6-2-10 1Zm0 0v15',
  scan: 'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5M8 12l3 3 5-6',
  friends:
    'M16 21v-3c0-3-3-5-6-5s-6 2-6 5v3M10 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 3a4 4 0 0 1 0 7M20 21v-3c0-2-1-4-3-5',
  forum: 'M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4ZM8 10h8M8 14h5',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1Z',
  search: 'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 6 6',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  plus: 'M12 4v16M4 12h16',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2M12 20v2M2 12h2M20 12h2M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
  drop: 'M12 2C9 7 4 10 4 15a8 8 0 0 0 16 0c0-5-5-8-8-13ZM8 15c0 2 1 3 3 4',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v6l4 2',
  check: 'm5 12 4 4L19 6',
  heart: 'M12 21 3 12C-2 5 7-1 12 6c5-7 14-1 9 6Z',
  mail: 'M3 5h18v14H3Zm0 0 9 8 9-8',
  upload: 'M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6',
  location:
    'M12 22s8-8 8-14A8 8 0 0 0 4 8c0 6 8 14 8 14Zm0-17a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  shield: 'M12 2 3 6v6c0 6 9 10 9 10s9-4 9-10V6Zm-5 10 3 3 7-7',
}
export default function Icon({ name = 'leaf', size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.leaf} />
    </svg>
  )
}
