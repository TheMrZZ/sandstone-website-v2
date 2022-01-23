import Link from 'next/link'
import * as React from 'react'
import { FaBars } from 'react-icons/fa'

const mediaQuery = '(min-width: 1300px) and (min-height: 300px)'

export const Header: React.FC<{
  setIsBurgerMenuOpen: (cb: (isOpen: boolean) => boolean) => void
}> = ({ setIsBurgerMenuOpen }) => {
  const [hasMenuIcon, setHasMenuIcon] = React.useState(
    typeof window !== 'undefined' && !window.matchMedia(mediaQuery).matches
  )

  React.useEffect(() => {
    window.matchMedia(mediaQuery).addEventListener('change', (e) => {
      setHasMenuIcon(!e.matches)
    })
  }, [setHasMenuIcon])

  return (
    <header className='notion-header'>
      <div
        className='nav-header'
        style={{
          maxWidth: '100%',
          justifyContent: 'flex-start',
          fontSize: '16px'
        }}
      >
        {hasMenuIcon && (
          <FaBars
            onClick={() => setIsBurgerMenuOpen((isOpen) => !isOpen)}
            id='hamburger-menu-icon'
            style={{
              width: '20px',
              height: '20px',
              marginRight: '20px',
              cursor: 'pointer'
            }}
          />
        )}
        <Link href='/'>
          <a
            style={{
              display: 'flex',
              flexFlow: 'row nowrap',
              alignItems: 'center',
              fontWeight: 'bold',
              paddingRight: '20px'
            }}
          >
            <img
              style={{
                width: '50px',
                paddingRight: '10px'
              }}
              src='/logo.png'
            ></img>
            Sandstone
          </a>
        </Link>

        <Link href='/introduction'>
          <a>Documentation</a>
        </Link>
      </div>
    </header>
  )
}
