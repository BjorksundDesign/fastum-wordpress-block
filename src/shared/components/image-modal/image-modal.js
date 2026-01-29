// ImageUpload.js
import { MediaUpload } from '@wordpress/block-editor';
import { Button, PanelRow, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Image } from '@10up/block-components';
import React, { useMemo, useState } from 'react';
import { useSelect } from '@wordpress/data';

const useAttachmentMeta = (id) => {
  return useSelect(
    (select) => {
      if (!id) return { title: '', alt: '' };
      const media = select('core')?.getMedia?.(id);
      const title =
        media?.title?.rendered ||
        media?.title ||
        media?.slug ||
        '';
      const alt =
        media?.alt_text ||
        '';
      return { title, alt };
    },
    [id]
  );
};

const formatTooltip = ({ title, alt }) => {
  const t = (title || '').trim();
  const a = (alt || '').trim();
  if (!t && !a) return '';
  if (t && a) return `${t} — ${a}`;
  return t || a;
};



export function ImageModalInspector({ item, onChange, imageTitle }){
  const [isHovered, setIsHovered] = useState(false); 

  // 1) Fetch title + alt
const meta = useAttachmentMeta(item.image);
const hasTitle = !!(meta?.title || '').trim();
const hasAlt = !!(meta?.alt || '').trim();

const titleText = hasTitle ? meta.title : __('Saknas');
const altText = hasAlt ? meta.alt : __('Saknas');

  const tooltipText = useMemo(() => formatTooltip(meta), [meta]);

  const handleImageChange = (media) => {
        onChange(item.id, media?.id ?? null);        
  };

  return (
    <PanelRow className={`grid grid-${item.image? '1' : '2'}-button  inspector-row`}>
        {imageTitle ?? 'Image:'}
        <MediaUpload
          // 2) Preselect current image in media library
          value={item.image || undefined}
          onSelect={handleImageChange}
          allowedTypes={['image']}
          render={({ open }) => (
            <>
        {item.image ? (
            <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ position: 'relative' }} // Ensures the button is positioned correctly
            >
                  <Image
                    id={item.image}
                    size="large"
                    className="text-modal-img"
                  />
           {/* 1) Show Title + Alt in inspector */}
                <div className="image-meta">
                   <div className="image-meta__row">
                      <strong>{__('Title')}:</strong>{' '}
                       <span className={hasTitle ? '' : 'is-missing'}>{titleText}</span>
                  </div>
                  <div className="image-meta__row">
                      <strong>{__('Alt')}:</strong>{' '}
                      <span className={hasAlt ? '' : 'is-missing'}>{altText}</span>
                  </div>
                  </div>
          
          {isHovered && (
              <div className="image-button-overlay-wrapper">
              <Button
                onClick={open}
                primary
                className="inspector-button"
                >
                {__('Change')}
              </Button>
              <Button
                onClick={() => onChange(item.id, null)} // Clear the image
                className="inspector-button"
                >
                {__('Remove')}
              </Button>
            </div>
          )}
        </div>
      ) : (
            <>
              <Button onClick={open} className="inspector-button" primary>
                  {__('Select')}
                </Button>
                <Button 
                  onClick={() => onChange(item.id, null, 'remove')} 
                  className="inspector-button" 
                  primary>
                  {__('Remove')}
                </Button>
              </>
            )}
        </>
        )}
        />
    </PanelRow>
  );
};

export function ImageModalRender({ item, onChange, attributes}){
  const [isHovered, setIsHovered] = useState(false);

 // 1) Fetch title + alt for tooltip
const meta = useAttachmentMeta(item.image);
const hasTitle = !!(meta?.title || '').trim();
const hasAlt = !!(meta?.alt || '').trim();

const titleText = hasTitle ? meta.title : __('Saknas');
const altText = hasAlt ? meta.alt : __('Saknas');

  const handleImageChange = (media) => {
        onChange(item.id, media?.id ?? null);
  };
  

  const imgEl = (
    <Image
      id={item.image}
      size="large"
      style={{
        width: attributes.imageWidth,
        aspectRatio: attributes.imageAspect,
        objectFit: attributes.imageSize,
      }}
      className={`text-modal-img ${attributes.imageAspectRatio} ${attributes.imageSizing} ${attributes.imageWidth}`}
      onSelect={handleImageChange}
    />
  );

  return (
    <PanelRow className="grid grid-image">
        <MediaUpload
          value={item.image || undefined} 
          onSelect={handleImageChange}
          allowedTypes={['image']}
          render={({ open }) => (
            <>
        {item.image ? (
            // <div
            // onMouseEnter={() => setIsHovered(true)}
            // onMouseLeave={() => setIsHovered(false)}
            // className={`image-container ${attributes.imageSize}`}
            // style={{ position: 'relative' }} // Ensures the button is positioned correctly
            // >
            

            <div
                className="image-render-wrap"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                  <div
                  className={`image-container ${attributes.imageSize}`}
                  style={{ position: 'relative' }}
                >
              {imgEl}
          {isHovered && (
             <div className="image-hover-meta">
                      <div className="image-hover-meta__row">
                        <strong>{__('Title')}:</strong>{' '}
                        <span className={hasTitle ? '' : 'is-missing'}>{titleText}</span>
                      </div>
                      <div className="image-hover-meta__row">
                        <strong>{__('Alt')}:</strong>{' '}
                        <span className={hasAlt ? '' : 'is-missing'}>{altText}</span>
                      </div>
                    </div>
          )}
              <div className={`image-actions ${isHovered ? 'is-visible' : 'not-visible'}`}
               onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                  <Button onClick={open} variant="primary" className="inspector-button">
                    {__('Change')}
                  </Button>
                  <Button onClick={() => onChange(item.id, null)} className="inspector-button">
                    {__('Remove')}
                  </Button>
                </div>
          </div>
          </div>
      ) : (
          <Button onClick={open} className="inspector-button" primary>
              {__('Select Image')}
            </Button>
            )}
        </>
        )}
        />
    </PanelRow>
  );
};