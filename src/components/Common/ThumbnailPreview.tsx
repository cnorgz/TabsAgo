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

import { ThumbnailService } from '../../services/ThumbnailService'

interface ThumbnailPreviewProps {
  tabId: string
  title: string
  isHovering: boolean
  mouseX: number
  mouseY: number
}

export const ThumbnailPreview: React.FC<ThumbnailPreviewProps> = ({
  tabId,
  title,
  isHovering,
  mouseX,
  mouseY
}) => {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Load thumbnail when hovering starts
  useEffect(() => {
    if (isHovering) {
      setLoading(true)
      ThumbnailService.getThumbnail(tabId)
        .then(url => {
          setThumbnail(url)
          setLoading(false)
        })
        .catch(() => {
          setThumbnail(null)
          setLoading(false)
        })
    } else {
      // Reset state when not hovering
      setThumbnail(null)
      setLoading(false)
    }
  }, [isHovering, tabId])

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
            Thumbnails are captured when you use<br/>&quot;Capture All Thumbnails&quot; feature
          </div>
        </div>
      )}
    </div>
  )
}

