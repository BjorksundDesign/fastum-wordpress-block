// ImageUpload.js
import { MediaUpload } from '@wordpress/block-editor';
import { Button, PanelRow } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Image } from '@10up/block-components';
import React, { useState } from 'react';

export function ImageModalInspector({ item, onChange, imageTitle }){
  const [isHovered, setIsHovered] = useState(false); 
  const handleImageChange = (media) => {
        onChange(item.id, media?.id ?? null);        
  };

  return (
    <PanelRow className={`grid grid-${item.image? '1' : '2'}-button  inspector-row`}>
        {imageTitle ?? 'Image:'}
        <MediaUpload
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
            className={`text-modal-img`}
            // onSelect={handleImageChange} // Update the image when selected
            />
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
                <Button onClick={() => onChange(item.id, null, 'remove')} className="inspector-button" primary>
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
  const handleImageChange = (media) => {
        onChange(item.id, media?.id ?? null);
  };

  return (
    <PanelRow className="grid grid-image">
        <MediaUpload
          onSelect={handleImageChange}
          allowedTypes={['image']}
          render={({ open }) => (
            <>
        {item.image ? (
            <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`image-container ${attributes.imageSize}`}
            style={{ position: 'relative' }} // Ensures the button is positioned correctly
            >
          <Image
            id={item.image}
            size="large"
            style={{width : attributes.imageWidth, aspectRatio : attributes.imageAspect, objectFit: attributes.imageSize}}
            className={`text-modal-img ${attributes.imageAspectRatio} ${attributes.imageSizing} ${attributes.imageWidth}`}
            onSelect={handleImageChange} // Update the image when selected
            />
          {isHovered && (
             <div className="image-button-overlay-wrapper">
              <Button
                onClick={open}
                primary
                className="inspector-button"
                >
                {__('Change Image')}
              </Button>
              <Button
                onClick={() => onChange(item.id, null)} // Clear the image
                className="inspector-button"
                >
                {__('Remove Image')}
              </Button>
            </div>
          )}
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