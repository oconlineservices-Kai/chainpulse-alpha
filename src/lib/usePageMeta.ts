'use client'

import { useEffect } from 'react'

interface PageMeta {
  title: string
  description: string
  ogTitle?: string
  ogDescription?: string
  ogUrl?: string
  canonical?: string
  keywords?: string
}

/**
 * Injects page-level metadata into <head> for client-side pages
 * Works alongside layout.tsx global metadata for SSR crawlability
 */
export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    // Update document title
    document.title = meta.title

    // Update or create meta description
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`)
      if (el) {
        el.setAttribute('content', content)
      } else {
        el = document.createElement('meta')
        el.setAttribute('name', name)
        el.setAttribute('content', content)
        document.head.appendChild(el)
      }
    }

    const setOgMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`)
      if (el) {
        el.setAttribute('content', content)
      } else {
        el = document.createElement('meta')
        el.setAttribute('property', property)
        el.setAttribute('content', content)
        document.head.appendChild(el)
      }
    }

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`)
      if (el) {
        el.setAttribute('href', href)
      } else {
        el = document.createElement('link')
        el.setAttribute('rel', rel)
        el.setAttribute('href', href)
        document.head.appendChild(el)
      }
    }

    setMeta('description', meta.description)
    setOgMeta('og:title', meta.ogTitle || meta.title)
    setOgMeta('og:description', meta.ogDescription || meta.description)
    if (meta.ogUrl) setOgMeta('og:url', meta.ogUrl)
    if (meta.canonical) setLink('canonical', meta.canonical)
    if (meta.keywords) setMeta('keywords', meta.keywords)

    // Also update Twitter card meta
    const setTwitterMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`)
      if (el) {
        el.setAttribute('content', content)
      } else {
        el = document.createElement('meta')
        el.setAttribute('name', name)
        el.setAttribute('content', content)
        document.head.appendChild(el)
      }
    }
    setTwitterMeta('twitter:title', meta.ogTitle || meta.title)
    setTwitterMeta('twitter:description', meta.ogDescription || meta.description)
  }, [meta.title, meta.description, meta.ogTitle, meta.ogDescription, meta.ogUrl, meta.canonical, meta.keywords])
}
