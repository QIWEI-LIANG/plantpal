// 本地 SVG 插画，不依赖图片服务；仅表现植物形态，不能用于识别。
export default function PlantArt({ type = 'split', className = '' }) {
  const isSword = type === 'sword'
  const isVine = type === 'vine'
  return (
    <svg
      className={`plant-art ${className}`}
      viewBox="0 0 240 250"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="121" cy="229" rx="65" ry="9" fill="#2e5133" opacity=".1" />
      {isSword ? (
        <g>
          <path
            d="M111 187C83 137 76 72 83 24c25 44 34 95 37 162"
            fill="#57754a"
            stroke="#adc07d"
            strokeWidth="5"
          />
          <path
            d="M125 187c-5-67 4-128 25-168 6 69-3 114-16 170"
            fill="#355c40"
            stroke="#b1bc77"
            strokeWidth="5"
          />
          <path
            d="M135 189c0-46 19-76 39-96-1 52-15 79-30 102"
            fill="#73935c"
            stroke="#bdc887"
            strokeWidth="4"
          />
          <path
            d="M103 187C83 163 68 121 62 95c29 23 43 54 47 94"
            fill="#708958"
            stroke="#b4c68c"
            strokeWidth="4"
          />
          <path
            d="m86 55 14 14m-9 6 14 13m-7 6 13 12m32-58-15 17m13 6-16 14m13 10-15 13"
            stroke="#abc38c"
            strokeWidth="3"
          />
        </g>
      ) : (
        <g>
          <path
            d="M120 192c2-59 1-104-5-143M120 154 72 105M119 123l49-38M118 99 79 59M123 174l52-31"
            stroke="#6f7950"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {[
            { x: 69, y: 95, angle: -48, scale: 0.9 },
            { x: 154, y: 83, angle: 43, scale: 1 },
            { x: 83, y: 55, angle: -38, scale: 0.85 },
            { x: 128, y: 40, angle: 25, scale: 0.72 },
            { x: 162, y: 140, angle: 48, scale: 0.83 },
            { x: 87, y: 140, angle: -63, scale: 0.74 },
          ].map((leaf, index) => (
            <g
              key={index}
              transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(${leaf.scale})`}
            >
              <path
                d={
                  type === 'oval'
                    ? 'M0 30C-50 10-39-43 0-55 37-39 48 8 0 30Z'
                    : 'M0 30C-13 23-35 16-39-4-43-25-26-40-7-36-2-45 8-51 21-43 55-23 38 11 0 30Z'
                }
                fill={
                  [
                    '#426b48',
                    '#5b8052',
                    '#78975e',
                    '#325d43',
                    '#628555',
                    '#90a472',
                  ][index]
                }
              />
              <path
                d="M0 27 3-33M1 9-23-9M2-5 24-21"
                stroke="#c2d19e"
                strokeWidth="1.3"
                opacity=".6"
              />
              {type === 'split' && (
                <path
                  d="m-36-4 16 12m-11-27 14 11m29-28-7 15m25-1L17 1m18 7-19 6"
                  stroke="#e6ede2"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              )}
            </g>
          ))}
          {isVine && (
            <g>
              <path
                d="M101 174C60 155 44 189 73 208s13 35-12 35"
                stroke="#6d8552"
                strokeWidth="3"
              />
              <path
                d="M65 196c-30 8-39-9-30-25 26-4 35 9 30 25M76 218c25-19 34-5 32 9-17 13-29 7-32-9"
                fill="#76935c"
              />
            </g>
          )}
          {type === 'flower' && (
            <g>
              <path d="M121 177 142 53" stroke="#788c58" strokeWidth="3" />
              <path
                d="M142 61c-34-10-20-41 4-52 21 24 21 44-4 52"
                fill="#fffdf1"
              />
              <path
                d="m141 53 5-28"
                stroke="#d3bc71"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </g>
          )}
          {type === 'branch' && (
            <g fill="#65814d">
              <ellipse cx="115" cy="52" rx="8" ry="18" />
              <ellipse
                cx="98"
                cy="91"
                rx="11"
                ry="20"
                transform="rotate(-30 98 91)"
              />
              <ellipse
                cx="140"
                cy="119"
                rx="11"
                ry="22"
                transform="rotate(35 140 119)"
              />
            </g>
          )}
        </g>
      )}
      <path
        d="M84 175h76l-8 48c-18 10-38 10-59 0Z"
        fill={type === 'oval' ? '#bd8970' : isSword ? '#ccc5ac' : '#d6bd9d'}
      />
      <path d="M84 175h19l5 53-15-5Z" fill="#9f886d" opacity=".18" />
      <ellipse cx="122" cy="176" rx="39" ry="8" fill="#dccaad" />
      <ellipse cx="122" cy="175" rx="32" ry="5" fill="#706647" />
      <path d="M119 176v-18" stroke="#6f7950" strokeWidth="4" />
      <path d="M91 190h64M93 197h60" stroke="#fff" opacity=".2" />
    </svg>
  )
}
