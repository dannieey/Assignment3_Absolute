export function Icon({ name, className = 'w-5 h-5', title }) {
  const common = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': title ? undefined : true,
    role: title ? 'img' : 'presentation',
  }

  switch (name) {
    case 'search':
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path d="M10.5 18a7.5 7.5 0 1 1 7.5-7.5A7.5 7.5 0 0 1 10.5 18Z" stroke="currentColor" strokeWidth="2" />
          <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M12 20s-7-4.5-9.2-9.1C1 7.9 2.7 5 5.9 5c1.8 0 3.1 1 4.1 2.1C11 6 12.3 5 14.1 5c3.2 0 4.9 2.9 3.1 5.9C19 15.5 12 20 12 20Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'cart':
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M6 6h15l-2 8H7L6 6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M6 6 5 3H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" fill="currentColor" />
        </svg>
      )
    case 'phone':
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path
            d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" />
          <path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'grid':
      return (
        <svg {...common}>
          {title ? <title>{title}</title> : null}
          <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" fill="currentColor" />
        </svg>
      )
    default:
      return null
  }
}

