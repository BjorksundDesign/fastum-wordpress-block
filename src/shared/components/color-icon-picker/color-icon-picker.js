import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { PanelRow, Button, ToolbarGroup, ToolbarDropdownMenu, TextControl } from '@wordpress/components';
import { ColorPalette} from '@wordpress/block-editor';
import './color-icon-picker.scss'



// Default presets if none provided
const COMMON_FA = [
  { label: 'Check',         hex: 'f00c' },
  { label: 'Chevron Right', hex: 'f054' },
  { label: 'Chevron Left',  hex: 'f053' },
  { label: 'Angle Right',   hex: 'f105' },
  { label: 'Caret Right',   hex: 'f0da' },
  { label: 'Arrow Right',   hex: 'f061' },
  { label: 'Circle',        hex: 'f111' },
  { label: 'Dot Circle',    hex: 'f192' },
  { label: 'Square',        hex: 'f0c8' },
  { label: 'Star',          hex: 'f005' },
];

/**
 * Icon + Color picker row
 */
export function IconColorPickerRow({
  color = '#000000',
  onColorChange,
  iconHex,                // optional
  onIconChange,
  presets = COMMON_FA,    // fallback presets
  allowManualHex = true,
  label = __('Color'),
  dropdownLabel = __('List icon presets'),
}) {
  const [isOpen, setIsOpen] = useState(false);

  const hasPresets = Array.isArray(presets) && presets.length > 0;
  const showIconUI = Boolean(iconHex) || hasPresets;

  const previewStyle = showIconUI
    ? { '--faIcon': `"\u005c${iconHex || 'f00c'}"`, '--iconColor': color || '#000000' }
    : undefined;

  return (
    <>
      <PanelRow className="grid icon-color-picker-wrapper">
            {hasPresets && (
              <div className="icon-picker-dropdown inspector-button">
              <ToolbarDropdownMenu
                label={dropdownLabel}
                icon={<span className="fa-swatch" style={previewStyle} />}
                controls={presets.map(({ label, hex }) => ({
                  title: label,
                  icon: (
                    <span
                    className="fa-swatch"
                    style={{ '--faIcon': `"\u005c${hex}"`, '--iconColor': color || '#000' }}
                    />
                  ),
                  onClick: () => onIconChange && onIconChange(hex),
                }))}
                />
                </div>
            )}
            {allowManualHex && typeof iconHex === 'string' && (
               <div className="icon-picker-hex-input">
              <TextControl
                value={iconHex || ''}
                className="inspector-button input"
                onChange={(v) => onIconChange && onIconChange((v || '').replace(/^\\/, '').trim())}
              />
              </div>
            )}
         <ColorPickerRow
            value={color || '#000000'}
            onChange={(c) => onColorChange && onColorChange(c)}
            minimal={true}
        />
        {/* <Button onClick={() => setIsOpen(!isOpen)} className="icon-picker-color-button">
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: color,
              border: 'solid 1px lightgrey',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 100,
            }}
          >
            {label}
          </div>
        </Button> */}
      </PanelRow>
{/* 
      {isOpen && (
        <PanelRow>
          <ColorPalette value={color || '#000000'} onChange={(c) => onColorChange && onColorChange(c)} />
        </PanelRow>
        
      )} */}
    </>
  );
}

export function ColorPickerRow({ label = __('Color'), value, onChange ,minimal=false}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <PanelRow className={`grid inspector-row ${minimal ? 'minimal grid-no-button' : 'grid-1-button'}`}>
                { !minimal ? (__('Bg color:')): ''}
        <Button className={`inspector-button icon-picker-color-button ${minimal ? 'minimal' : ''}`}  style={{
              backgroundColor: value, border: 'solid 1px lightgrey',}} onClick={() => setIsOpen(!isOpen)}>
                {value ?? 'transparent'}
        </Button>
      {isOpen && (
        <PanelRow className="color-picker-palette">
          <ColorPalette value={value} onChange={(c) => {onChange?.(c); setIsOpen(false);
          }}/>
        </PanelRow>
      )}
      </PanelRow>
    </>
  );
}
