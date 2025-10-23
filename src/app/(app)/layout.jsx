import Header from '@/components/Header'
import Nav from '@/components/navigation/Nav'
import React from 'react'

export default function layout({ children }) {
  return (
    <>
      <Header />
      <Nav />
      {children}
    </>
  )
}
