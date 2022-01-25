import Link from 'next/link'
import * as React from 'react'
import { FaBars } from 'react-icons/fa'

export const Header: React.FC<{
  setIsBurgerMenuOpen: (cb: (isOpen: boolean) => boolean) => void
}> = ({ setIsBurgerMenuOpen }) => {
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
              width={50}
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
