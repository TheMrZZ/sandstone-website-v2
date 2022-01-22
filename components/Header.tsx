import * as React from 'react'

export const Header: React.FC<{
  headerComponents: React.ReactElement[]
}> = ({ headerComponents }) => {
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
        <a
          href='/'
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

        <a href='/introduction'>Documentation</a>
      </div>
    </header>
  )
}
