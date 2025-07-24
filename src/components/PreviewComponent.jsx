import { useBuilder } from '../contexts/BuilderContext'

function PreviewComponent({ component }) {
  const { selectComponent, state } = useBuilder()
  const isSelected = state.selectedComponent === component.id

  const handleClick = (e) => {
    e.stopPropagation()
    selectComponent(component.id)
  }

  const getClassNames = (style) => {
    const classes = []
    
    if (style.backgroundColor) {
      if (style.backgroundColor.includes('-')) {
        classes.push(`bg-${style.backgroundColor}`)
      } else {
        classes.push(`bg-${style.backgroundColor}-500`)
      }
    }
    
    if (style.textColor) {
      if (style.textColor.includes('-')) {
        classes.push(`text-${style.textColor}`)
      } else {
        classes.push(`text-${style.textColor}-500`)
      }
    }
    
    if (style.padding) classes.push(`p-${style.padding}`)
    if (style.margin) classes.push(`m-${style.margin}`)
    if (style.borderRadius) classes.push(`rounded-${style.borderRadius}`)
    if (style.border) classes.push(`border border-gray-${style.border === '1' ? '300' : '500'}`)
    
    return classes.join(' ')
  }

  const renderComponent = () => {
    const { type, props, style } = component
    const className = getClassNames(style)
    
    switch (type) {
      case 'Button':
        return (
          <button className={`${className} px-4 py-2 font-medium transition-colors hover:opacity-90 cursor-pointer`}>
            {props.text || 'Button'}
          </button>
        )
      
      case 'Input':
        return (
          <input
            type={props.type || 'text'}
            placeholder={props.placeholder || ''}
            className={`${className} border border-gray-300 px-3 py-2 focus:outline-none focus:border-blue-500 min-w-48`}
            readOnly
          />
        )
      
      case 'Text':
        const isHeading = props.text && (
          props.text.length < 50 && 
          (props.text.includes('Welcome') || props.text.includes('Build') || props.text.includes('Contact'))
        )
        
        if (isHeading) {
          return (
            <h2 className={`${className} text-2xl font-bold`}>
              {props.text || 'Heading'}
            </h2>
          )
        }
        
        return (
          <p className={`${className} max-w-lg`}>
            {props.text || 'Text content'}
          </p>
        )
      
      case 'Card':
        return (
          <div className={`${className} shadow-sm min-h-32 min-w-64 max-w-md`}>
            {component.children?.length > 0 ? (
              component.children.map(child => renderComponent(child))
            ) : (
              <div className="text-gray-500 text-sm">
                {props.content || 'Card container'}
              </div>
            )}
          </div>
        )
      
      case 'Image':
        return (
          <img
            src={props.src || 'https://via.placeholder.com/300x200?text=Image'}
            alt={props.alt || 'Image'}
            className={`${className} max-w-64 h-auto`}
          />
        )
      
      case 'Grid':
        return (
          <div className={`${className} min-h-16 min-w-full`}>
            {props.content && (
              <div className="text-gray-500 text-sm mb-2">{props.content}</div>
            )}
          </div>
        )
      
      default:
        return (
          <div className={`${className} p-4 border border-dashed border-gray-400`}>
            Unknown component: {type}
          </div>
        )
    }
  }

  return (
    <div
      className={`
        absolute cursor-pointer transition-all duration-300 group
        ${isSelected ? 'ring-2 ring-violet-500 ring-offset-4 ring-offset-white/50' : ''}
        hover:ring-2 hover:ring-indigo-400 hover:ring-offset-2 hover:ring-offset-white/30
        transform hover:scale-105
      `}
      style={{
        left: component.position.x,
        top: component.position.y,
      }}
      onClick={handleClick}
    >
      {/* Component Content */}
      <div className="relative">
        {renderComponent()}

        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>

      {/* Enhanced Selection Label */}
      {isSelected && (
        <div className="absolute -top-8 left-0 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-3 py-1 text-xs font-bold rounded-lg shadow-glow z-10 animate-fade-in">
          {component.type}
        </div>
      )}

      {/* Hover tooltip */}
      {!isSelected && (
        <div className="absolute -top-8 left-0 bg-gray-800/90 backdrop-blur-sm text-white px-3 py-1 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          Click to select {component.type}
        </div>
      )}
    </div>
  )
}

export default PreviewComponent
