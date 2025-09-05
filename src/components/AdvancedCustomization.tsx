'use client'

import { useState } from 'react'
import { Palette, Shapes, Sparkles } from 'lucide-react'

export type QRTemplate = {
  id: string
  name: string
  style: 'squares' | 'dots' | 'rounded' | 'diamond' | 'star' | 'hexagon'
  colors: { primary: string; secondary: string }
  background?: string
  pattern?: string
}

export const QR_TEMPLATES: QRTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimalista',
    style: 'rounded',
    colors: { primary: '#1F2937', secondary: '#374151' }
  },
  {
    id: 'gradient-blue',
    name: 'Azul Corporativo',
    style: 'rounded',
    colors: { primary: '#1E40AF', secondary: '#3B82F6' }
  },
  {
    id: 'sunset',
    name: 'Atardecer',
    style: 'dots',
    colors: { primary: '#DC2626', secondary: '#F59E0B' }
  },
  {
    id: 'forest',
    name: 'Bosque',
    style: 'hexagon',
    colors: { primary: '#166534', secondary: '#16A34A' }
  },
  {
    id: 'ocean',
    name: 'Océano',
    style: 'diamond',
    colors: { primary: '#0369A1', secondary: '#0EA5E9' }
  },
  {
    id: 'purple-dream',
    name: 'Sueño Púrpura',
    style: 'star',
    colors: { primary: '#7C2D92', secondary: '#A855F7' }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    style: 'squares',
    colors: { primary: '#EC4899', secondary: '#06B6D4' }
  },
  {
    id: 'retro',
    name: 'Retro',
    style: 'dots',
    colors: { primary: '#F59E0B', secondary: '#EF4444' }
  }
]

interface AdvancedCustomizationProps {
  onTemplateSelect: (template: QRTemplate) => void
  onStyleChange: (style: string) => void
  onColorsChange: (colors: { primary: string; secondary: string }) => void
  currentStyle: string
  currentColors: { primary: string; secondary: string }
}

export default function AdvancedCustomization({
  onTemplateSelect,
  onStyleChange,
  onColorsChange,
  currentStyle,
  currentColors
}: AdvancedCustomizationProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'styles' | 'colors' | 'effects'>('templates')
  const [customPrimary, setCustomPrimary] = useState(currentColors.primary)
  const [customSecondary, setCustomSecondary] = useState(currentColors.secondary)

  const styles = [
    { id: 'squares', name: 'Cuadrados', icon: '⬛' },
    { id: 'rounded', name: 'Redondeados', icon: '⬜' },
    { id: 'dots', name: 'Puntos', icon: '🔵' },
    { id: 'diamond', name: 'Diamante', icon: '🔶' },
    { id: 'star', name: 'Estrella', icon: '⭐' },
    { id: 'hexagon', name: 'Hexágono', icon: '⬡' }
  ]

  const colorPresets = [
    { name: 'Clásico', primary: '#000000', secondary: '#000000' },
    { name: 'Azul', primary: '#1E40AF', secondary: '#3B82F6' },
    { name: 'Verde', primary: '#166534', secondary: '#16A34A' },
    { name: 'Púrpura', primary: '#7C2D92', secondary: '#A855F7' },
    { name: 'Rosa', primary: '#BE185D', secondary: '#EC4899' },
    { name: 'Naranja', primary: '#C2410C', secondary: '#F97316' },
    { name: 'Rojo', primary: '#DC2626', secondary: '#EF4444' },
    { name: 'Cian', primary: '#0891B2', secondary: '#06B6D4' }
  ]

  const handleCustomColorsChange = () => {
    onColorsChange({ primary: customPrimary, secondary: customSecondary })
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Tabs */}
      <div className="border-b border-gray-100">
        <div className="flex">
          {[
            { id: 'templates', name: 'Plantillas', icon: Sparkles },
            { id: 'styles', name: 'Estilos', icon: Shapes },
            { id: 'colors', name: 'Colores', icon: Palette },
            { id: 'effects', name: 'Efectos', icon: Sparkles }
          ].map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'templates' | 'colors' | 'effects')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Plantillas Prediseñadas
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {QR_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => onTemplateSelect(template)}
                  className="group p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
                >
                  <div
                    className="w-full h-16 rounded-lg mb-3"
                    style={{
                      background: `linear-gradient(45deg, ${template.colors.primary}, ${template.colors.secondary})`
                    }}
                  />
                  <p className="font-medium text-gray-800 group-hover:text-blue-600">
                    {template.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {template.style}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Styles Tab */}
        {activeTab === 'styles' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Shapes className="w-5 h-5" />
              Estilos de Módulo
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {styles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => onStyleChange(style.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    currentStyle === style.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-2">{style.icon}</div>
                  <p className="font-medium">{style.name}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-700 mb-3">Vista Previa de Estilos</h4>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 ${
                      currentStyle === 'squares' ? 'bg-blue-600' :
                      currentStyle === 'rounded' ? 'bg-blue-600 rounded-sm' :
                      currentStyle === 'dots' ? 'bg-blue-600 rounded-full' :
                      currentStyle === 'diamond' ? 'bg-blue-600 transform rotate-45' :
                      currentStyle === 'star' ? 'bg-blue-600 clip-star' :
                      'bg-blue-600 clip-hexagon'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Esquemas de Color
            </h3>

            {/* Color Presets */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Presets Populares</h4>
              <div className="grid grid-cols-4 gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => onColorsChange({ primary: preset.primary, secondary: preset.secondary })}
                    className="group p-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                  >
                    <div
                      className="w-full h-8 rounded mb-2"
                      style={{
                        background: preset.primary === preset.secondary 
                          ? preset.primary 
                          : `linear-gradient(45deg, ${preset.primary}, ${preset.secondary})`
                      }}
                    />
                    <p className="text-xs font-medium text-gray-600 group-hover:text-gray-800">
                      {preset.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Colores Personalizados</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Color Primario</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      placeholder="#000000"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-2">Color Secundario (Gradiente)</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={customSecondary}
                      onChange={(e) => setCustomSecondary(e.target.value)}
                      className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={customSecondary}
                      onChange={(e) => setCustomSecondary(e.target.value)}
                      placeholder="#000000"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCustomColorsChange}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Aplicar Colores Personalizados
                </button>
              </div>
            </div>

            {/* Color Preview */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-700 mb-3">Vista Previa</h4>
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-sm"
                    style={{
                      background: `linear-gradient(45deg, ${currentColors.primary}, ${currentColors.secondary})`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Efectos Especiales
            </h3>

            <div className="space-y-6">
              {/* Pattern Overlays */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Patrones de Fondo</h4>
                <div className="grid grid-cols-3 gap-3">
                  {['none', 'dots', 'lines', 'grid', 'waves', 'noise'].map((pattern) => (
                    <button
                      key={pattern}
                      className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-all"
                    >
                      <div className={`w-full h-12 rounded bg-gradient-to-r from-blue-100 to-blue-200 mb-2 pattern-${pattern}`} />
                      <p className="text-xs font-medium capitalize">{pattern}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Animations */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Animaciones</h4>
                <div className="space-y-3">
                  {[
                    { id: 'none', name: 'Sin animación' },
                    { id: 'scan', name: 'Efecto escaneo' },
                    { id: 'pulse', name: 'Pulso' },
                    { id: 'glow', name: 'Resplandor' }
                  ].map((animation) => (
                    <label key={animation.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="animation" className="text-blue-600" />
                      <span className="font-medium">{animation.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quality Settings */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Configuración de Calidad</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Nivel de Corrección de Errores</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                      <option value="L">Bajo (7%)</option>
                      <option value="M">Medio (15%)</option>
                      <option value="Q">Cuartil (25%)</option>
                      <option value="H" selected>Alto (30%) - Recomendado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Margen</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      defaultValue="4"
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Mínimo</span>
                      <span>Máximo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}