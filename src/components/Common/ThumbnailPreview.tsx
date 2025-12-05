/**
 * ThumbnailPreview Component - Clean rebuild
 * Displays thumbnail preview on hover with positioning
 * 
 * Features:
 * - Loads thumbnail on-demand when hovering
 * - Follows mouse position with offset
 * - Graceful fallback when no thumbnail available
 * - Non-interactive (pointer-events: none)
 */

import React, { useState, useEffect } from 'react'

interface ThumbnailPreviewProps {
  tabId: number
  title: string
  url: string
  isHovering: boolean
  mouseX: number
  mouseY: number
}

const isHttpUrl = (url: string) => /^https?:\/\//i.test(url)
const thumbnailCache = new Map<string, string>()

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  tabId,
  title,
  url,
  isHovering,
  mouseX,
  mouseY
}) => {
  const cacheKey = `${tabId}|${url}`
  const [thumbnail, setThumbnail] = useState<string | null>(thumbnailCache.get(cacheKey) ?? null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timeoutId: number | null = null

    const fetchThumbnail = () => {
      setLoading(true)
      chrome.runtime.sendMessage(
        {
          type: 'THUMBS_GET_LATEST',
          payload: { tabId, url },
        },
        (response) => {
          if (cancelled) return
          const ok = response && response.type === 'THUMBS_GET_LATEST_OK'
          const dataUrl = ok ? response.payload?.dataUrl : null
          if (chrome.runtime.lastError || !dataUrl) {
            setThumbnail(null)
          } else {
            thumbnailCache.set(cacheKey, dataUrl)
            setThumbnail(dataUrl)
          }
          setLoading(false)
        },
      )
    }

    if (isHovering && isHttpUrl(url)) {
      setLoading(false)
      const cached = thumbnailCache.get(cacheKey)
      if (cached) {
        setThumbnail(cached)
        return
      }
      timeoutId = window.setTimeout(fetchThumbnail, 200)
    } else {
      setThumbnail(null)
      setLoading(false)
    }

    return () => {
      cancelled = true
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [isHovering, tabId, url, cacheKey])

  // Don't render if not hovering
  if (!isHovering) return null

  return (
    <div
      className="thumbnail-preview"
      style={{
        position: 'fixed',
        left: `${mouseX + 20}px`,
        top: `${mouseY - 100}px`,
        zIndex: 9999,
        background: 'var(--panel)',
        border: '2px solid var(--border)',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        padding: '8px',
        maxWidth: '300px',
        pointerEvents: 'none'
      }}
    >
      {loading && (
        <div style={{
          width: '280px',
          height: '180px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--muted)',
          fontSize: '12px'
        }}>
          Loading preview...
        </div>
      )}
      
      {!loading && thumbnail && (
        <div>
          <img
            src={thumbnail}
            alt={title}
            style={{
              width: '280px',
              height: '180px',
              objectFit: 'cover',
              borderRadius: '4px'
            }}
          />
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {title}
          </div>
        </div>
      )}
      
      {!loading && !thumbnail && (
        <div style={{
          width: '280px',
          height: '180px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--muted)',
          fontSize: '12px',
          textAlign: 'center',
          padding: '20px',
          gap: '8px'
        }}>
          <div>📷 No preview available</div>
          <div style={{fontSize: '10px', opacity: 0.8}}>
            Thumbnails are captured automatically while you browse.
          </div>
        </div>
      )}
    </div>
  )
}
