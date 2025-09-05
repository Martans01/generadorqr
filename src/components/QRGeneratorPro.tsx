'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import QRCode from 'qrcode'
import Image from 'next/image'
import { Download, X, Copy, Sparkles, Star, Zap, Palette, Image as ImageIcon, Settings, ChevronDown, ChevronRight, Eye } from 'lucide-react'

type QRStyle = 'squares' | 'dots' | 'rounded' | 'diamond' | 'hexagon'
type QRColorScheme = 'gradient' | 'ocean' | 'sunset' | 'forest' | 'purple' | 'neon' | 'rainbow' | 'monochrome' | 'pastel' | 'custom'
type QRPattern = 'solid' | 'lines' | 'dots-pattern' | 'waves' | 'geometric'
type QREffect = 'none' | 'shadow' | 'glow' | 'outline' | '3d'
type QRFrame = 'none' | 'simple' | 'rounded' | 'circle' | 'square' | 'modern' | 'gradient' | 'shadow'

interface QRTemplate {
  id: string
  name: string
  preview: string
  frame: QRFrame
  style: QRStyle
  colorScheme: QRColorScheme
  effect: QREffect
  frameText?: string
}

interface QRGeneratorProProps {
  className?: string
}

export default function QRGeneratorPro({ className = '' }: QRGeneratorProProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Core states
  const [url, setUrl] = useState('https://tu-sitio-web.com')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Advanced customization states
  const [qrStyle, setQrStyle] = useState<QRStyle>('rounded')
  const [colorScheme, setColorScheme] = useState<QRColorScheme>('gradient')
  const [pattern] = useState<QRPattern>('solid')
  const [effect, setEffect] = useState<QREffect>('none')
  const [frame, setFrame] = useState<QRFrame>('none')
  const [frameText, setFrameText] = useState('SCAN ME')
  const [size, setSize] = useState(400)
  const [margin, setMargin] = useState(20)
  const [rotation, setRotation] = useState(0)
  const [opacity, setOpacity] = useState(100)
  
  // Custom colors
  const [customColors, setCustomColors] = useState({ 
    primary: '#334155', 
    secondary: '#64748b',
    background: '#FFFFFF' 
  })
  
  // Logo states
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [logoSize, setLogoSize] = useState(18)
  const [logoStyle, setLogoStyle] = useState<'square' | 'circle' | 'rounded'>('rounded')

  // Accordion states
  const [accordionState, setAccordionState] = useState({
    content: true,
    templates: false,
    logo: false,
    styling: false,
    advanced: false
  })

  // Predefined frame templates (only frame, no QR changes)
  const templates: QRTemplate[] = [
    {
      id: 'none',
      name: 'Sin Marco',
      preview: '◌',
      frame: 'none',
      style: 'squares', // No usado
      colorScheme: 'monochrome', // No usado
      effect: 'none' // No usado
    },
    {
      id: 'simple',
      name: 'Marco Simple',
      preview: '⬜',
      frame: 'simple',
      style: 'squares',
      colorScheme: 'monochrome',
      effect: 'none',
      frameText: 'SCAN ME'
    },
    {
      id: 'rounded',
      name: 'Redondeado',
      preview: '▢',
      frame: 'rounded',
      style: 'squares',
      colorScheme: 'monochrome',
      effect: 'none',
      frameText: 'SCAN ME'
    },
    {
      id: 'circle',
      name: 'Octagonal',
      preview: '⬟',
      frame: 'circle',
      style: 'squares',
      colorScheme: 'monochrome',
      effect: 'none',
      frameText: 'SCAN ME'
    },
    {
      id: 'modern',
      name: 'Moderno',
      preview: '◆',
      frame: 'modern',
      style: 'squares',
      colorScheme: 'monochrome',
      effect: 'none',
      frameText: 'SCAN ME'
    },
    {
      id: 'shadow',
      name: 'Con Sombra',
      preview: '▣',
      frame: 'shadow',
      style: 'squares',
      colorScheme: 'monochrome',
      effect: 'none',
      frameText: 'SCAN ME'
    }
  ]

  const toggleAccordion = (section: keyof typeof accordionState) => {
    setAccordionState(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const applyTemplate = (template: QRTemplate) => {
    setFrame(template.frame)
    if (template.frameText) {
      setFrameText(template.frameText)
    }
    // No cambiar el QR en sí - solo el marco externo
  }

  const getColorScheme = (scheme: QRColorScheme) => {
    if (scheme === 'custom') {
      return customColors
    }
    switch (scheme) {
      case 'gradient':
        return { primary: '#334155', secondary: '#64748b', background: '#FFFFFF' }
      case 'ocean':
        return { primary: '#0369A1', secondary: '#0284C7', background: '#F0F9FF' }
      case 'sunset':
        return { primary: '#DC2626', secondary: '#F59E0B', background: '#FEF3C7' }
      case 'forest':
        return { primary: '#166534', secondary: '#16A34A', background: '#F0FDF4' }
      case 'purple':
        return { primary: '#7C2D92', secondary: '#A855F7', background: '#FAF5FF' }
      case 'neon':
        return { primary: '#FF00FF', secondary: '#00FFFF', background: '#000000' }
      case 'rainbow':
        return { primary: '#FF0080', secondary: '#8000FF', background: '#FFFFFF' }
      case 'monochrome':
        return { primary: '#000000', secondary: '#404040', background: '#FFFFFF' }
      case 'pastel':
        return { primary: '#F8BBD9', secondary: '#B4E7CE', background: '#FFF9FC' }
      default:
        return { primary: '#334155', secondary: '#64748b', background: '#FFFFFF' }
    }
  }

  const drawCustomQR = (ctx: CanvasRenderingContext2D, data: number[][], moduleSize: number) => {
    const colors = getColorScheme(colorScheme)
    
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        if (data[row][col]) {
          const x = col * moduleSize
          const y = row * moduleSize
          
          if (rotation !== 0) {
            ctx.save()
            ctx.translate(x + moduleSize/2, y + moduleSize/2)
            ctx.rotate((rotation * Math.PI) / 180)
            ctx.translate(-moduleSize/2, -moduleSize/2)
          }
          
          let fillStyle: string | CanvasGradient
          if (pattern === 'solid') {
            if (colorScheme === 'rainbow') {
              const gradient = ctx.createLinearGradient(x, y, x + moduleSize, y + moduleSize)
              const hue = ((row + col) * 137.5) % 360
              gradient.addColorStop(0, `hsl(${hue}, 70%, 60%)`)
              gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 60%)`)
              fillStyle = gradient
            } else {
              const gradient = ctx.createLinearGradient(x, y, x + moduleSize, y + moduleSize)
              gradient.addColorStop(0, colors.primary)
              gradient.addColorStop(1, colors.secondary)
              fillStyle = gradient
            }
          } else {
            fillStyle = colors.primary
          }
          
          ctx.fillStyle = fillStyle
          ctx.globalAlpha = opacity / 100
          
          if (effect === 'shadow') {
            ctx.shadowColor = colors.primary
            ctx.shadowBlur = 4
            ctx.shadowOffsetX = 2
            ctx.shadowOffsetY = 2
          } else if (effect === 'glow') {
            ctx.shadowColor = colors.secondary
            ctx.shadowBlur = 8
            ctx.shadowOffsetX = 0
            ctx.shadowOffsetY = 0
          }
          
          switch (qrStyle) {
            case 'dots':
              ctx.beginPath()
              ctx.arc(x + moduleSize/2, y + moduleSize/2, moduleSize/2.2, 0, 2 * Math.PI)
              ctx.fill()
              break
            case 'rounded':
              ctx.beginPath()
              const radius = Math.min(moduleSize * 0.3, 4)
              ctx.roundRect(x + 1, y + 1, moduleSize - 2, moduleSize - 2, radius)
              ctx.fill()
              break
            case 'diamond':
              ctx.save()
              ctx.translate(x + moduleSize/2, y + moduleSize/2)
              ctx.rotate(Math.PI / 4)
              ctx.fillRect(-moduleSize/2.5, -moduleSize/2.5, moduleSize/1.25, moduleSize/1.25)
              ctx.restore()
              break
            case 'hexagon':
              drawHexagon(ctx, x + moduleSize/2, y + moduleSize/2, moduleSize/2.5)
              break
            case 'squares':
            default:
              ctx.fillRect(x, y, moduleSize, moduleSize)
              break
          }
          
          ctx.shadowColor = 'transparent'
          ctx.shadowBlur = 0
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 0
          ctx.globalAlpha = 1
          
          if (rotation !== 0) {
            ctx.restore()
          }
        }
      }
    }
  }

  const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180
      const px = x + radius * Math.cos(angle)
      const py = y + radius * Math.sin(angle)
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fill()
  }

  const drawFrame = (ctx: CanvasRenderingContext2D, canvasSize: number, colors: {primary: string, secondary: string, background: string}, text: string) => {
    const center = canvasSize / 2
    const textPadding = 12
    const frameMargin = 15
    
    ctx.save()
    
    switch (frame) {
      case 'simple':
        // Elegant simple frame with clean typography
        ctx.strokeStyle = colors.primary
        ctx.lineWidth = 4
        ctx.strokeRect(frameMargin, frameMargin, canvasSize - frameMargin*2, canvasSize - frameMargin*2)
        
        // Corner accents
        const accentSize = 20
        ctx.lineWidth = 3
        // Top-left corner
        ctx.beginPath()
        ctx.moveTo(frameMargin, frameMargin + accentSize)
        ctx.lineTo(frameMargin, frameMargin)
        ctx.lineTo(frameMargin + accentSize, frameMargin)
        ctx.stroke()
        
        // Top-right corner
        ctx.beginPath()
        ctx.moveTo(canvasSize - frameMargin - accentSize, frameMargin)
        ctx.lineTo(canvasSize - frameMargin, frameMargin)
        ctx.lineTo(canvasSize - frameMargin, frameMargin + accentSize)
        ctx.stroke()
        
        // Bottom corners
        ctx.beginPath()
        ctx.moveTo(frameMargin, canvasSize - frameMargin - accentSize)
        ctx.lineTo(frameMargin, canvasSize - frameMargin)
        ctx.lineTo(frameMargin + accentSize, canvasSize - frameMargin)
        ctx.stroke()
        
        ctx.beginPath()
        ctx.moveTo(canvasSize - frameMargin - accentSize, canvasSize - frameMargin)
        ctx.lineTo(canvasSize - frameMargin, canvasSize - frameMargin)
        ctx.lineTo(canvasSize - frameMargin, canvasSize - frameMargin - accentSize)
        ctx.stroke()
        
        // Stylish bottom text
        ctx.font = 'bold 16px -apple-system, system-ui, sans-serif'
        ctx.textAlign = 'center'
        const textWidth = ctx.measureText(text).width
        const bgWidth = textWidth + textPadding * 2
        const textY = canvasSize - 30
        
        // Text background with subtle gradient
        const textGradient = ctx.createLinearGradient(center - bgWidth/2, textY - 15, center + bgWidth/2, textY + 5)
        textGradient.addColorStop(0, colors.primary)
        textGradient.addColorStop(1, colors.secondary)
        
        ctx.fillStyle = textGradient
        ctx.fillRect(center - bgWidth/2, textY - 15, bgWidth, 25)
        
        ctx.fillStyle = colors.background
        ctx.fillText(text, center, textY - 2)
        break
        
      case 'rounded':
        // Clean rounded frame
        const radius = 15
        
        ctx.strokeStyle = colors.primary
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.roundRect(frameMargin, frameMargin, canvasSize - frameMargin*2, canvasSize - frameMargin*2, radius)
        ctx.stroke()
        
        // Simple text with clean background
        ctx.font = 'bold 16px -apple-system, system-ui, sans-serif'
        ctx.textAlign = 'center'
        const rTextWidth = ctx.measureText(text).width
        const rBgWidth = rTextWidth + textPadding * 2
        const rTextY = canvasSize - 30
        
        ctx.fillStyle = colors.primary
        ctx.beginPath()
        ctx.roundRect(center - rBgWidth/2, rTextY - 12, rBgWidth, 20, 10)
        ctx.fill()
        
        ctx.fillStyle = colors.background
        ctx.fillText(text, center, rTextY - 3)
        break
        
      case 'circle':
        // Octagonal frame with cut corners
        const octMargin = 20
        const cutSize = 25
        
        ctx.strokeStyle = colors.primary
        ctx.lineWidth = 5
        ctx.beginPath()
        
        // Draw octagon by cutting corners
        ctx.moveTo(octMargin + cutSize, octMargin)
        ctx.lineTo(canvasSize - octMargin - cutSize, octMargin)
        ctx.lineTo(canvasSize - octMargin, octMargin + cutSize)
        ctx.lineTo(canvasSize - octMargin, canvasSize - octMargin - cutSize)
        ctx.lineTo(canvasSize - octMargin - cutSize, canvasSize - octMargin)
        ctx.lineTo(octMargin + cutSize, canvasSize - octMargin)
        ctx.lineTo(octMargin, canvasSize - octMargin - cutSize)
        ctx.lineTo(octMargin, octMargin + cutSize)
        ctx.closePath()
        ctx.stroke()
        
        // Corner accent dots
        ctx.fillStyle = colors.primary
        const dotRadius = 4
        // Top corners
        ctx.beginPath()
        ctx.arc(octMargin + cutSize/2, octMargin + cutSize/2, dotRadius, 0, 2 * Math.PI)
        ctx.fill()
        
        ctx.beginPath()
        ctx.arc(canvasSize - octMargin - cutSize/2, octMargin + cutSize/2, dotRadius, 0, 2 * Math.PI)
        ctx.fill()
        
        // Bottom corners
        ctx.beginPath()
        ctx.arc(octMargin + cutSize/2, canvasSize - octMargin - cutSize/2, dotRadius, 0, 2 * Math.PI)
        ctx.fill()
        
        ctx.beginPath()
        ctx.arc(canvasSize - octMargin - cutSize/2, canvasSize - octMargin - cutSize/2, dotRadius, 0, 2 * Math.PI)
        ctx.fill()
        
        // Simple text with clean background
        ctx.font = 'bold 16px -apple-system, system-ui, sans-serif'
        ctx.textAlign = 'center'
        const octTextWidth = ctx.measureText(text).width
        const octBgWidth = octTextWidth + textPadding * 2
        const octTextY = canvasSize - 30
        
        ctx.fillStyle = colors.primary
        ctx.fillRect(center - octBgWidth/2, octTextY - 12, octBgWidth, 20)
        
        ctx.fillStyle = colors.background
        ctx.fillText(text, center, octTextY - 3)
        break
        
      case 'modern':
        // Ultra-modern frame with geometric elements
        const modernMargin = 20
        
        // Main frame with animated-style gradient
        const modernGradient = ctx.createLinearGradient(0, 0, canvasSize, 0)
        modernGradient.addColorStop(0, colors.primary)
        modernGradient.addColorStop(0.3, colors.secondary)
        modernGradient.addColorStop(0.7, colors.primary)
        modernGradient.addColorStop(1, colors.secondary)
        
        ctx.strokeStyle = modernGradient
        ctx.lineWidth = 4
        ctx.setLineDash([15, 8, 5, 8])
        ctx.strokeRect(modernMargin, modernMargin, canvasSize - modernMargin*2, canvasSize - modernMargin*2)
        ctx.setLineDash([])
        
        // Corner triangular accents
        const triangleSize = 15
        ctx.fillStyle = modernGradient
        
        // Top-left triangle
        ctx.beginPath()
        ctx.moveTo(modernMargin, modernMargin)
        ctx.lineTo(modernMargin + triangleSize, modernMargin)
        ctx.lineTo(modernMargin, modernMargin + triangleSize)
        ctx.closePath()
        ctx.fill()
        
        // Top-right triangle
        ctx.beginPath()
        ctx.moveTo(canvasSize - modernMargin, modernMargin)
        ctx.lineTo(canvasSize - modernMargin - triangleSize, modernMargin)
        ctx.lineTo(canvasSize - modernMargin, modernMargin + triangleSize)
        ctx.closePath()
        ctx.fill()
        
        // Bottom triangles
        ctx.beginPath()
        ctx.moveTo(modernMargin, canvasSize - modernMargin)
        ctx.lineTo(modernMargin + triangleSize, canvasSize - modernMargin)
        ctx.lineTo(modernMargin, canvasSize - modernMargin - triangleSize)
        ctx.closePath()
        ctx.fill()
        
        ctx.beginPath()
        ctx.moveTo(canvasSize - modernMargin, canvasSize - modernMargin)
        ctx.lineTo(canvasSize - modernMargin - triangleSize, canvasSize - modernMargin)
        ctx.lineTo(canvasSize - modernMargin, canvasSize - modernMargin - triangleSize)
        ctx.closePath()
        ctx.fill()
        
        // Futuristic text styling
        ctx.font = 'bold 16px monospace'
        ctx.textAlign = 'center'
        const mTextWidth = ctx.measureText(text).width
        const mTextY = canvasSize - 25
        
        // Hexagonal text background
        const hexWidth = mTextWidth + textPadding * 2
        const hexHeight = 22
        ctx.fillStyle = modernGradient
        ctx.beginPath()
        ctx.moveTo(center - hexWidth/2 + 8, mTextY - hexHeight/2)
        ctx.lineTo(center + hexWidth/2 - 8, mTextY - hexHeight/2)
        ctx.lineTo(center + hexWidth/2, mTextY)
        ctx.lineTo(center + hexWidth/2 - 8, mTextY + hexHeight/2)
        ctx.lineTo(center - hexWidth/2 + 8, mTextY + hexHeight/2)
        ctx.lineTo(center - hexWidth/2, mTextY)
        ctx.closePath()
        ctx.fill()
        
        ctx.fillStyle = colors.background
        ctx.fillText(text, center, mTextY + 1)
        break
        
      case 'shadow':
        // Simple frame with shadow effect
        const shadowMargin = 20
        
        // Add shadow to frame
        ctx.shadowColor = 'rgba(0,0,0,0.2)'
        ctx.shadowBlur = 8
        ctx.shadowOffsetX = 3
        ctx.shadowOffsetY = 3
        
        ctx.strokeStyle = colors.primary
        ctx.lineWidth = 5
        ctx.beginPath()
        ctx.roundRect(shadowMargin, shadowMargin, canvasSize - shadowMargin*2, canvasSize - shadowMargin*2, 10)
        ctx.stroke()
        
        // Reset shadow
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
        
        // Simple text with clean background
        ctx.font = 'bold 16px -apple-system, system-ui, sans-serif'
        ctx.textAlign = 'center'
        const sTextWidth = ctx.measureText(text).width
        const sBgWidth = sTextWidth + textPadding * 2
        const sTextY = canvasSize - 30
        
        ctx.fillStyle = colors.primary
        ctx.beginPath()
        ctx.roundRect(center - sBgWidth/2, sTextY - 12, sBgWidth, 20, 8)
        ctx.fill()
        
        ctx.fillStyle = colors.background
        ctx.fillText(text, center, sTextY - 3)
        break
    }
    
    ctx.restore()
  }

  const generateQR = useCallback(async () => {
    if (!canvasRef.current || !url.trim()) return
    
    setIsGenerating(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    try {
      const qrData = QRCode.create(url, {
        errorCorrectionLevel: 'H'
      })
      
      const moduleCount = qrData.modules.size
      const moduleSize = Math.floor(size / (moduleCount + (margin / 10)))
      const qrSize = (moduleCount + (margin / 5)) * moduleSize
      const marginPixels = (margin / 10) * moduleSize
      
      // Add extra space for frames
      const frameSpace = frame !== 'none' ? 80 : 0
      const actualSize = qrSize + frameSpace
      
      canvas.width = actualSize
      canvas.height = actualSize
      
      ctx.imageSmoothingEnabled = false
      
      const colors = getColorScheme(colorScheme)
      ctx.fillStyle = colors.background
      ctx.fillRect(0, 0, actualSize, actualSize)
      
      const modules: number[][] = []
      for (let row = 0; row < moduleCount; row++) {
        modules[row] = []
        for (let col = 0; col < moduleCount; col++) {
          modules[row][col] = qrData.modules.get(row, col)
        }
      }
      
      ctx.save()
      // Center the QR in the canvas when there's a frame
      const qrOffset = frameSpace / 2
      ctx.translate(marginPixels + qrOffset, marginPixels + qrOffset)
      drawCustomQR(ctx, modules, moduleSize)
      ctx.restore()
      
      // Draw frame around QR if enabled
      if (frame !== 'none') {
        drawFrame(ctx, actualSize, colors, frameText)
      }
      
      if (logoPreview) {
        const logo = new window.Image()
        logo.onload = () => {
          const logoPixelSize = Math.floor((qrSize * logoSize) / 100)
          const bgSize = logoPixelSize + Math.floor(moduleSize * 1.5)
          const bgX = (actualSize - bgSize) / 2
          const bgY = (actualSize - bgSize) / 2
          const logoX = (actualSize - logoPixelSize) / 2
          const logoY = (actualSize - logoPixelSize) / 2
          
          ctx.fillStyle = colors.background
          ctx.beginPath()
          
          if (logoStyle === 'circle') {
            ctx.arc(actualSize/2, actualSize/2, bgSize/2, 0, 2 * Math.PI)
          } else if (logoStyle === 'rounded') {
            ctx.roundRect(bgX, bgY, bgSize, bgSize, Math.floor(moduleSize * 0.75))
          } else {
            ctx.rect(bgX, bgY, bgSize, bgSize)
          }
          
          ctx.fill()
          ctx.strokeStyle = colors.primary
          ctx.lineWidth = 2
          ctx.stroke()
          
          ctx.save()
          ctx.beginPath()
          if (logoStyle === 'circle') {
            ctx.arc(actualSize/2, actualSize/2, logoPixelSize/2, 0, 2 * Math.PI)
          } else if (logoStyle === 'rounded') {
            ctx.roundRect(logoX, logoY, logoPixelSize, logoPixelSize, Math.floor(moduleSize * 0.5))
          } else {
            ctx.rect(logoX, logoY, logoPixelSize, logoPixelSize)
          }
          ctx.clip()
          
          ctx.drawImage(logo, logoX, logoY, logoPixelSize, logoPixelSize)
          ctx.restore()
          
          setIsLoaded(true)
          setIsGenerating(false)
        }
        logo.onerror = () => {
          setIsLoaded(true)
          setIsGenerating(false)
        }
        logo.src = logoPreview
      } else {
        setIsLoaded(true)
        setIsGenerating(false)
      }
    } catch (error) {
      console.error('Error generating QR:', error)
      setIsGenerating(false)
    }
  }, [url, size, margin, qrStyle, colorScheme, pattern, effect, rotation, opacity, logoPreview, logoSize, logoStyle, frame, frameText, drawCustomQR, drawFrame, getColorScheme])

  const generateSVG = (): string => {
    try {
      const qrData = QRCode.create(url, {
        errorCorrectionLevel: 'H'
      })
      
      const moduleCount = qrData.modules.size
      const moduleSize = 10
      const marginPixels = (margin / 10) * moduleSize
      const totalSize = (moduleCount * moduleSize) + (marginPixels * 2)
      
      const colors = getColorScheme(colorScheme)
      
      let svgContent = `<svg width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg">`
      
      svgContent += `
        <defs>
          <linearGradient id="qrGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${colors.primary}" stop-opacity="${opacity/100}"/>
            <stop offset="100%" stop-color="${colors.secondary}" stop-opacity="${opacity/100}"/>
          </linearGradient>
          ${effect === 'shadow' ? `<filter id="shadow"><feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="${colors.primary}"/></filter>` : ''}
          ${effect === 'glow' ? `<filter id="glow"><feGaussianBlur stdDeviation="4"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : ''}
        </defs>`
      
      svgContent += `<rect width="${totalSize}" height="${totalSize}" fill="${colors.background}"/>`
      
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (qrData.modules.get(row, col)) {
            const x = marginPixels + (col * moduleSize)
            const y = marginPixels + (row * moduleSize)
            
            const filter = effect !== 'none' ? `filter="url(#${effect})"` : ''
            const transform = rotation !== 0 ? `transform="rotate(${rotation} ${x + moduleSize/2} ${y + moduleSize/2})"` : ''
            
            switch (qrStyle) {
              case 'dots':
                svgContent += `<circle cx="${x + moduleSize/2}" cy="${y + moduleSize/2}" r="${moduleSize/2.5}" fill="url(#qrGradient)" ${filter} ${transform}/>`
                break
              case 'rounded':
                svgContent += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${moduleSize - 1}" height="${moduleSize - 1}" rx="3" fill="url(#qrGradient)" ${filter} ${transform}/>`
                break
              case 'diamond':
                const centerX = x + moduleSize/2
                const centerY = y + moduleSize/2
                const size = moduleSize/1.25
                svgContent += `<polygon points="${centerX},${centerY-size/2} ${centerX+size/2},${centerY} ${centerX},${centerY+size/2} ${centerX-size/2},${centerY}" fill="url(#qrGradient)" ${filter} ${transform}/>`
                break
              case 'hexagon':
                const hex = generateHexagonPath(x + moduleSize/2, y + moduleSize/2, moduleSize/2.5)
                svgContent += `<path d="${hex}" fill="url(#qrGradient)" ${filter} ${transform}/>`
                break
              default:
                svgContent += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="url(#qrGradient)" ${filter} ${transform}/>`
                break
            }
          }
        }
      }
      
      if (logoPreview) {
        const logoPixelSize = Math.floor((totalSize * logoSize) / 100)
        const logoX = (totalSize - logoPixelSize) / 2
        const logoY = (totalSize - logoPixelSize) / 2
        const bgSize = logoPixelSize + 15
        const bgX = (totalSize - bgSize) / 2
        const bgY = (totalSize - bgSize) / 2
        
        if (logoStyle === 'circle') {
          svgContent += `<circle cx="${totalSize/2}" cy="${totalSize/2}" r="${bgSize/2}" fill="${colors.background}" stroke="${colors.primary}" stroke-width="2"/>`
          svgContent += `<clipPath id="logoClip"><circle cx="${totalSize/2}" cy="${totalSize/2}" r="${logoPixelSize/2}"/></clipPath>`
        } else if (logoStyle === 'rounded') {
          svgContent += `<rect x="${bgX}" y="${bgY}" width="${bgSize}" height="${bgSize}" rx="8" fill="${colors.background}" stroke="${colors.primary}" stroke-width="2"/>`
          svgContent += `<clipPath id="logoClip"><rect x="${logoX}" y="${logoY}" width="${logoPixelSize}" height="${logoPixelSize}" rx="4"/></clipPath>`
        } else {
          svgContent += `<rect x="${bgX}" y="${bgY}" width="${bgSize}" height="${bgSize}" fill="${colors.background}" stroke="${colors.primary}" stroke-width="2"/>`
          svgContent += `<clipPath id="logoClip"><rect x="${logoX}" y="${logoY}" width="${logoPixelSize}" height="${logoPixelSize}"/></clipPath>`
        }
        
        svgContent += `<image x="${logoX}" y="${logoY}" width="${logoPixelSize}" height="${logoPixelSize}" href="${logoPreview}" clip-path="url(#logoClip)"/>`
      }
      
      svgContent += '</svg>'
      return svgContent
    } catch (error) {
      console.error('Error generating SVG:', error)
      return ''
    }
  }

  const generateHexagonPath = (x: number, y: number, radius: number): string => {
    let path = 'M'
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 * Math.PI) / 180
      const px = x + radius * Math.cos(angle)
      const py = y + radius * Math.sin(angle)
      path += `${px},${py}${i < 5 ? 'L' : 'Z'}`
    }
    return path
  }

  const downloadSVG = () => {
    const svgContent = generateSVG()
    if (svgContent) {
      const blob = new Blob([svgContent], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'qr-code-professional.svg'
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const downloadPNG = async () => {
    if (!canvasRef.current) return
    
    // Re-generate the QR to ensure logo is included
    await generateQR()
    
    // Wait a bit for the canvas to update
    setTimeout(() => {
      if (!canvasRef.current) return
      const canvas = canvasRef.current
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = 'qr-code-professional.png'
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        }
      }, 'image/png')
    }, 100)
  }

  const downloadJPEG = async () => {
    if (!canvasRef.current) return
    
    // Re-generate the QR to ensure logo is included
    await generateQR()
    
    // Wait a bit for the canvas to update
    setTimeout(() => {
      if (!canvasRef.current) return
      const canvas = canvasRef.current
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.download = 'qr-code-professional.jpg'
          link.href = url
          link.click()
          URL.revokeObjectURL(url)
        }
      }, 'image/jpeg', 0.95)
    }, 100)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  useEffect(() => {
    if (url.trim()) {
      generateQR()
    }
  }, [generateQR])

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-6">
            <Sparkles className="w-8 h-8 text-slate-300" />
          </div>
          <h1 className="text-5xl font-bold mb-4 text-slate-100">
            QR Generator <span className="text-slate-300">Pro</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Crea códigos QR vectorizados con personalización avanzada
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full">
              <Star className="w-4 h-4 text-slate-300" />
              <span className="text-slate-200">Calidad Vectorial</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full">
              <Zap className="w-4 h-4 text-slate-300" />
              <span className="text-slate-200">Descarga Instantánea</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full">
              <Palette className="w-4 h-4 text-slate-300" />
              <span className="text-slate-200">Personalización Total</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <button
                  onClick={() => toggleAccordion('content')}
                  className="flex-1 flex items-center gap-2 text-left"
                >
                  <div className="w-8 h-8 bg-slate-700 text-white rounded-lg flex items-center justify-center text-sm font-semibold">1</div>
                  <h3 className="text-lg font-semibold text-slate-800">Tu Contenido</h3>
                </button>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-gray-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleAccordion('content')}
                    className="p-1"
                  >
                    {accordionState.content ? 
                      <ChevronDown className="w-5 h-5 text-slate-600" /> : 
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    }
                  </button>
                </div>
              </div>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                accordionState.content ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 pb-6 border-t border-gray-100">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://tu-sitio-web.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent mt-4"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <button
                onClick={() => toggleAccordion('templates')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold">2</div>
                  Marcos Decorativos
                </h3>
                {accordionState.templates ? 
                  <ChevronDown className="w-5 h-5 text-slate-600" /> : 
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                }
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                accordionState.templates ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => applyTemplate(template)}
                          className={`p-3 rounded-lg border-2 transition-all text-center hover:border-slate-400 ${
                            frame === template.frame
                              ? 'border-slate-600 bg-slate-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-2xl mb-1">{template.preview}</div>
                          <div className="text-xs font-medium text-gray-700">{template.name}</div>
                        </button>
                      ))}
                    </div>
                    
                    {frame !== 'none' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Texto del Marco
                        </label>
                        <input
                          type="text"
                          value={frameText}
                          onChange={(e) => setFrameText(e.target.value)}
                          placeholder="SCAN ME"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <button
                onClick={() => toggleAccordion('logo')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-500 text-white rounded-lg flex items-center justify-center text-sm font-semibold">3</div>
                  Logo Personalizado
                  {logoPreview && <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>}
                </h3>
                {accordionState.logo ? 
                  <ChevronDown className="w-5 h-5 text-slate-600" /> : 
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                }
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                accordionState.logo ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 pb-6 border-t border-gray-100">
                  {logoPreview ? (
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <Image src={logoPreview} alt="Logo" width={48} height={48} className="w-12 h-12 object-cover rounded-lg" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{logoFile?.name}</p>
                          <p className="text-sm text-green-600">Logo cargado</p>
                        </div>
                        <button
                          onClick={removeLogo}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">Tamaño</label>
                            <span className={`text-sm font-bold ${logoSize > 25 ? 'text-orange-600' : logoSize === 30 ? 'text-red-600' : 'text-slate-600'}`}>
                              {logoSize}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="30"
                            value={logoSize}
                            onChange={(e) => setLogoSize(Math.min(30, Number(e.target.value)))}
                            className="w-full"
                          />
                          {logoSize > 25 && (
                            <div className={`mt-1 text-xs p-2 rounded ${logoSize === 30 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                              ⚠️ {logoSize === 30 ? 'Tamaño máximo para mantener legibilidad' : 'Tamaños grandes pueden afectar la lectura del QR'}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Estilo</label>
                          <select
                            value={logoStyle}
                            onChange={(e) => setLogoStyle(e.target.value as typeof logoStyle)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="rounded">Redondeado</option>
                            <option value="circle">Círculo</option>
                            <option value="square">Cuadrado</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-slate-400 hover:bg-slate-50 mt-4"
                    >
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 font-medium">Sube tu logo</p>
                      <p className="text-sm text-gray-500">PNG, JPG, SVG hasta 5MB</p>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <button
                onClick={() => toggleAccordion('styling')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-400 text-white rounded-lg flex items-center justify-center text-sm font-semibold">4</div>
                  Personalización Básica
                </h3>
                {accordionState.styling ? 
                  <ChevronDown className="w-5 h-5 text-slate-600" /> : 
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                }
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                accordionState.styling ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="space-y-6 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Estilo de Módulos</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'squares', name: 'Cuadrados', icon: '⬛' },
                          { id: 'rounded', name: 'Redondeados', icon: '⬜' },
                          { id: 'dots', name: 'Círculos', icon: '⚫' },
                          { id: 'diamond', name: 'Diamantes', icon: '🔶' },
                          { id: 'hexagon', name: 'Hexágonos', icon: '⬢' }
                        ].map((style) => (
                          <button
                            key={style.id}
                            onClick={() => setQrStyle(style.id as QRStyle)}
                            className={`p-2 rounded-lg text-center transition-all ${
                              qrStyle === style.id
                                ? 'bg-slate-700 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <div className="text-sm mb-1">{style.icon}</div>
                            <div className="text-xs font-medium">{style.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Esquemas de Color</label>
                      <div className="space-y-2">
                        {[
                          { id: 'gradient', name: 'Elegante', colors: ['#334155', '#64748b'] },
                          { id: 'ocean', name: 'Azul Océano', colors: ['#0369A1', '#0284C7'] },
                          { id: 'sunset', name: 'Atardecer', colors: ['#DC2626', '#F59E0B'] },
                          { id: 'forest', name: 'Verde Bosque', colors: ['#166534', '#16A34A'] },
                          { id: 'purple', name: 'Púrpura', colors: ['#7C2D92', '#A855F7'] },
                          { id: 'neon', name: 'Neón', colors: ['#FF00FF', '#00FFFF'] },
                          { id: 'rainbow', name: 'Arcoíris', colors: ['#FF0080', '#8000FF'] },
                          { id: 'monochrome', name: 'Monocromático', colors: ['#000000', '#404040'] }
                        ].map((scheme) => (
                          <button
                            key={scheme.id}
                            onClick={() => setColorScheme(scheme.id as QRColorScheme)}
                            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${
                              colorScheme === scheme.id
                                ? 'bg-slate-50 border-2 border-slate-500'
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div
                              className="w-6 h-6 rounded shadow-sm"
                              style={{
                                background: `linear-gradient(135deg, ${scheme.colors[0]}, ${scheme.colors[1]})`
                              }}
                            />
                            <span className="text-sm font-medium">{scheme.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 border-l-4 border-slate-600">
              <button
                onClick={() => toggleAccordion('advanced')}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-slate-600" />
                  Configuración Avanzada
                </h3>
                {accordionState.advanced ? 
                  <ChevronDown className="w-5 h-5 text-slate-600" /> : 
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                }
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                accordionState.advanced ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="space-y-6 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Tamaño: {size}px
                        </label>
                        <input
                          type="range"
                          min="200"
                          max="800"
                          value={size}
                          onChange={(e) => setSize(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Margen: {margin}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          value={margin}
                          onChange={(e) => setMargin(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Rotación: {rotation}°
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={rotation}
                          onChange={(e) => setRotation(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Opacidad: {opacity}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={opacity}
                          onChange={(e) => setOpacity(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Efectos Especiales</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'none', name: 'Sin Efecto', icon: '◯' },
                          { id: 'shadow', name: 'Sombra', icon: '◐' },
                          { id: 'glow', name: 'Brillo', icon: '◉' },
                          { id: 'outline', name: 'Contorno', icon: '◎' }
                        ].map((fx) => (
                          <button
                            key={fx.id}
                            onClick={() => setEffect(fx.id as QREffect)}
                            className={`p-3 rounded-lg text-center transition-all ${
                              effect === fx.id
                                ? 'bg-slate-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <div className="text-lg mb-1">{fx.icon}</div>
                            <div className="text-xs font-medium">{fx.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {colorScheme === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Colores Personalizados</label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-gray-600">Primario</label>
                            <input
                              type="color"
                              value={customColors.primary}
                              onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                              className="w-full h-10 rounded border"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Secundario</label>
                            <input
                              type="color"
                              value={customColors.secondary}
                              onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                              className="w-full h-10 rounded border"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-600">Fondo</label>
                            <input
                              type="color"
                              value={customColors.background}
                              onChange={(e) => setCustomColors(prev => ({ ...prev, background: e.target.value }))}
                              className="w-full h-10 rounded border"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center flex items-center justify-center gap-2">
                <Eye className="w-5 h-5" />
                Vista Previa Profesional
              </h3>
              
              <div className="bg-gray-50 rounded-2xl p-8 flex justify-center">
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    className="rounded-2xl shadow-2xl border-4 border-white max-w-full"
                    style={{ maxWidth: '400px', height: 'auto' }}
                  />
                  
                  {(!isLoaded || isGenerating) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 rounded-2xl">
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-lg font-semibold text-slate-800">
                          {isGenerating ? '✨ Creando magia...' : '🚀 Preparando...'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Calidad vectorial profesional</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isLoaded && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 text-center">
                  Descargar QR Code
                </h3>
                
                <div className="space-y-2">
                  <button
                    onClick={downloadSVG}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      <span>SVG</span>
                    </div>
                    <span className="text-sm text-slate-300">Vectorial</span>
                  </button>
                  
                  <button
                    onClick={downloadPNG}
                    className="w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      <span>PNG</span>
                    </div>
                    <span className="text-sm text-slate-300">Alta calidad</span>
                  </button>
                  
                  <button
                    onClick={downloadJPEG}
                    className="w-full bg-slate-500 hover:bg-slate-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      <span>JPEG</span>
                    </div>
                    <span className="text-sm text-slate-300">Comprimido</span>
                  </button>
                </div>
                
                <p className="text-center text-gray-500 text-sm mt-4">
                  Elige el formato que mejor se adapte a tus necesidades
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}